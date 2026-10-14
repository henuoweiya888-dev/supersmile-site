# 两个示例详情页：内部来源与表述依据

本文件不公开，不由详情页模板渲染。`product-example-details.json` 的id、categoryId仅用于内部关联，公开页面不要显示EX编号、来源、审核状态、REFERENCE或购物功能。

## 编织护套多分支线束

- 内部记录：EX-custom-harness-09-001；资产40c15bc1f6d41dea，已查看当前1200×1200发布图片。
- 资料库来源：[Dongguan XSD的Made-in-China定制线束条目](https://xsdsingder.en.made-in-china.com/product/fmUYgCpzFxhL/China-Customized-Power-Delivery-Terminal-Trailer-Wiring-Electric-Wire-Control-Panel-Harness-Cable-Assembly.html)。source agent本轮已实际阅读。
- 可见结构：米色编织套、多组白色壳体、多分支、多色引线、部分绞线、独立环形端子、部分未装插壳的引线、束扎。没有认定编织材料、金属屏蔽、地线功能、插壳品牌或实际针脚。
- 原来源是宽泛定制线束listing，没有此样件专用参数。来源供应商的价格、MOQ、认证、规模、公司身份与其“Custom Wiring Harness”型号不迁移到本页。
- 应用段落描述结构适用的定制方向，不声称图中样件已供某设备或某客户。

## M12四芯公母连接电缆

- 内部记录：EX-cable-assembly-02-001；资产e9da8e217b272957，已查看当前1200×1200发布图片。
- 资料库来源：[ZSX的M12四芯公母带线条目](https://www.zsx-connector.com/m12-connector-4-core-waterproof-male-female-aviation-plug-with-cable/)。source agent本轮已实际阅读，标题、M12-4及Male-to-Female支持描述性名称。
- 可见结构：直头、金属螺纹/滚花连接部位、黑色模制出口及黑色护套电缆。四芯、公母与M12取自既有名称及来源标题，不据照片读取针脚。
- 来源页下方参数明显混入RF/SMA模板：50Ω、DC–18GHz、1W、金镀层、-55~125℃、500 cycles。一律不采，也不写IP、编码、精确针序、屏蔽、连接器品牌或原厂授权。
- 标题英文保留4-Core，未将芯数自动转换为已确认接点数。路由沿用root建议 `/products/m12-4-pin-cable-assembly`，若希望URL与命名完全一致，可由root调整slug；页面不需解释内部命名差异。

## 共用编辑原则

- 主体是两个单示例的可见结构与定制选择。参数表名为“结构与定制配置”，只出现有据结构与客户可定义项。
- 没有公司SKU、价格、库存、交期、直接下单、购物车或无依据认证与额定。
- 功能、温度、负载、密封和EMC由项目配置与验证确定；没有用冗长免责声明替代产品介绍。
- humanize-writing与anti-ai-tell已经阅读并应用：用零件、位置和安装动作描述产品，避免空泛营销语和em dash。
- 主模板应白名单读取sharedCopy与products的公开字段，id/categoryId只做关联。structure/applications/customization使用title/text；configuration使用label/value；CTA使用title/text/button/href。可继续复用页面原有导航、语言切换和咨询表单。
