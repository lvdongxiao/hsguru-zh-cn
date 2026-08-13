# HSGuru 中文助手

为 [HSGuru](https://www.hsguru.com/) 提供简体中文界面、中文卡牌数据和中文卡图的 Tampermonkey 用户脚本。

[![CI](https://github.com/lvdongxiao/hsguru-zh-cn/actions/workflows/ci.yml/badge.svg)](https://github.com/lvdongxiao/hsguru-zh-cn/actions/workflows/ci.yml)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## 功能

- 翻译 HSGuru 的导航、按钮、筛选器、下拉菜单、表格和动态加载内容；
- 翻译登录后的用户菜单、个人资料与设置、套牌表、个人对局数据、回放、群组和收藏页面；
- 翻译玩家数据、炉石电竞积分及各赛区排行榜，包括赛季、赛区、国家和联动筛选项；
- 翻译 HSGuru 套牌名称，并保留 `XL` 等约定俗成的英文标记；
- 从 HearthstoneJSON 加载完整的简体中文卡牌名称、卡牌文本、趣味描述、关键词和附属卡牌数据；
- 将卡牌详情图、套牌悬停预览图等替换为简体中文卡图；
- 翻译复制到剪贴板的套牌名称，包括动态添加到套牌查看器中的套牌；
- 通过 MutationObserver 自动处理滚动加载、翻页、弹出菜单以及站点局部更新产生的新内容；
- 提供“切换为中文/英文”和“更新卡牌翻译数据”两个 Tampermonkey 菜单命令。

脚本采用精确匹配和受控动态规则，不会直接替换长文本中的单个英文单词，以减少卡牌名称与界面文案同名时产生的误译。

## 页面支持情况

已支持：

- 首页及登录后的用户页面；
- 套牌列表与套牌详情；
- 标准、狂野和乱斗环境页及对局优劣；
- 玩家数据、炉石电竞积分和欧洲、美洲、亚太、中国赛区排行榜；
- 主播套牌；
- 套牌构筑器与套牌查看器；
- 卡牌详情与卡牌数据。

部分支持：

- HSGuru 持续更新的动态页面和新增文案，发现遗漏后持续补充。

## 安装

### 从 Greasy Fork 安装

1. 安装 [Tampermonkey](https://www.tampermonkey.net/)；
2. 打开 Greasy Fork 上的
   [HSGuru 中文助手](https://greasyfork.org/zh-CN/scripts/590116-hsguru-%E4%B8%AD%E6%96%87%E5%8A%A9%E6%89%8B)；
3. 点击“安装此脚本”，并在 Tampermonkey 中确认安装；
4. 访问 HSGuru，然后刷新页面。

通过 Greasy Fork 安装后，可以由 Tampermonkey 检查脚本更新。

### 从 GitHub Release 安装

1. 安装 [Tampermonkey](https://www.tampermonkey.net/)；
2. 从 [Releases](https://github.com/lvdongxiao/hsguru-zh-cn/releases) 下载最新版 `hsguru-zh-cn.user.js`；
3. 使用 Tampermonkey 打开脚本并确认安装；
4. 访问 HSGuru，然后刷新页面。

Release 构建会写入更新地址。安装 Release 中的脚本后，Tampermonkey 可以检查后续版本。
如果 Releases 页面暂时没有可下载文件，请按下方步骤在本地构建。

### 本地构建

需要 Node.js 22 或更高版本。

```bash
npm install
npm run build
```

生成文件位于：

```text
dist/hsguru-zh-cn.user.js
```

## 使用

安装后默认启用中文翻译。Tampermonkey 脚本菜单始终按以下顺序显示：

1. `切换为英文` 或 `切换为中文`；
2. `更新卡牌翻译数据`。

切换为英文时，脚本会恢复已记录的英文文本和原始卡图。手动更新卡牌数据时，页面右上角会显示更新结果；如果请求失败但存在旧缓存，脚本会继续使用缓存数据。

## 卡牌数据和缓存

卡牌本地化数据来自 [HearthstoneJSON](https://hearthstonejson.com/)。脚本运行时会请求：

- 英文可收藏卡牌数据，用于建立英文名称到中文名称的对应关系；
- 简体中文完整卡牌数据，用于补充附属卡牌、卡牌文本、趣味描述和关键词；
- 简体中文卡牌渲染图，用于替换页面中的英文卡图和悬停预览图。

处理后的数据保存在 Tampermonkey 本地存储中，缓存有效期为 7 天。正常访问会优先使用有效缓存；也可以从脚本菜单强制更新。切换语言不会清除缓存。

如果 HearthstoneJSON 暂时不可用，脚本不会硬编码卡牌文本或趣味描述；存在旧缓存时使用旧缓存，否则保持 HSGuru 原文。

## 开发

```bash
npm run dev          # 监听源码并持续构建
npm run build        # 生成用户脚本
npm test             # 运行单元测试
npm run typecheck    # TypeScript 类型检查
npm run format       # 格式化项目文件
npm run check        # 类型、格式、测试和构建的完整检查
```

主要目录：

```text
src/
├── data/             # HearthstoneJSON 加载、配对和缓存
├── i18n/             # 界面词典、套牌名称和 DOM 翻译器
├── card-images.ts    # 中文卡图及悬停预览图
├── clipboard.ts      # 套牌复制与中文名称处理
└── index.ts          # 菜单、页面观察和运行时入口
tests/                # Node.js 单元测试
scripts/build.mjs     # esbuild 用户脚本构建
```

## 添加翻译

稳定的站点文案维护在 `src/i18n/dictionary.ts` 中，格式为“英文原文 → 简体中文”。

带数字、时间或赛季的文案，例如 `Min 5 Finishes`、`Past 6 Hours`、`2026 Spring` 和 `VS Death Knight`，
由 `src/i18n/translator.ts` 中的受控格式规则处理。国家筛选项根据页面提供的 ISO 国家代码转换为中文名称。
套牌名称词根维护在 `src/i18n/deck-names.ts` 中。炉石官方已有的卡牌名称、文本、趣味描述和关键词应来自 HearthstoneJSON，
不应写入硬编码兜底翻译。

修改后运行：

```bash
npm run check
```

## 数据来源和声明

- 卡牌数据及渲染图通过 [HearthstoneJSON](https://hearthstonejson.com/) 获取；
- 早期部分界面文案和套牌名称翻译参考了 Greasy Fork 上的 [HSGuru 中文美化脚本](https://greasyfork.org/zh-CN/scripts/555065-hsguru-%E4%B8%AD%E6%96%87%E7%BE%8E%E5%8C%96%E8%84%9A%E6%9C%AC)（脚本署名：深海之鱼）；
- HSGuru、HearthstoneJSON、Hearthstone 及相关名称、商标和卡牌素材归各自权利人所有；
- 本项目是非官方社区用户脚本，与 HSGuru、HearthSim 或 Blizzard Entertainment 无隶属或认可关系；
- 本仓库不打包卡牌数据库或卡图，相关资源由脚本在浏览器中按需加载。

## 许可证

本项目贡献者原创的代码采用 [MIT License](LICENSE)。第三方脚本贡献、翻译数据、卡牌数据、商标和素材不包含在本项目 MIT 许可证的授权范围内，仍受各自权利声明约束。
