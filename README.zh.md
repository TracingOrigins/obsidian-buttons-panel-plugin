<div align="center">
    <h1>Buttons Panel</h1>
    <p>
        <img src="https://img.shields.io/badge/dynamic/json?logo=obsidian&color=%23483699&label=downloads&query=%24%5B%22buttons-panel%22%5D.downloads&url=https%3A%2F%2Fraw.githubusercontent.com%2Fobsidianmd%2Fobsidian-releases%2Fmaster%2Fcommunity-plugin-stats.json" alt="Obsidian Downloads">
        <img src="https://img.shields.io/github/downloads/TracingOrigins/obsidian-buttons-panel-plugin/total?logo=github" alt="GitHub Downloads">
    </p>
    <p>[中文 | <a href="https://github.com/TracingOrigins/obsidian-buttons-panel-plugin/blob/master/README.md">English</a>]</p>
    <p><a href="https://community.obsidian.md/plugins/buttons-panel" target="_blank">Buttons Panel</a> 是一个现代化的 Obsidian 插件，用于创建自定义按钮面板，快速访问文件、命令、链接和脚本。</p>
</div>

## ✨ 功能介绍

- 🎯 **快速访问**：一键打开文件、执行命令、访问链接或运行脚本
- 🎨 **图标选择器**：集成 Lucide 图标库，支持搜索和预览
- 🏷️ **标签页视图**：支持列表视图和标签页视图两种展示模式
- 📁 **分类管理**：按分类组织按钮，支持长按拖拽调整分类与按钮顺序
- ⚙️ **灵活配置**：可配置面板布局、按钮样式和动画效果
- 📱 **响应式设计**：支持桌面和移动设备
- 🌙 **主题适配**：自动适配 Obsidian 的明暗主题
- 🎛️ **独立设置页**：设置页面在独立标签页中打开，便于管理
- 🔄 **实时更新**：设置变更实时生效，无需重启
- 🛡️ **表单校验**：按钮编辑时，所有必填项（如按钮名称、文件路径、命令ID、网址、文件夹、脚本名称）为空会高亮红色边框，直观提示
- 🖱️ **编辑模式**：开启后可在面板上新建分类和按钮，并通过右键菜单编辑、复制、删除
- 🧭 **顶部导航栏**：面板顶部新增导航栏，便于快速切换按钮面板视图、切换按钮样式、切换编辑模式和打开面板设置页面。
- 🔍 **搜索功能**：导航栏集成搜索功能，支持实时过滤分类和按钮，快速定位目标内容。
- 🔗 **动作序列**：支持为单个按钮配置多个动作，点击按钮可一键依次执行多个操作。

## 🚀 下载安装

### 📦 手动安装

