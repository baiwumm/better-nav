import type { NextRequest } from "next/server";

import { NextResponse } from "next/server";

import { getSupabaseServerClient, requireAdmin } from "@/lib/supabase/server";
import { RESPONSE, responseMessage } from "@/lib/utils";

/**
 * @description: 上传网站 Logo
 * @param {Request} request
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await getSupabaseServerClient();
    // 获取动态参数
    const { id } = await params;
    // 解析请求体
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(responseMessage(null, "缺少 file 参数", -1));
    }

    // 校验管理员（登录 + 邮箱白名单，middleware 的 getClaims 仅解码 JWT，此处 getUser 验签兜底）
    const user = await requireAdmin();

    if (!user) {
      return NextResponse.json(
        responseMessage(null, "未登录或无权限", RESPONSE.ERROR),
        { status: 401 },
      );
    }

    // 文件路径
    const bucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET!;
    const ext = file.name.split(".").pop();
    const logoPath = `${user.id}/${id}/${crypto.randomUUID()}.${ext}`;

    // 上传 logo
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(logoPath, file);

    if (uploadError) {
      // ❗兜底：logo 失败，站点已创建，但不影响使用
      return NextResponse.json(
        responseMessage(
          { id },
          `站点创建成功，但 Logo 上传失败: ${uploadError}`,
          -1,
        ),
      );
    }

    // 4️⃣ 回写 logo_path
    const { data, error: updateError } = await supabase
      .from("ds_websites")
      .update({ logo: logoPath })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      // ❗兜底：回滚 Storage
      await supabase.storage.from(bucket).remove([logoPath]);

      return NextResponse.json(responseMessage(null, updateError.message, -1));
    }

    return NextResponse.json(responseMessage(data));
  } catch (err) {
    return NextResponse.json(responseMessage(null, (err as Error).message, -1));
  }
}
