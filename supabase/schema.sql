-- ============================================================
-- Better Nav — 数据库初始化脚本
--
-- 用途：在全新的 Supabase 项目上执行一次，建好本项目的全部数据结构：
--       表 / 函数 / 触发器 / 行级安全（RLS）/ 存储桶与桶策略。
--
-- 用法：
--   1. 到 Supabase Dashboard → SQL Editor，整段粘贴本文件内容，点 Run
--   2. 需要演示数据的话，再单独执行 supabase/seed.sql
--
--   也可以用本地 psql：psql "$DATABASE_URL" -f supabase/schema.sql
--
-- ⚠️ 写权限模型是「已登录即可写」，前提是 Authentication 里关闭
--    Allow new users to sign up，账号只通过 Dashboard 的 Add user 添加。
--    开着注册跑这个脚本，任何人注册后都能改库。
--
-- ⚠️ 本脚本面向「新库」，不要在已有线上库整跑：
--    第 4 步会 DROP 并重建两张表上的全部 RLS 策略。
--
-- 幂等：可重复执行，不会破坏已有数据。
-- ============================================================


-- ---------- 1. 建表 ----------
-- gen_random_uuid() 在 PG13+ 为核心内置函数，此处显式启用只是兜底
create extension if not exists pgcrypto with schema extensions;

create table if not exists public.ds_categorys (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  "desc"     text,
  sort       smallint default 1,
  user_id    uuid default auth.uid(),
  email      text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ds_categorys_name_key unique (name)
);

create table if not exists public.ds_websites (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  "desc"         text,
  logo           text,
  url            text not null,
  tags           text[],
  sort           smallint default 1,
  pinned         boolean not null default false,
  vpn            boolean not null default false,
  recommend      boolean not null default false,
  "commonlyUsed" boolean not null default false,
  "visitCount"   integer not null default 0,
  category_id    uuid,
  user_id        uuid default auth.uid(),
  email          text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  constraint ds_websites_name_key unique (name),
  -- 故意不加 on delete cascade：分类下还有站点时删除分类会被外键拒绝，
  -- 级联会连带删掉站点数据（与线上现有行为一致）
  constraint ds_websites_category_id_fkey foreign key (category_id)
    references public.ds_categorys (id)
);

-- 列表查询与外键校验都按 category_id 过滤
create index if not exists idx_ds_websites_category_id
  on public.ds_websites (category_id);

-- 列名说明：visitCount / commonlyUsed 是历史遗留的驼峰列名，前端类型与
-- PostgREST 返回字段都直接用它，改名会牵连一整条链路，故沿用。


-- ---------- 2. updated_at 触发器 ----------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
declare
  new_row jsonb := to_jsonb(new);
  old_row jsonb := to_jsonb(old);
begin
  -- 只变了 visitCount 的更新来自首页点击计数，不算内容变更，
  -- 否则后台「更新时间」会随访客点击一直跳动
  if new_row - 'visitCount' = old_row - 'visitCount' then
    new.updated_at := old.updated_at;
  else
    new.updated_at := now();
  end if;

  return new;
end;
$$;

drop trigger if exists trg_ds_categorys_updated_at on public.ds_categorys;
create trigger trg_ds_categorys_updated_at
  before update on public.ds_categorys
  for each row execute function public.set_updated_at();

drop trigger if exists trg_ds_websites_updated_at on public.ds_websites;
create trigger trg_ds_websites_updated_at
  before update on public.ds_websites
  for each row execute function public.set_updated_at();


-- ---------- 3. 访问计数 RPC ----------
-- 首页卡片点击后调用 increment_visit_count(row_id)。
-- 必须 security definer：表开了 RLS 之后，匿名访客走 security invoker
-- 会被 ds_websites 的写策略挡住，计数会静默失效。
create or replace function public.increment_visit_count(row_id uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.ds_websites
  set "visitCount" = coalesce("visitCount", 0) + 1
  where id = row_id;
$$;

comment on function public.increment_visit_count(uuid) is
  '站点访问计数 +1，供首页卡片点击埋点使用';


-- ---------- 4. 行级安全（RLS） ----------
-- 作用：即使有人拿到浏览器里公开的 anon key 直连 Supabase REST API，
-- 也无法绕过应用层增删改数据。
alter table public.ds_categorys enable row level security;
alter table public.ds_websites enable row level security;

-- 先清空既有策略：策略是 OR 合并语义，残留的旧宽松策略会让下面的限制策略形同虚设
do $$
declare
  pol record;
begin
  for pol in
    select tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('ds_categorys', 'ds_websites')
  loop
    execute format('drop policy %I on public.%I', pol.policyname, pol.tablename);
  end loop;
end
$$;

-- 公开可读（首页 / 列表展示需要）
create policy "ds_categorys_public_read"
  on public.ds_categorys for select
  using (true);

create policy "ds_websites_public_read"
  on public.ds_websites for select
  using (true);

-- 仅已登录用户可写（注册已关闭，账号都由 Dashboard 添加，登录即受信任）
create policy "ds_categorys_authenticated_write"
  on public.ds_categorys for all
  to authenticated
  using (true)
  with check (true);

create policy "ds_websites_authenticated_write"
  on public.ds_websites for all
  to authenticated
  using (true)
  with check (true);


-- ---------- 5. 存储桶与桶策略 ----------
-- 桶名需与 NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET 一致（默认 logos）
insert into storage.buckets (id, name, public)
values ('logos', 'logos', true)
on conflict (id) do nothing;

-- Logo 通过 /storage/v1/object/public/... 直链读取，需要放开匿名读
drop policy if exists "logos_public_read" on storage.objects;
create policy "logos_public_read"
  on storage.objects for select
  using (bucket_id = 'logos');

-- 上传 / 替换 / 删除仅已登录用户（应用侧用登录用户的 JWT 调用 Storage API）
drop policy if exists "logos_authenticated_write" on storage.objects;
create policy "logos_authenticated_write"
  on storage.objects for all
  to authenticated
  using (bucket_id = 'logos')
  with check (bucket_id = 'logos');


-- ---------- 6. 授权与收尾 ----------
-- 显式授权，不依赖 Supabase 的 default privileges 配置。
-- 写权限实际由上面的 RLS 策略兜底，这里只是放开角色到表的入口。
grant usage on schema public to anon, authenticated, service_role;

grant select, insert, update, delete
  on public.ds_categorys, public.ds_websites
  to anon, authenticated, service_role;

revoke execute on function public.increment_visit_count(uuid) from public;
grant execute on function public.increment_visit_count(uuid)
  to anon, authenticated, service_role;

-- 让 PostgREST 立刻感知新表新函数，否则首次访问可能报
-- "Could not find the table 'public.ds_websites' in the schema cache"
notify pgrst, 'reload schema';


-- ============================================================
-- 自检查询（手动单独执行，确认初始化结果）
--
-- 1) 表与列
--    select table_name, column_name, data_type
--    from information_schema.columns
--    where table_schema = 'public'
--      and table_name in ('ds_categorys', 'ds_websites')
--    order by 1, 2;
--
-- 2) RLS 策略清单
--    select schemaname, tablename, policyname, cmd
--    from pg_policies
--    where schemaname = 'public'
--      and tablename in ('ds_categorys', 'ds_websites', 'objects')
--    order by 2, 3;
--
-- 3) 函数与 SECURITY DEFINER 标记
--    select p.proname, p.prosecdef
--    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
--    where n.nspname = 'public'
--      and p.proname in ('increment_visit_count', 'set_updated_at');
--
-- 4) 存储桶
--    select id, public from storage.buckets where id = 'logos';
-- ============================================================
