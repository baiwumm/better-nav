-- ============================================================
-- Better Nav — 演示数据（可选）
--
-- 用途：初始化后灌一点示例分类和站点，避免首页是一片空白。
--       正式使用时可以跳过本文件，或跑完后再按下方注释清理。
--
-- 用法：先执行 supabase/schema.sql，再整段执行本文件。
-- 幂等：全部 on conflict do nothing，重复执行不会产生重复行。
-- ============================================================

insert into public.ds_categorys (name, "desc", sort)
values
  ('设计灵感', '界面与视觉参考', 90),
  ('开发工具', '日常写码会打开的站点', 80),
  ('AI 助手',   '对话、补全与检索', 70),
  ('效率办公', '文档、协作与日程', 60)
on conflict do nothing;

insert into public.ds_websites (
  name, "desc", url, tags, sort, pinned, vpn, recommend, "commonlyUsed", category_id
) values
  (
    'Dribbble', '设计师作品与界面灵感', 'https://dribbble.com',
    array['设计', '灵感'], 99, true, false, true, true,
    (select id from public.ds_categorys where name = '设计灵感')
  ),
  (
    'Mobbin', '真实产品的移动端页面库', 'https://mobbin.com',
    array['设计', '移动端'], 88, false, false, true, false,
    (select id from public.ds_categorys where name = '设计灵感')
  ),
  (
    'Refero', 'UI 模式与页面流程参考', 'https://refero.design',
    array['设计', '参考'], 70, false, false, false, false,
    (select id from public.ds_categorys where name = '设计灵感')
  ),
  (
    'GitHub', '代码托管与协作', 'https://github.com',
    array['代码', '托管'], 99, true, false, true, true,
    (select id from public.ds_categorys where name = '开发工具')
  ),
  (
    'MDN Web Docs', 'Web 技术标准与文档', 'https://developer.mozilla.org',
    array['文档', '前端'], 92, false, false, true, true,
    (select id from public.ds_categorys where name = '开发工具')
  ),
  (
    'Can I use', '浏览器特性支持情况查询', 'https://caniuse.com',
    array['兼容性', '查询'], 74, false, false, false, false,
    (select id from public.ds_categorys where name = '开发工具')
  ),
  (
    'Vercel', '前端部署与 Serverless', 'https://vercel.com',
    array['部署', '托管'], 66, false, false, false, false,
    (select id from public.ds_categorys where name = '开发工具')
  ),
  (
    'Stack Overflow', '编程问答社区', 'https://stackoverflow.com',
    array['问答', '排错'], 60, false, false, false, false,
    (select id from public.ds_categorys where name = '开发工具')
  ),
  (
    'ChatGPT', 'OpenAI 对话助手', 'https://chat.openai.com',
    array['AI', '对话'], 99, true, true, true, true,
    (select id from public.ds_categorys where name = 'AI 助手')
  ),
  (
    'Claude', 'Anthropic 对话助手', 'https://claude.ai',
    array['AI', '对话'], 90, false, true, true, true,
    (select id from public.ds_categorys where name = 'AI 助手')
  ),
  (
    'Perplexity', '带来源引用的搜索问答', 'https://www.perplexity.ai',
    array['AI', '搜索'], 72, false, true, false, false,
    (select id from public.ds_categorys where name = 'AI 助手')
  ),
  (
    'Notion', '文档与知识库', 'https://www.notion.so',
    array['文档', '协作'], 95, true, false, true, true,
    (select id from public.ds_categorys where name = '效率办公')
  ),
  (
    'Figma', '在线协同设计', 'https://www.figma.com',
    array['设计', '协作'], 82, false, false, false, false,
    (select id from public.ds_categorys where name = '效率办公')
  ),
  (
    '飞书', 'IM、文档与日历一体化', 'https://www.feishu.cn',
    array['协作', '办公'], 76, false, false, false, false,
    (select id from public.ds_categorys where name = '效率办公')
  )
on conflict do nothing;


-- ============================================================
-- 清理演示数据（先删站点再删分类，否则外键会拒绝）
--
--   delete from public.ds_websites where category_id in (
--     select id from public.ds_categorys
--     where name in ('设计灵感', '开发工具', 'AI 助手', '效率办公')
--   );
--   delete from public.ds_categorys
--   where name in ('设计灵感', '开发工具', 'AI 助手', '效率办公');
-- ============================================================