1. 下载最新版本的插件（[Releases](https://github.com/TracingOrigins/obsidian-buttons-panel-plugin/releases)）
2. 将插件文件夹放入你的 Obsidian 插件目录（通常为 `.obsidian/plugins/`，如 `你的库/.obsidian/plugins/buttons-panel/`）
3. 在 Obsidian 设置 → 第三方插件中启用本插件

### 🔧 通过BRAT安装（推荐给测试用户）

1. 安装 [BRAT](https://github.com/TfTHacker/obsidian42-brat) 插件
2. 在 BRAT 设置中点击"添加测试插件"
3. 输入 `TracingOrigins/obsidian-buttons-panel-plugin`
4. 启用插件

## 📖 使用方法

### 🎯 打开按钮面板

- 命令面板（Ctrl+P）执行 "打开按钮面板（右侧边栏）"
- 点击左侧 ribbon 网格图标快速打开面板和配置页
- 按钮面板将在右侧边栏中打开，方便快速访问

### ⚙️ 打开按钮面板设置页面

- 命令面板执行 "打开按钮面板设置（中央内容区域）"
- 设置页面将在中央内容区域中打开，便于详细配置
- 也可在 Obsidian 设置页面的插件设置中进行配置

### 🔗 添加动作序列

- **动作序列**: 一个按钮可配置多个动作（如先新建文件再插入模板、再运行脚本），点击按钮后会自动依次执行所有配置的动作。每个动作可为不同类型（如“打开文件”+“执行命令”+“运行脚本”等），极大提升自动化和批量处理能力。
    - **配置方法**：在按钮编辑界面，点击“添加动作”可为该按钮添加多个动作，并可拖拽调整顺序。
    - **典型场景**：如一键新建并打开模板笔记、批量执行多条命令、自动化日常操作等。

### 🔗 支持的动作类型

- **打开文件**: 打开任意文件
- **执行命令**: 执行 Obsidian 命令
- **打开链接**: 打开外部网页链接
- **创建文件**: 在指定位置创建新文件，支持日期变量（如 `{{DATE:YYYY-MM-DD}}`）和模板内容
- **运行脚本**: 运行库中自定义的 JS 脚本（目前支持 QuickAdd和Components 两种脚本格式），可实现自动化、批量处理等高级功能。脚本需放在设置指定的脚本文件夹下。

### ✅ 表单校验体验

- 新建或编辑按钮时，点击"保存"会自动校验所有必填项
- 若有必填项为空，相关输入框会高亮红色边框，直观提示
- 补全内容后红色高亮自动消失，体验流畅

### 🎛️ 面板选项

- **面板标题**: 设置面板显示标题
- **显示标题**: 控制是否在面板中显示标题
- **视图模式**: 选择列表视图或标签页视图
- **按钮样式**: 图标和文本同行或图标在上文本在下
- **动画效果**: 启用按钮悬停动画
- **编辑模式**: 启用编辑模式
- **顶部导航**: 启用顶部导航

> 示例：你可以选择"标签页视图"，让不同分类的按钮分组显示。

### 📁 路径管理

- **模板文件夹路径**: 设置用于存储模板文件的文件夹路径（如 `templates/`），创建文件动作会使用此路径下的模板
- **脚本文件夹路径**: 设置用于存储脚本文件的文件夹路径（如 `scripts/`），运行脚本动作会从此路径加载脚本文件
- **路径验证**: 输入路径时会实时验证文件夹是否存在，无效路径会高亮红色边框提示
- **一键创建**: 点击"创建路径"按钮可自动创建不存在的文件夹，方便快速设置

> 示例：你可以设置模板文件夹为 `templates/`，脚本文件夹为 `scripts/`，这样创建文件和运行脚本功能就能正常工作了。

### 🖱️ 编辑模式

- 在面板设置或顶部导航栏中可开启「编辑模式」。
- **编辑模式下**可：
    - 在面板底部/列表末尾 **添加分类**、在分类内 **添加按钮**
    - 对分类标题或按钮 **右键**：**编辑**、**复制**、**删除**
- **编辑模式下不能拖拽排序**（避免与编辑操作冲突）。需要调整顺序时，请先 **关闭编辑模式**。

> 提示：编辑与排序是分开的——改内容开编辑模式，改顺序关编辑模式后用拖拽。

### 🔀 拖拽排序

在 **关闭编辑模式** 且 **未使用搜索** 时，通过长按拖拽调整顺序（桌面端也可长按鼠标）：

| 对象 | 列表视图 | 标签页视图 |
|------|----------|------------|
| **按钮** | 长按按钮后拖动，可在分类内换位；拖到其他分类的标签/放置区可跨分类移动 | 同上；当前标签下的按钮网格支持拖拽 |
| **分类** | 长按分类块（标题或非按钮区域），纵向拖动调整分类顺序 | 长按标签，在目标标签上悬停约 0.4 秒确认放置后松手完成换位 |

- 松手后顺序会自动写入插件数据。
- **开启编辑模式** 或 **正在搜索** 时无法拖拽排序。

#### 📱 移动端触摸操作

- **滑动页面**：在面板上快速上下滑（列表视图），或在标签栏上左右滑（标签页视图），无需长按。
- **拖拽排序**：在按钮或分类/标签上长按约 0.5 秒后再拖动；拖拽过程中会锁定面板滚动，便于跟手移动。
- 若在长按完成前发生明显滑动，将视为滚动手势，不会进入拖拽。

### 🧭 顶部导航栏

- 面板顶部新增导航栏，集成以下功能：
    - **面板视图切换**：在标签页视图和列表视图间切换
    - **按钮样式切换**：一键切换不同的按钮样式
    - **编辑模式开关**：快速进入/退出编辑模式
    - **搜索功能**：点击搜索图标打开搜索框，实时过滤分类和按钮名称
    - **按钮面板设置**：快速打开面板设置页面
- **标签栏横向滚动**（标签页视图、标签较多时）：移动端在标签栏上左右滑动；PC 端将鼠标悬停在标签栏，按住 **Shift** 并滚动鼠标滚轮即可左右滑动。
- 导航栏设计简洁直观，提升操作效率和用户体验。

### 🔍 搜索功能

- 点击导航栏中的搜索图标即可打开搜索框
- 输入关键字后，面板会自动过滤显示匹配的分类和按钮
- 搜索仅过滤分类名称和按钮名称，支持实时更新
- 点击清除按钮或关闭搜索框可清空搜索条件

### 🧩 脚本功能说明

- 在按钮编辑界面，将动作类型选择为"脚本"，并选择或输入脚本文件名（仅支持 `.js` 文件）。
- 脚本文件需放在插件设置中指定的脚本文件夹（如 `scripts/`），可在设置页自定义路径。
- 支持两种脚本格式：
    - **QuickAdd 脚本格式**：脚本需导出一个异步函数，例如：

        ```js
        // scripts/hello.js
        module.exports = async function (params, app, plugin, notice) {
            notice('Hello from script!');
            // 你可以在这里访问 Obsidian API、插件实例等
        };
        ```

    - **Components 脚本格式**：脚本需导出一个对象，对象的 `default.entry` 为异步函数，例如：

        ```js
        // scripts/components-demo.js
        exports.default = {
            entry: async function (params, app, plugin, notice) {
                notice('Hello from Components script!');
                // 你可以在这里访问 Obsidian API、插件实例等
            },
        };
        ```

- 脚本运行时会自动注入 `app`（Obsidian 实例）、`plugin`（插件实例）、`notice`（通知方法）。
- 脚本异常会自动捕获并弹出通知。
- **安全提示**：请勿运行不明来源的脚本，脚本执行有一定安全风险。

> 示例：你可以编写批量处理、自动化等高级脚本，并通过按钮一键运行。

> 示例：你可以为一个按钮配置“新建文件→插入模板→运行脚本”三步操作，点击该按钮后会自动依次完成所有操作，无需手动多次点击。

## 🛠️ 开发指南

- 克隆此仓库
- 确保你的 NodeJS 版本至少为 v18 (`node --version`)，推荐使用 LTS 版本
- 使用 `npm install` 安装依赖
- 使用 `npm run dev` 启动开发模式并进行实时编译（自动部署到测试仓库）
- 运行 `npm run build` 构建生产版本并部署到测试仓库
- 运行 `npm run lint` 进行代码检查
- 如需部署到自定义仓库，请在项目根目录创建 `.env` 文件并添加：`VAULT_PATH=/path/to/your/vault`

## 🎨 技术栈

- **TypeScript**: 类型安全的 JavaScript，严格模式
- **React**: 用于构建用户界面的现代框架
- **Obsidian API**: 官方插件 API
- **Lucide Icons**: 现代化图标库（6000+ 图标）
- **CSS Grid & Flexbox**: 响应式布局
- **ESBuild**: 快速构建工具，支持 TypeScript 和 React
- **@dnd-kit**: 按钮与分类拖拽排序

## 📄 许可证

本项目采用 MIT 许可证 - 详情请参阅 [LICENSE](LICENSE) 文件。

## 🌟 支持与帮助

如果这个插件对您有帮助，请考虑：

- ⭐ **给仓库“点星”**
- 🐛 使用 [bug 报告模板](https://github.com/TracingOrigins/obsidian-buttons-panel-plugin/issues/new?template=bug_report.md) 提交错误报告
- 💡 使用 [功能请求模板](https://github.com/TracingOrigins/obsidian-buttons-panel-plugin/issues/new?template=feature_request.md) 提交功能建议
- ❓ 在我们的 [讨论区](https://github.com/TracingOrigins/obsidian-buttons-panel-plugin/discussions) 提问或分享想法
- 📝 参阅 [贡献指南](docs/contributing/contributing.zh.md)，为本项目贡献代码或文档
- 💰 为开发者提供[赞助](https://support.tracingorigins.top/zh)（如果可用）

## 🙏 致谢

本插件部分图标资源来自开源项目 [Lucide](https://github.com/lucide-icons/lucide)，遵循 ISC License 协议。
