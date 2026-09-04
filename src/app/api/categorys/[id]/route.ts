import type { NextRequest } from "next/server";

import { NextResponse } from "next/server";

import { getSupabaseServerClient, requireAdmin } from "@/lib/supabase/server";
import { RESPONSE, responseMessage } from "@/lib/utils";

/**
 * @description: 删除分类
 * @param {Request} request
 */
export async function DELETE(
  request: Request,
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

    const { id } = await params;

    // 删除分类
    const { data, error } = await supabase
      .from("ds_categorys")
      .delete()
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        responseMessage(null, error.message, RESPONSE.ERROR),
      );
    }

    // 返回成功响应
    return NextResponse.json(responseMessage(data));
  } catch (err) {
    return NextResponse.json(responseMessage(null, (err as Error).message, -1));
  }
}

/**
 * @description: 修改分类
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
    // 解析请求体（仅保留可更新字段白名单，防止篡改 id 等受保护字段）
    const body = (await request.json()) as Record<string, unknown>;
    const allowedBody = Object.fromEntries(
      ["name", "sort"]
        .filter((key) => key in body)
        .map((key) => [key, body[key]]),
    );

    // 更新分类
    const { data, error } = await supabase
      .from("ds_categorys")
      .update(allowedBody)
      .eq("id", id)
      .select()
      .single();

    // 如果插入失败
    if (error) {
      // 判断是否违反唯一性约束（PostgreSQL 错误代码 23505）
      if (error.code === "23505") {
        return NextResponse.json(responseMessage(null, "分类名称已存在！", -1));
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
