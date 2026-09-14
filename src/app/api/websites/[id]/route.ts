import type { NextRequest } from "next/server";
import type { WebsiteSaveParams } from "@/types";

import { NextResponse } from "next/server";

import { getSupabaseServerClient, requireAdmin } from "@/lib/supabase/server";
import { buildLogoPath, validateLogoFile } from "@/lib/server/logo";
import { RESPONSE, responseMessage } from "@/lib/utils";

// 可更新字段白名单：防止客户端篡改 id / user_id / visitCount 等受保护字段
const ALLOWED_UPDATE_FIELDS = [
  "category_id",
  "name",
  "desc",
  "url",
  "logo",
  "sort",
  "pinned",
  "vpn",
  "recommend",
  "commonlyUsed",
  "tags",
] as const;

/**
 * @description: 删除网站
 * @param {Request} request
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await getSupabaseServerClient();
    const { id: siteId } = await params;

    // 校验管理员（登录 + 邮箱白名单，middleware 的 getClaims 仅解码 JWT，此处 getUser 验签兜底）
    const user = await requireAdmin();

    if (!user) {
      return NextResponse.json(
        responseMessage(null, "未登录或无权限", RESPONSE.ERROR),
        { status: 401 },
      );
    }

    const uid = user.id;
    const bucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET!;
    const folderPath = `${uid}/${siteId}`;

    /* --------------------------------------------------
     * 1. 列出该站点下所有 logo 文件
     * -------------------------------------------------- */
    const { data: files, error: listError } = await supabase.storage
      .from(bucket)
      .list(folderPath, {
        limit: 100,
      });

    if (listError) {
      return NextResponse.json(
        responseMessage(null, listError.message, RESPONSE.ERROR),
      );
    }

    /* --------------------------------------------------
     * 2. 删除所有文件（如果存在）
     * -------------------------------------------------- */
    if (files && files.length > 0) {
      const paths = files.map((file) => `${folderPath}/${file.name}`);

      const { error: removeError } = await supabase.storage
        .from(bucket)
        .remove(paths);

      if (removeError) {
        return NextResponse.json(
          responseMessage(
            null,
            `删除 Logo 失败：${removeError.message}`,
            RESPONSE.ERROR,
          ),
        );
      }
    }

    /* --------------------------------------------------
     * 3. 删除数据库中的网站记录
     * -------------------------------------------------- */
    const { data, error } = await supabase
      .from("ds_websites")
      .delete()
      .eq("id", siteId)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        responseMessage(null, error.message, RESPONSE.ERROR),
      );
    }

    return NextResponse.json(responseMessage(data));
  } catch (err) {
    return NextResponse.json(
      responseMessage(null, (err as Error).message, RESPONSE.ERROR),
    );
  }
}

/**
 * @description: 修改网站（表单数据与新 Logo 一次性提交）
 * 执行顺序：先上传新 Logo → 再 UPDATE 落库（单条语句天然原子）
 * 换 Logo 失败不会影响站点现有数据；成功后清理被替换的旧 Logo 文件
 * @param {Request} request
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await getSupabaseServerClient();
    // 校验管理员（登录 + 邮箱白名单，middleware 的 getClaims 仅解码 JWT，此处 getUser 验签兜底）
    const user = await requireAdmin();

    if (!user) {
      return NextResponse.json(
        responseMessage(null, "未登录或无权限", RESPONSE.ERROR),
        { status: 401 },
      );
    }

    // 获取动态参数
    const { id } = await params;
    // 解析请求体：data 为 JSON 字符串，file 为新 Logo 文件（可选）
    const formData = await request.formData();
    const file = formData.get("file");

    let body: Partial<WebsiteSaveParams> | null = null;

    try {
      body = JSON.parse(String(formData.get("data") ?? "null"));
    } catch {
      return NextResponse.json(responseMessage(null, "参数错误", -1));
    }

    // 仅保留白名单字段
    const data = pickUpdateFields(body as Record<string, unknown>);

    let logoPath: string | null = null;
    let oldLogo: string | null = null;

    // 1. 校验并上传新 Logo（可选）
    if (file instanceof File) {
      const invalidReason = validateLogoFile(file);

      if (invalidReason) {
        return NextResponse.json(responseMessage(null, invalidReason, -1));
      }

      // 先查出旧 Logo 路径，更新成功后用于清理
      const { data: existing } = await supabase
        .from("ds_websites")
        .select("logo")
        .eq("id", id)
        .single();

      oldLogo = existing?.logo ?? null;

      logoPath = buildLogoPath(user.id, id, file);
      const { error: uploadError } = await supabase.storage
        .from(process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET!)
        .upload(logoPath, file);

      // 上传失败直接终止，DB 现有数据（含旧 Logo）零影响，表单未关闭可原地重试
      if (uploadError) {
        return NextResponse.json(
          responseMessage(null, `Logo 上传失败: ${uploadError.message}`, -1),
        );
      }

      data.logo = logoPath;
    }

    // 2. 单条 UPDATE 原子落库
    const { data: website, error } = await supabase
      .from("ds_websites")
      .update(data)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      // 补偿：落库失败删除已上传的新文件
      if (logoPath) {
        await supabase.storage
          .from(process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET!)
          .remove([logoPath]);
      }

      // 判断是否违反唯一性约束（PostgreSQL 错误代码 23505）
      if (error.code === "23505") {
        return NextResponse.json(responseMessage(null, "网站名称已存在！", -1));
      }

      return NextResponse.json(
        responseMessage(null, error.message, RESPONSE.ERROR),
      );
    }

    // 3. 更新成功后清理被替换的旧 Logo 文件（清理失败不影响主流程，删站时会兜底清理）
    if (logoPath && oldLogo && oldLogo !== logoPath) {
      await supabase.storage
        .from(process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET!)
        .remove([oldLogo]);
    }

    // 返回更新后的网站数据
    return NextResponse.json(responseMessage(website));
  } catch (err) {
    return NextResponse.json(responseMessage(null, (err as Error).message, -1));
  }
}

/** 从请求体中仅提取白名单字段 */
function pickUpdateFields(body: Record<string, unknown>) {
  return Object.fromEntries(
    ALLOWED_UPDATE_FIELDS.filter((key) => key in body).map((key) => [
      key,
      body[key],
    ]),
  ) as Partial<WebsiteSaveParams>;
}
