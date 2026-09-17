import type { WebsiteBatchResult } from "@/types";
import type { NextRequest } from "next/server";

import { NextResponse } from "next/server";

import { getSupabaseServerClient, requireAdmin } from "@/lib/supabase/server";
import { RESPONSE, responseMessage } from "@/lib/utils";

/** 单次批量操作的 id 数量上限，防止超大请求拖垮 Logo 清理 */
const MAX_BATCH_SIZE = 1000;

/** 请求体的宽松形态：字段逐个校验后再收窄，避免对判别联合做不安全的属性访问 */
interface RawBatchBody {
  action?: unknown;
  ids?: unknown;
  category_id?: unknown;
}

/** 校验并去重 ids：非空字符串数组且不超过上限，不合法返回 null */
function normalizeIds(ids: unknown): string[] | null {
  if (!Array.isArray(ids) || ids.length === 0 || ids.length > MAX_BATCH_SIZE) {
    return null;
  }

  const unique = new Set<string>();

  for (const id of ids) {
    if (typeof id !== "string" || !id.trim()) return null;
    unique.add(id);
  }

  return Array.from(unique);
}

/**
 * @description: 网站批量操作（批量移动分类 / 批量删除）
 * 移动分类：单条 UPDATE ... IN 原子落库，分类不存在由外键约束兜底
 * 删除：与单删顺序一致，先清理各站点 Logo 文件 → 再单条 DELETE ... IN 原子落库；
 * 任一 Logo 列举/删除失败即整体中止，DB 零影响
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

    let body: RawBatchBody | null = null;

    try {
      body = (await request.json()) as RawBatchBody;
    } catch {
      return NextResponse.json(responseMessage(null, "参数错误", -1));
    }

    const ids = normalizeIds(body?.ids);

    if (!body || !ids) {
      return NextResponse.json(responseMessage(null, "参数错误", -1));
    }

    if (body.action === "moveCategory") {
      const categoryId = body.category_id;

      if (typeof categoryId !== "string" || !categoryId.trim()) {
        return NextResponse.json(responseMessage(null, "参数错误", -1));
      }

      const { data, error } = await supabase
        .from("ds_websites")
        .update({ category_id: categoryId })
        .in("id", ids)
        .select("id");

      if (error) {
        return NextResponse.json(
          responseMessage(null, error.message, RESPONSE.ERROR),
        );
      }

      const result: WebsiteBatchResult = { count: data?.length ?? 0 };

      return NextResponse.json(responseMessage(result));
    }

    if (body.action === "delete") {
      const bucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET!;
      const uid = user.id;

      /* --------------------------------------------------
       * 1. 并行列出各站点目录下的 Logo 文件（任一失败即中止，DB 零影响）
       * -------------------------------------------------- */
      const listResults = await Promise.all(
        ids.map(async (siteId) => {
          const folderPath = `${uid}/${siteId}`;
          const { data: files, error: listError } = await supabase.storage
            .from(bucket)
            .list(folderPath, { limit: 100 });

          return { folderPath, files, listError };
        }),
      );

      const paths: string[] = [];

      for (const { folderPath, files, listError } of listResults) {
        if (listError) {
          return NextResponse.json(
            responseMessage(null, listError.message, RESPONSE.ERROR),
          );
        }

        for (const file of files ?? []) {
          paths.push(`${folderPath}/${file.name}`);
        }
      }

      /* --------------------------------------------------
       * 2. 一次性删除所有 Logo 文件（如果存在）
       * -------------------------------------------------- */
      if (paths.length > 0) {
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
       * 3. 单条 DELETE ... IN 原子删除网站记录
       * -------------------------------------------------- */
      const { data, error } = await supabase
        .from("ds_websites")
        .delete()
        .in("id", ids)
        .select("id");

      if (error) {
        return NextResponse.json(
          responseMessage(null, error.message, RESPONSE.ERROR),
        );
      }

      const result: WebsiteBatchResult = { count: data?.length ?? 0 };

      return NextResponse.json(responseMessage(result));
    }

    return NextResponse.json(responseMessage(null, "参数错误", -1));
  } catch (err) {
    return NextResponse.json(
      responseMessage(null, (err as Error).message, RESPONSE.ERROR),
    );
  }
}
