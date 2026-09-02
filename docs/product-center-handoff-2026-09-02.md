# 产品中心重做阶段存档（2026-09-02）

## 当前线上状态

- 仓库：`/Users/myjob/Desktop/曹诗源/网站/supersmile-site`
- 分支：`main`
- 远端：`origin/main`
- 已推送提交：`d980f6c6155534717ddc5b0dcf4d8e89f8f710c8`
- 原站入口补丁：`88dda51`。该提交正式上线新版 `products.html`，并把首页、关于、联系、定制及原产品页的 CSS/JS 版本统一提升到 `industrial-v2.css?v=20260902v52` 与 `main.js?v=20260902v47`，用于绕开 Chrome 对旧导航资源的缓存。
- 前四个已上线小类：
  1. `custom-harness-01` — `/products/industrial-equipment-harness`
  2. `custom-harness-02` — `/products/control-panel-harness`
  3. `custom-harness-03` — `/products/robotic-harness`
  4. `custom-harness-04` — `/products/instrument-and-sensor-harness`
- 顶部导航已经由“现货中心”改为“产品中心”，20 种语言的导航名称均已同步。
- `/products` 已由原现货商品列表替换为六大类产品能力目录；旧商品区只保留在不渲染的兼容模板中，不再作为产品中心主体显示。
- 桌面端鼠标悬停“产品中心”展开 Mega Menu；移动端先打开主导航，再点产品中心右侧箭头展开。
- Mega Menu 按六大类显示 83 个小类。已上线 4 项为正常链接；未上线 79 项置灰、无 `href`、不可点击。
- 点亮逻辑不维护第二份名单：`data/product-category-details.json` 中对应 key 只要存在 `page` 字段，就自动变成可点击链接；新增页面后无需改菜单代码。

## 已验收结果

- 桌面 1280×720：6 个大类、83 项、4 个链接、79 个禁用项，悬停一次展开，无横向溢出。
- 手机 390×844：固定顶部栏，首次点击箭头即可展开，6 个大类、4/79 状态正确，无横向溢出。
- 前四条本地路由均返回 HTTP 200。
- 正式域名复验：主页已返回 `v52/v47` 新资源版本，`/products?lang=zh` 已返回 `pc-directory`，不再返回旧的 `In-Stock Series` 主体。
- JavaScript 语法检查、JSON 检查和 `git diff --check` 通过；浏览器控制台无 error。
- 顶部栏桌面和手机均固定；正文已经补偿固定栏高度，不遮挡首屏。

## 核心文件与生成方式

- 六大类与 83 个小类：`data/product-capabilities.json`
- 小类长文、图片、正式页面路由与上线状态：`data/product-category-details.json`
- 全站导航和 20 种语言名称：`data/site.json`
- 导航、自动点亮、语言和页面渲染：`assets/js/main.js`
- 固定导航、Mega Menu、小类杂志排版：`assets/css/industrial-v2.css`
- 小类页面生成器：`tools/build_product_category_pages.mjs`
- 新增小类标准流程：补齐 `data/product-category-details.json` 对应 key 的 `page`、文案和图片 → 运行生成器 → 桌面/390px 验收 → 提交并推送；菜单会自动点亮。

## 固定设计规范

- 使用 `$品味提升` 的审美约束；整体是紧凑、克制、工业编辑/时尚杂志式排版，不做模板化卡片墙。
- 小类大纲严格参考 `https://www.ql-custom.com/` 对应小类页面的标题结构，再用可靠资料扩写科普、材料、方案、应用、制作流程、可靠性和 FAQ；强调“小类内部仍覆盖多种款式与配置”。
- 页面以科普和建立专业信任为目的；避免巨大字号、粗重字体、频繁换行、过量留白和纯纵向堆叠。桌面优先横向拉开，文字与图片平衡。
- 禁止把文案挤进表格、卡片外框或大面积框线；仅在确有分列关系时使用短细分隔线，不能形成外边框错觉。
- 每个小标题各配一张与标题含义高度相关的图片；图片是文字的配角，尺寸要克制，不再用“一个板块一张大图”的方式。
- 图片蒙版只在有明确版式理由时使用，形状端正、克制，不做歪斜、花哨或随机拼贴。
- 桌面端图片可让一侧竖边贴网页边缘；手机端图片两侧贴屏幕边缘。段落在所有语言中都保留首行缩进（中文视觉约两格）。
- 删除小类页面中的公司介绍板块；保留与当前小类直接相关的产品、材料、解决方案、应用、流程、可靠性、优势和 FAQ。
- 图片优先使用可追溯授权的免费真实摄影。画面应低饱和、自然单点光源、有高光也有阴影、不是全场均匀照亮；主体焦点锐利、焦外奶油化、浅景深、产品细节准确，避免游戏 CG、塑料感、过度润色和过于完美的商业棚拍光。
- AI 生成图如继续使用，必须高度关联具体小标题，并保存在 `/Users/myjob/Desktop/曹诗源` 范围内；用户认可的视觉参考仍是自然明暗、高对比但低饱和、锐焦与大虚化的实拍感。

## 多语言状态

- 语言选择器保留 20 种语言，不能缩减为中英两种。
- 全站短导航和既有公共 UI 有人工本地化；小类长文的源数据当前以中文/英文为主。
- `assets/js/main.js` 已加入非中英文长文的动态翻译与本地缓存，并保证翻译服务不可用时页面立即显示英文回退、不出现空白或阻塞。
- 本地验收时西班牙语导航正常，但外部翻译服务未返回长文翻译；因此“20 种语言长文完整本地化”仍是下次必须优先核实/完善的未完成项，不能宣称已经完全解决。

## 下一步入口（暂停时不要继续生成）

- 下一个小类：`custom-harness-05` — 电器设备线束 / Appliance Harness。
- 已准备但尚未提交的真实摄影素材目录：`assets/images/product-categories/stock/appliance/`
- 已有文件：`circuit-board-technician.jpg`、`heating-element.jpg`、`electric-motor.jpg`、`appliance-technician.jpg`、`pcb-repair.jpg`，授权来源记录在同目录 `SOURCES.md`。
- 继续前先复核工作区；当前存在大量用户已有修改和未跟踪素材，禁止清理、重置或一次性全部提交。只提交当前小类明确涉及的文件。
- 用户要求本阶段到此暂停，等待下一次从本文件无缝续接。
