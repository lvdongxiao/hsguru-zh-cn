# HSGuru 中文助手

为 [HSGuru](https://www.hsguru.com/) 提供简体中文界面的 Tampermonkey 用户脚本。

## 当前状态

项目已完成基础工程初始化，包含：

- TypeScript 源码和可扩展的界面词典；
- 对所有页面、动态内容及隐藏下拉菜单的自动翻译；
- 文本、`title`、`placeholder` 和 `aria-label` 翻译；
- 从 HearthstoneJSON 自动加载完整的中英文可收藏卡牌名称并缓存 7 天；
- 使用流派、机制和职业词根组合翻译 HSGuru 卡组名称；
- Tampermonkey 菜单中的翻译开关；
- 构建、类型检查、格式检查和单元测试；
- GitHub Actions 持续集成与标签发布流程。

首轮词典覆盖 HSGuru 主导航、套牌筛选器、卡牌筛选器、职业、卡牌类型、
随从类型、法术派系、稀有度、阵营以及当前卡牌系列。新卡牌名称不需要手工
写入仓库，会在浏览器中自动同步。

## 本地开发

要求 Node.js 22 或更高版本。

```bash
npm install
npm run dev
```

开发模式会持续生成 `dist/hsguru-zh-cn.user.js`。在 Tampermonkey 中安装该文件，页面刷新后即可验证。

常用命令：

```bash
npm run build       # 生成用户脚本
npm test            # 运行单元测试
npm run typecheck   # TypeScript 类型检查
npm run check       # 执行全部校验并构建
```

## 添加翻译

在 `src/i18n/dictionary.ts` 中增加“英文原文 → 简体中文”词条。翻译器使用
精确匹配，并为 `Min 200`、`Past 6 Hours`、`VS Death Knight` 等动态筛选文案
提供受控格式规则，不会直接替换长文本中的某个单词，以减少误译。

卡牌数据来自 HearthstoneJSON 的 `latest` 中英文可收藏卡表，通过卡牌 ID 配对。
首次访问需要下载约 6.5 MB 原始 JSON，生成的约 8,000 条名称映射会存入
Tampermonkey 存储并缓存 7 天。也可从 Tampermonkey 菜单手动选择
“更新卡牌翻译数据”。

## GitHub 发布

1. 在 GitHub 创建仓库，并将它设置为本地仓库的 `origin`；
2. 提交并推送 `main` 分支；
3. 推送形如 `v0.1.0` 的标签；
4. Release 工作流会构建脚本、创建 GitHub Release 并上传 `.user.js` 文件。

在 GitHub Actions 中构建时，脚本会自动写入当前仓库对应的 `downloadURL` 和 `updateURL`，方便 Tampermonkey 检查更新。

## 许可证

[MIT](LICENSE)
