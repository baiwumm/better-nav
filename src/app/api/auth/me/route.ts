import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/supabase/server";
import { responseMessage } from "@/lib/utils";

/**
 * @description: 查询当前登录用户是否为管理员（登录 + 邮箱白名单），供前端控制后台入口显示
 */
export async function GET() {
  try {
    const admin = await requireAdmin();

    return NextResponse.json(
      responseMessage({
        isAdmin: !!admin,
        email: admin?.email ?? null,
      }),
    );
  } catch (err) {
    return NextResponse.json(responseMessage(null, (err as Error).message, -1));
  }
}
