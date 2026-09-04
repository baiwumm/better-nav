# Changelog

## [3.9.0](https://github.com/baiwumm/better-nav/compare/3.8.5...3.9.0) (2026-09-04)

### 🐛 Bug Fixes | Bug 修复

* 修复 Server Component 中修改 cookie 报错 ([ebc2f25](https://github.com/baiwumm/better-nav/commit/ebc2f25b90608be93df5011d1a1bb7dadf24ba9a))

### 🎫 Chores | 其他更新

* 升级所有依赖包到最新版本 ([9ee2d7e](https://github.com/baiwumm/better-nav/commit/9ee2d7eb85106f4fac080a20c0d8200d087d0f50))
* add vercel-react-best-practices skill and update AGENTS.md ([2172628](https://github.com/baiwumm/better-nav/commit/2172628c24f378482a1286e898352d5247f6d929))
* replace eslint config with better-admin's and fix lint issues ([6b6da79](https://github.com/baiwumm/better-nav/commit/6b6da79c76988d73a0fd1d3f9239556dd2d99cd0))

### ♻ Code Refactoring | 代码重构

* 将远程 Maple Mono CN 字体改为自托管方式 ([c292a4b](https://github.com/baiwumm/better-nav/commit/c292a4b4cb1139c827cd2ff7d813afa0e02d5da9))
* apply vercel-react-best-practices - extract useCallback for event handlers ([e0100f7](https://github.com/baiwumm/better-nav/commit/e0100f73bb674070264141bafa7f351e41c02c15))

## [3.8.5](https://github.com/baiwumm/better-nav/compare/3.8.4...3.8.5) (2026-08-12)

### ✨ Features | 新功能

* **auth:** 登录鉴权加固 - 三层管理员白名单与 RLS 兜底 ([f6e6de7](https://github.com/baiwumm/better-nav/commit/f6e6de76abc96addb31ce464385d161d2993f764))

### ♻ Code Refactoring | 代码重构

* **request:** 以 SWR 替换手写 useRequest 保持行为一致 ([4ce723c](https://github.com/baiwumm/better-nav/commit/4ce723c275bcf75b17719cf05df475a36a8e5a43))

## [3.8.4](https://github.com/baiwumm/better-nav/compare/3.8.3...3.8.4) (2026-08-12)

### 🎫 Chores | 其他更新

* **lint:** 升级 ESLint 至 v10 并同步 eslint 配置 ([c408858](https://github.com/baiwumm/better-nav/commit/c408858601d140315ac8873d2d54fedc09c76b22))

### 💄 Styles | 风格

* **backtop:** 移除回到顶部按钮 hover 阴影 ([cd5ebdc](https://github.com/baiwumm/better-nav/commit/cd5ebdc83c0e39ea892412de8228c38a76b96889))

## [3.8.3](https://github.com/baiwumm/better-nav/compare/3.8.2...3.8.3) (2026-08-11)

### 🎫 Chores | 其他更新

* **lint:** 修复 ESLint 检查不通过的问题 ([18465ff](https://github.com/baiwumm/better-nav/commit/18465ffaea031ff4971cafd7cd6a42d2b0c3d7a9))

### ♻ Code Refactoring | 代码重构

* 优化首屏与运行时性能并加固 API 鉴权 ([e94f60b](https://github.com/baiwumm/better-nav/commit/e94f60bea8dba87c0682fcb58f7d8311a2e3ba22))

## [3.8.2](https://github.com/baiwumm/better-nav/compare/3.8.1...3.8.2) (2026-08-11)

### 🐛 Bug Fixes | Bug 修复

* **admin:** 修复编辑网站时 Logo 被上一次新增的 Logo 覆盖 ([e0125a4](https://github.com/baiwumm/better-nav/commit/e0125a493ef2079be5d78827e3f5e696d1ef3845))
* **admin:** Logo 裁剪框跟随原图比例，支持非正方形图片 ([2824929](https://github.com/baiwumm/better-nav/commit/28249291aa51f5711e6c092642c33f6f0373779e))

### 🎫 Chores | 其他更新

* **deps:** 升级 Next.js 至 16.3.0 及配套依赖 ([9fc4ea4](https://github.com/baiwumm/better-nav/commit/9fc4ea43bf1d27d5a228139c55567fb308737640))

## [3.8.1](https://github.com/baiwumm/better-nav/compare/3.8.0...3.8.1) (2026-08-11)

### 🎫 Chores | 其他更新

* **deps:** 升级 HeroUI 至 3.2.4 并更新 Agent 文档索引 ([ba42748](https://github.com/baiwumm/better-nav/commit/ba427488ee386295ecb1a578189dfad940afc2e4))

## [3.8.0](https://github.com/baiwumm/better-nav/compare/3.7.1...3.8.0) (2026-08-11)

### ✨ Features | 新功能

* **home:** 首页新增右侧分类锚点指示器 ([198b580](https://github.com/baiwumm/better-nav/commit/198b580b04d7bf5e77b8980ad1d734180f808977))
* **transition:** 路由转场支持前进/后退方向感知滑动 ([c62cd58](https://github.com/baiwumm/better-nav/commit/c62cd589e76595ad1edf019604adef1a75feaf8f))

### 🐛 Bug Fixes | Bug 修复

* **home:** 修复客户端导航回首页时一直 loading ([041e950](https://github.com/baiwumm/better-nav/commit/041e9508ef49064a88a7cf7b45a16d9d009987af))
* **home:** 移除 Suspense 流式取数，修复客户端导航卡加载 ([7816bd4](https://github.com/baiwumm/better-nav/commit/7816bd473be66c93d408674619b4f5868214c778))
* **not-found:** 404页面适配暗黑模式并改用HeroUI Typography ([b305cdd](https://github.com/baiwumm/better-nav/commit/b305cdd311bf25fdd8b5b253e0d6d99a96c4a419))
* **og-image, proxy:** 重写OpenGraph图片生成并放行OG路由 ([880e463](https://github.com/baiwumm/better-nav/commit/880e46383647fd668ad9f3ad42476b807dda892a)), closes [#0a0a0a](https://github.com/baiwumm/better-nav/issues/0a0a0a)
* **transition:** 路由转场改为串行，先退出旧视图再进入新视图 ([7456b25](https://github.com/baiwumm/better-nav/commit/7456b255a8771fa407464d85ea250906bc524315))

### 🎫 Chores | 其他更新

* **home:** 移除全局 loading，admin 段单独保留路由加载态 ([b62415c](https://github.com/baiwumm/better-nav/commit/b62415cc4d08d03bc72f977e8b5f85eebbec22b6))

### ♻ Code Refactoring | 代码重构

* **backtop:** 优化回顶交互动画并修复滚动到顶后未隐藏 ([fa7bc54](https://github.com/baiwumm/better-nav/commit/fa7bc54c5c9eda760ba3ac87bea8c964c01021ae))
* **home:** 首页数据改为服务端取数 (RSC + Suspense) ([4a6a4f2](https://github.com/baiwumm/better-nav/commit/4a6a4f2d1aa7be2e4ebabfa7aae8aa94669cfa70))
* **typography:** 首页分类标题/登录应用名/用户菜单名改用Typography组件 ([aed5ee0](https://github.com/baiwumm/better-nav/commit/aed5ee05185528460f267b3f39467b1d95631d7f))

### ⚡ Performance Improvements | 性能优化

* **home:** 修复首页卡片出场动画并优化加载性能 ([cea463b](https://github.com/baiwumm/better-nav/commit/cea463bf3e51db043894cc1bfa3952989607332e))

## [3.7.1](https://github.com/baiwumm/better-nav/compare/3.7.0...3.7.1) (2026-08-05)

### 🐛 Bug Fixes | Bug 修复

* **globals.css:** 修正全局主题的OKLCH色彩配置 ([df637c0](https://github.com/baiwumm/better-nav/commit/df637c0dbae5df50de5685e9d3eea26da842daac))
* **layout, og-image:** 修复站点URL配置并优化OpenGraph图片生成 ([5ad223a](https://github.com/baiwumm/better-nav/commit/5ad223a358fc235f2d909afc7d62c9b86e93428d))

## [3.7.0](https://github.com/baiwumm/better-nav/compare/3.6.6...3.7.0) (2026-08-05)

### ⚠ BREAKING CHANGES

* 移除了ProgressBridge组件和相关API
```

* ``` ([214b8ca](https://github.com/baiwumm/better-nav/commit/214b8cacf2052924d10cde11e62bbc175932ccae))

### ✨ Features | 新功能

* **app:** 重命名应用、新增暗色模式适配与动态OpenGraph图片 ([a97b275](https://github.com/baiwumm/better-nav/commit/a97b2757d570e4571e6f7fc884b4da30dca41f4c))
* **heroui-react:** 新增HeroUI v3 React组件库技能工具集 ([c61a263](https://github.com/baiwumm/better-nav/commit/c61a2634814d538741e2eea305a6f1b6d0eb22d9))

### 🐛 Bug Fixes | Bug 修复

* **home:** 优化首页初始加载状态的判断逻辑 ([266634d](https://github.com/baiwumm/better-nav/commit/266634d613625f9320984eb6dd3d7efdaf81f2e7))
* **proxy:** 调整api路由认证处理与代理配置 ([a2d6a0f](https://github.com/baiwumm/better-nav/commit/a2d6a0fb701d2828c05c7ab9a1f7af917aef7008))

### 🎫 Chores | 其他更新

* **project:** 重命名项目为better-nav并更新全局配置 ([9f0eadb](https://github.com/baiwumm/better-nav/commit/9f0eadb59b1512c3a23efd2ca82eb7c7bca7973f))

### 📝 Documentation | 文档

* **readme:** 重命名项目为Better Nav并精简文档内容 ([d76dd09](https://github.com/baiwumm/better-nav/commit/d76dd094e36634ac13fe2d295fc97f833d95fd57))

### 💄 Styles | 风格

* **BackTop:** 调整组件配色，统一使用前景色与默认色 ([605b97b](https://github.com/baiwumm/better-nav/commit/605b97b00da8b549d019432d47d889e8107f5e4f))
* **eslint:** 使用 @antfu/eslint-config 统一代码风格 ([407066e](https://github.com/baiwumm/better-nav/commit/407066e1d4ab3d8f93a24f4919f273d250961bb4))

### ♻ Code Refactoring | 代码重构

* 拆分版权环境变量并优化元数据配置 ([00ee6cd](https://github.com/baiwumm/better-nav/commit/00ee6cde5278f2fb759efa4c5d5211a6bf9baa34))

### 👷‍ Build System | 构建

* **next-config:** 移除baiwumm图片远程域名配置 ([2a39223](https://github.com/baiwumm/better-nav/commit/2a392239597c761c974009f7f44eb659d7413f6b))

## [3.6.6](https://github.com/baiwumm/better-nav/compare/3.6.5...3.6.6) (2026-07-22)

### ⚡ Performance Improvements | 性能优化

* **layout:** 优化布局结构 ([5f6cae1](https://github.com/baiwumm/better-nav/commit/5f6cae181b86a84919e4e33d3def3ef73f465512))

## [3.6.5](https://github.com/baiwumm/better-nav/compare/3.6.4...3.6.5) (2026-07-15)

### 💄 Styles | 风格

* 优化加载和错误界面 UI ([c6cf809](https://github.com/baiwumm/better-nav/commit/c6cf809ddd959e6bda1dba042433258bf2f89987))

### ⚡ Performance Improvements | 性能优化

* 删除 LoadingContent 组件 ([d3ad5f8](https://github.com/baiwumm/better-nav/commit/d3ad5f87d636718615c8402d5c93b7ae74f2bd41))

## [3.6.4](https://github.com/baiwumm/better-nav/compare/3.6.3...3.6.4) (2026-07-07)

### 💄 Styles | 风格

* UI 调整 ([81ef0d0](https://github.com/baiwumm/better-nav/commit/81ef0d0185ec4cda66c0012ee60aa8b25cf15b3b))

## [3.6.3](https://github.com/baiwumm/better-nav/compare/3.6.2...3.6.3) (2026-07-07)

### ✨ Features | 新功能

* 安装 react-easy-crop 包，新增 Logo 裁剪功能 ([779c476](https://github.com/baiwumm/better-nav/commit/779c476d26e6e6bb7587dafa12131293c1d54e2a))

## [3.6.2](https://github.com/baiwumm/better-nav/compare/3.6.1...3.6.2) (2026-07-07)

### ⚡ Performance Improvements | 性能优化

* 样式调整，细节优化 ([3c32837](https://github.com/baiwumm/better-nav/commit/3c328376d252e338487fe4c7f08bb929fd9878e4))

## [3.6.1](https://github.com/baiwumm/better-nav/compare/3.6.0...3.6.1) (2026-07-07)

### ✨ Features | 新功能

* 更新 demo 截图 ([9ee34a8](https://github.com/baiwumm/better-nav/commit/9ee34a8ceed5bd9d522c11142e462436e3fe7064))
* 新增 @number-flow/react 和 lunar-typescript 包 ([ebad052](https://github.com/baiwumm/better-nav/commit/ebad0528fbf150d00d51d057317c4e296d7b43f1))
* **Header:** 顶部增加实时时间 ([37a2e46](https://github.com/baiwumm/better-nav/commit/37a2e46651b039c105e0f3e2755b1eb65bfe9d52))

### ⚡ Performance Improvements | 性能优化

* 优化 Image 组件的警告 ([4fb5c2e](https://github.com/baiwumm/better-nav/commit/4fb5c2e5e4577765ce11e2794d5852a83b8af0d5))

### 🔧 Continuous Integration | CI 配置

* 使用默认端口 ([5091a4f](https://github.com/baiwumm/better-nav/commit/5091a4fc932eec12e1f85fd04bc0e350bd8cce48))

## [3.6.0](https://github.com/baiwumm/better-nav/compare/3.5.3...3.6.0) (2026-07-06)

### ✨ Features | 新功能

* 更新 demo 截图 ([c36c979](https://github.com/baiwumm/better-nav/commit/c36c9792111ef18fe0437162e122e77f6717a36a))
* 优化首页  UI 样式排版 ([67be9ee](https://github.com/baiwumm/better-nav/commit/67be9ee2be9b0ac0c0d473a5a0c87e956f1e83d6))

### 💄 Styles | 风格

* 优化首页卡片加载样式 ([888d297](https://github.com/baiwumm/better-nav/commit/888d29739b313d265435ddd0cf805cebda5e825f))

### ⚡ Performance Improvements | 性能优化

* 去掉 @bprogress/core 包 ([ad8dc4c](https://github.com/baiwumm/better-nav/commit/ad8dc4c3926736bd80faadeeed1875f5067b2254))
* 去掉 query-string 包 ([a6b89dc](https://github.com/baiwumm/better-nav/commit/a6b89dc7df3a5524990dda25da1ba16140e7ea0b))

## [3.5.3](https://github.com/baiwumm/better-nav/compare/3.5.2...3.5.3) (2026-07-01)

### ✨ Features | 新功能

* 更新 demo 截图 ([f4a3e3d](https://github.com/baiwumm/better-nav/commit/f4a3e3d0dabb8e60078dd99a838290e64613b704))
* 更新包版本 ([59d8539](https://github.com/baiwumm/better-nav/commit/59d8539de8beee30f7670e405c42913f031654a7))

### 🐛 Bug Fixes | Bug 修复

* 修复编辑时，Logo 保存丢失的问题 ([b5e8ff7](https://github.com/baiwumm/better-nav/commit/b5e8ff74ac2519ea5ec339997c80774069ffb98e))

### 💄 Styles | 风格

* 优化 UI 主题样式 ([31a95c3](https://github.com/baiwumm/better-nav/commit/31a95c3546ba68c8c6fc0d5e6dfd61b2a835d982))
* **components:** 更新 Status 组件 variant 样式 ([c4a1b8d](https://github.com/baiwumm/better-nav/commit/c4a1b8dde2acaddfa59ff907fcb307352da435bd))

### ⚡ Performance Improvements | 性能优化

* 删除 umami 统计代码 ([4ea16b7](https://github.com/baiwumm/better-nav/commit/4ea16b7127a762a6122ae76599deafc41f951a5b))

### 🔧 Continuous Integration | CI 配置

* 更新 Hero UI 版本 ([9c2ffcb](https://github.com/baiwumm/better-nav/commit/9c2ffcbf5c11e030d786d394e1a654d75df283c2))
* 降低 eslint 到 v9 版本 ([b354db1](https://github.com/baiwumm/better-nav/commit/b354db12be7494a139fa7d9f96cc443b3cd0e613))

## [3.5.2](https://github.com/baiwumm/better-nav/compare/3.5.1...3.5.2) (2026-03-16)

### ⚡ Performance Improvements | 性能优化

* 删除 ProgressCircle 组件 ([8287c5f](https://github.com/baiwumm/better-nav/commit/8287c5f7994eb938e5b4baa5629c80fed27737ef))
* **BackTop:** 使用 Hero UI 的 ProgressCircle 组件，优化卡顿 ([54f1a4d](https://github.com/baiwumm/better-nav/commit/54f1a4d33f6dc121c62c15d3f3de52f259ab1475))

### 🔧 Continuous Integration | CI 配置

* 更新 Hero UI 版本 ([0f442ce](https://github.com/baiwumm/better-nav/commit/0f442ce5f076af0bf9a78b7ba33c48eab3cdb758))

## [3.5.1](https://github.com/baiwumm/better-nav/compare/3.5.0...3.5.1) (2026-03-11)

### 💄 Styles | 风格

* **FullLoading:** 样式优化 ([ecb22af](https://github.com/baiwumm/better-nav/commit/ecb22affbf94dbc0aa8c7f9fbae6fdb46cf7b3ff))

## [3.5.0](https://github.com/baiwumm/better-nav/compare/3.4.11...3.5.0) (2026-03-11)

### ✨ Features | 新功能

* 更新 demo 图 ([bd5b6ed](https://github.com/baiwumm/better-nav/commit/bd5b6ed099391dfc7a8a0773d03bc9ebb2844556))
* **DataTablePagination:** 分页使用 HeroUI 的 Pagination 组件 ([00fb216](https://github.com/baiwumm/better-nav/commit/00fb216af1c303ad4d6c54d2d3f9175df6666e49))

### 💄 Styles | 风格

* **UserAvatar:** 样式调整 ([42dc85d](https://github.com/baiwumm/better-nav/commit/42dc85de5667998154f269001c5545de998e68d0))

### ⚡ Performance Improvements | 性能优化

* 禁止 Image 图片优化 ([c327ade](https://github.com/baiwumm/better-nav/commit/c327ade445de64035d53ba21a6b8618ff7b3b9e0))
* 删除 AppSettings 组件，保持页面功能简洁 ([69449d8](https://github.com/baiwumm/better-nav/commit/69449d8390ac1866edceee25e5e2027a4d43215b))
* 删除没用的代码 ([01ed13b](https://github.com/baiwumm/better-nav/commit/01ed13b4443592c860f61b3425679e559b423bb7))
* 统一项目 Loading 状态 ([bec520d](https://github.com/baiwumm/better-nav/commit/bec520dd0c3352c607fab27c6e0038cf0a9d7eff))
* 细节调整优化 ([06e4042](https://github.com/baiwumm/better-nav/commit/06e40420cf4c6ee4331efe9decf9afe6d30af8a6))
* 细节优化 ([68f3b2b](https://github.com/baiwumm/better-nav/commit/68f3b2b6981108f1ffddb3bf01148d155cea6695))
* **Categorys:** 优化代码逻辑 ([cd95156](https://github.com/baiwumm/better-nav/commit/cd95156303d1206cc7698e6b64193f918ebbb402))
* **Websites:** 优化代码逻辑 ([5c54011](https://github.com/baiwumm/better-nav/commit/5c54011b014a60ec889ef1d4bc5e74b2c7c5839e))

### 🔧 Continuous Integration | CI 配置

* 更新 heroui 版本 ([cb47b43](https://github.com/baiwumm/better-nav/commit/cb47b4366656d6884a47ae97131a98604b7a52ad))
* 移除 zustand 包 ([0951d47](https://github.com/baiwumm/better-nav/commit/0951d4703c2c3c70c5d28b10c6d5911b27219387))

## [3.4.11](https://github.com/baiwumm/better-nav/compare/3.4.10...3.4.11) (2026-02-25)

### ✨ Features | 新功能

* 修改 apple 图标 ([5da1060](https://github.com/baiwumm/better-nav/commit/5da1060c2ae606b6e4ef3de7b1290f42dfd892ab))
* TS 类型和细节优化 ([91e77b9](https://github.com/baiwumm/better-nav/commit/91e77b9f10258327a45781fcff8a071df62b2f8a))

### 💄 Styles | 风格

* import 排序 ([6091784](https://github.com/baiwumm/better-nav/commit/609178402affe93e83b7074f3e9a8bc63b550709))

### ⚡ Performance Improvements | 性能优化

* **proxy:** 中间件过滤 api 接口 ([761eaec](https://github.com/baiwumm/better-nav/commit/761eaec469080cc445fad32853508b36b02856cc))

## [3.4.10](https://github.com/baiwumm/better-nav/compare/3.4.9...3.4.10) (2026-02-07)

### 🐛 Bug Fixes | Bug 修复

* **Websites:** 修复编辑时 Logo 回显报错的问题 ([1977817](https://github.com/baiwumm/better-nav/commit/197781708f4de91d26ec4a18388c9d35443de31e))

### 🎫 Chores | 其他更新

* Release v3.4.9 ([2ceeda7](https://github.com/baiwumm/better-nav/commit/2ceeda7a8fddafd332499cde487f03fea8a11fa1))
## [3.4.8](https://github.com/baiwumm/better-nav/compare/3.4.9...3.4.10) (2026-02-05)

### 🎫 Chores | 其他更新

* Release v3.4.8 ([6c61e93](https://github.com/baiwumm/better-nav/commit/6c61e939cdd61e12b4e0d462e38600e202833696))

## [3.4.8](https://github.com/baiwumm/better-nav/compare/3.4.9...3.4.9) (2026-02-05)

### 🎫 Chores | 其他更新

* Release v3.4.8 ([6c61e93](https://github.com/baiwumm/better-nav/commit/6c61e939cdd61e12b4e0d462e38600e202833696))

## [3.4.8](https://github.com/baiwumm/better-nav/compare/3.4.7...3.4.8) (2026-02-05)

### ✨ Features | 新功能

* **store:** 添加“主题动画”配置开关 ([8df0798](https://github.com/baiwumm/better-nav/commit/8df0798a4984b196e46379bcbfe06f2b63328fa4))

## [3.4.7](https://github.com/baiwumm/better-nav/compare/3.4.6...3.4.7) (2026-02-05)

### ✨ Features | 新功能

* 更新 Logo 链接生成方式 ([20d6f81](https://github.com/baiwumm/better-nav/commit/20d6f81bcccb3cee6e9cbdbfa2954fd7a3cf59f9))

## [3.4.6](https://github.com/baiwumm/better-nav/compare/3.4.5...3.4.6) (2026-02-04)

### ✨ Features | 新功能

* 新增 AppSettings 组件 ([0bd9f9f](https://github.com/baiwumm/better-nav/commit/0bd9f9f795653a70ace8091f380ee255d11e3231))

### 💄 Styles | 风格

* 细节优化 ([3cfa41d](https://github.com/baiwumm/better-nav/commit/3cfa41d955b51ef20f0957bb4e2e38f382e5308a))

## [3.4.5](https://github.com/baiwumm/better-nav/compare/3.4.4...3.4.5) (2026-02-03)

### ✨ Features | 新功能

* **NotFound:** 添加 404 页面 ([7feafa6](https://github.com/baiwumm/better-nav/commit/7feafa6da99ab871a59cc5f5e59d246b1a311fbd))

## [3.4.4](https://github.com/baiwumm/better-nav/compare/3.4.3...3.4.4) (2026-02-03)

### ✨ Features | 新功能

* 添加统计代码 ([06f2471](https://github.com/baiwumm/better-nav/commit/06f24712611b721b0089a7159086ba336a310cd6))
* update README.md ([ec5c534](https://github.com/baiwumm/better-nav/commit/ec5c534564894fabfddb36453fa87b1075e35b13))

## [3.4.3](https://github.com/baiwumm/better-nav/compare/3.4.2...3.4.3) (2026-02-02)

### ⚡ Performance Improvements | 性能优化

* **admin:** 优化分类接口请求逻辑 ([6b2a6e9](https://github.com/baiwumm/better-nav/commit/6b2a6e97a67dddb3c8705481d0726f0349cfb383))

## [3.4.2](https://github.com/baiwumm/better-nav/compare/3.4.1...3.4.2) (2026-02-02)

### 💄 Styles | 风格

* 调整卡片主题色 ([e1ba5d7](https://github.com/baiwumm/better-nav/commit/e1ba5d7c5cef44926330587f772054dc7a3a46e3))

## [3.4.1](https://github.com/baiwumm/better-nav/compare/3.4.0...3.4.1) (2026-02-02)

### ✨ Features | 新功能

* 删除网站的同时，应该也删除该网站下的 logo 文件 ([3ce8f88](https://github.com/baiwumm/better-nav/commit/3ce8f885b080457c1c070264c4b867c6061a59be))
* 修复中间件没有 过滤 Api 接口的问题 ([9a45213](https://github.com/baiwumm/better-nav/commit/9a45213a9d05294dd0acd0047a93a72e37f3ad1d))

## [3.4.0](https://github.com/baiwumm/better-nav/compare/3.3.0...3.4.0) (2026-01-30)

### ✨ Features | 新功能

* 动态设置边框动画颜色，细节调整 ([ad50774](https://github.com/baiwumm/better-nav/commit/ad507743da7c59f5a9f31a5e21f5d789b28e7677))
* 完成首页网站卡片的渲染 ([9e562ce](https://github.com/baiwumm/better-nav/commit/9e562ce1e335ba7a7295aaf22b73107ea0c82d48))
* **Home:** 添加“常用”标签 ([cbc832a](https://github.com/baiwumm/better-nav/commit/cbc832aa5136489341a60908cf8d507c841f946c))

### ⚡ Performance Improvements | 性能优化

* **LogoUpload:** 代码逻辑优化 ([47dd197](https://github.com/baiwumm/better-nav/commit/47dd197a1b489bec47c1a6742f60ca95c915a263))

## [3.3.0](https://github.com/baiwumm/better-nav/compare/3.2.0...3.3.0) (2026-01-29)

### ✨ Features | 新功能

* **categotys:** 细节优化 ([333a7da](https://github.com/baiwumm/better-nav/commit/333a7da85c7db2df24cc54503b7a50149edf38f4))
* **config:** 添加 Images 配置 ([8f30bed](https://github.com/baiwumm/better-nav/commit/8f30bed41fd98b5574f5ca1bd6a44af96dbcb5c1))
* **websites:** 完成 Logo 上传的功能 ([bbcdb85](https://github.com/baiwumm/better-nav/commit/bbcdb8520f1c204185219409e72dfe5b26118d9d))
* **websites:** 完成《网站列表》模块的 CURD 功能开发 ([b3a2b68](https://github.com/baiwumm/better-nav/commit/b3a2b68485cc353c634b7f16567683d249e49df1))

### ⚡ Performance Improvements | 性能优化

* 细节调整优化 ([9303b16](https://github.com/baiwumm/better-nav/commit/9303b166758b66c22618a370b60a11b6ce5ef75a))

## [3.2.0](https://github.com/baiwumm/better-nav/compare/3.1.0...3.2.0) (2026-01-28)

### ✨ Features | 新功能

* **Categorys:** 完成《网站分类》的 CURD 逻辑 ([8254ff5](https://github.com/baiwumm/better-nav/commit/8254ff5a8c6255dd4e3f43928fc3e35dcb977dfd))
* **Categorys:** 完善网站分类列表排版逻辑 ([0a13aef](https://github.com/baiwumm/better-nav/commit/0a13aef83b90ecc8d553b2568ebb3163bcbfba9c))
* **DataTablePagination:** 新增表格分页组件 ([c93ba97](https://github.com/baiwumm/better-nav/commit/c93ba97e4f6872e68ccf821422de55fc2c80b9a2))

### 💄 Styles | 风格

* 主题配色调整 ([2b34cfd](https://github.com/baiwumm/better-nav/commit/2b34cfd7e51198d7e86aef88d2b7ad9249d6a68b))

## [3.1.0](https://github.com/baiwumm/better-nav/compare/3.0.0...3.1.0) (2026-01-27)

### ✨ Features | 新功能

* 安装 Shadcn UI 库 ([5dc659e](https://github.com/baiwumm/better-nav/commit/5dc659e6ab340817dc460cc17acaa47dd0e83234))
* 更改 supabase 调用方式 ([580e338](https://github.com/baiwumm/better-nav/commit/580e338d64e303f4916cd85f3d5d8595654674dd))
* 完成《网站分类》模块的接口开发 ([55d2c7c](https://github.com/baiwumm/better-nav/commit/55d2c7c6c451102eb7e04a6f331c08ab3e762239))
* 完成登录逻辑 ([b437f4e](https://github.com/baiwumm/better-nav/commit/b437f4e0a04ff7b0c648a4ba1590df231ca2794b))
* 完善 SEO 元信息 ([a51cdec](https://github.com/baiwumm/better-nav/commit/a51cdec0b09d2cf7ceaaf03e68fa752d9f3e611d))
* **layout:** 完成页面的基本布局排版 ([a3f3d07](https://github.com/baiwumm/better-nav/commit/a3f3d0785db9682a5664eedf32b4bed2703dc8dd))

### 🐛 Bug Fixes | Bug 修复

* 修复 OAuth 登录失败的问题 ([abdcf3f](https://github.com/baiwumm/better-nav/commit/abdcf3faa60777f7af671092d415486fed536c54))

### 💄 Styles | 风格

* UI 更换为 Hero UI ([45bf572](https://github.com/baiwumm/better-nav/commit/45bf5725298dd7959d913338f1e55b34283112b5))

### ♻ Code Refactoring | 代码重构

* 使用 Next.js16.x 重构 ([ebb4d51](https://github.com/baiwumm/better-nav/commit/ebb4d51bfe42e743a3553eea64993d57f13d4ec0))
