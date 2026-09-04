import type { NextRequest } from "next/server";

import { NextResponse } from "next/server";

import { getSupabaseServerClient, requireAdmin } from "@/lib/supabase/server";
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
 * @description: 修改网站
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
    // 解析请求体（仅保留白名单字段）
    const body = pickUpdateFields(
      (await request.json()) as Record<string, unknown>,
    );

    // 更新分类
    const { data, error } = await supabase
      .from("ds_websites")
      .update(body)
      .eq("id", id)
      .select()
      .single();

    // 如果插入失败
    if (error) {
      // 判断是否违反唯一性约束（PostgreSQL 错误代码 23505）
      if (error.code === "23505") {
        return NextResponse.json(responseMessage(null, "网站名称已存在！", -1));
      }

      // 其他错误
      return NextResponse.json(
        responseMessage(null, error.message, RESPONSE.ERROR),
      );
    }

    // 返回更新后的菜单数据
    return NextResponse.json(responseMessage(data));
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
  );
}
