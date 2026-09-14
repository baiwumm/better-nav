import type { NextRequest } from "next/server";
import type { WebsiteSaveParams } from "@/types";

import { NextResponse } from "next/server";

import { getSupabaseServerClient, requireAdmin } from "@/lib/supabase/server";
import { buildLogoPath, validateLogoFile } from "@/lib/server/logo";
import { RESPONSE, responseMessage } from "@/lib/utils";

/**
 * @description: 查询网站列表
 * @param {Request} request
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient();
    // 解析 URL 查询参数
    const searchParams = request.nextUrl.searchParams;
    const pageIndex = Number(searchParams.get("pageIndex") || "0");
    const pageSize = Number(searchParams.get("pageSize") || "10");
    const name = searchParams.get("name");
    const category_id = searchParams.get("category_id");

    // 判断参数
    if (
      Number.isNaN(pageIndex) ||
      Number.isNaN(pageSize) ||
      pageIndex < 0 ||
      pageSize <= 0
    ) {
      return NextResponse.json(
        responseMessage(null, "参数错误", RESPONSE.ERROR),
      );
    }

    // 计算分页
    const start = pageIndex * pageSize;
    const end = start + pageSize - 1;

    // 查询 sql
    let sqlQuery = supabase
      .from("ds_websites")
      .select("*,category:ds_categorys(*)", { count: "exact" })
      .range(start, end)
      .order("pinned", {
        ascending: false,
      })
      .order("sort", {
        ascending: false,
      })
      .order("recommend", {
        ascending: false,
      })
      .order("created_at", {
        ascending: false,
      });

    // 判断查询参数
    if (name) {
      sqlQuery = sqlQuery.like("name", `%${name}%`);
    }
    if (category_id) {
      sqlQuery = sqlQuery.eq("category_id", category_id);
    }

    // 请求列表
    const { data, error, count } = await sqlQuery;

    // 执行失败
    if (error) {
      return NextResponse.json(
        responseMessage(null, error.message, RESPONSE.ERROR),
      );
    }

    return NextResponse.json(
      responseMessage({
        list: data,
        total: count,
        page: pageIndex + 1,
        pageSize,
      }),
    );
  } catch (err) {
    return NextResponse.json(responseMessage(null, (err as Error).message, -1));
  }
}

/**
 * @description: 新增网站（表单数据与 Logo 一次性提交）
 * 执行顺序：先上传 Logo → 再 INSERT 落库（单条语句天然原子）
 * 任一步失败都不会留下半成品数据：上传失败 DB 零影响；落库失败补偿删除已传文件
 * @param {Request} request
 */
export async function POST(request: NextRequest) {
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

    // 解析请求体：data 为 JSON 字符串，file 为 Logo 文件
    const formData = await request.formData();
    const file = formData.get("file");

    let data: Partial<WebsiteSaveParams> | null = null;

    try {
      data = JSON.parse(String(formData.get("data") ?? "null"));
    } catch {
      return NextResponse.json(responseMessage(null, "参数错误", -1));
    }

    if (!data?.name || !data?.url || !data?.category_id) {
      return NextResponse.json(responseMessage(null, "参数错误", -1));
    }

    // 服务端生成站点 id，Logo 路径依赖它，避免落库后还要回写
    const siteId = crypto.randomUUID();
    let logoPath: string | null = null;

    // 1. 校验并上传 Logo（新增必传）
    if (file instanceof File) {
      const invalidReason = validateLogoFile(file);

      if (invalidReason) {
        return NextResponse.json(responseMessage(null, invalidReason, -1));
      }

      logoPath = buildLogoPath(user.id, siteId, file);
      const { error: uploadError } = await supabase.storage
        .from(process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET!)
        .upload(logoPath, file);

      // 上传失败直接终止，DB 零影响，表单未关闭可原地重试
      if (uploadError) {
        return NextResponse.json(
          responseMessage(null, `Logo 上传失败: ${uploadError.message}`, -1),
        );
      }
    }

    // 2. 单条 INSERT 原子落库（含 id 与 logo 路径）
    const { data: website, error } = await supabase
      .from("ds_websites")
      .insert({ ...data, id: siteId, logo: logoPath })
      .select()
      .single();

    if (error) {
      // 补偿：落库失败删除已上传的孤儿文件
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

    return NextResponse.json(responseMessage(website));
  } catch (err) {
    return NextResponse.json(responseMessage(null, (err as Error).message, -1));
  }
}
