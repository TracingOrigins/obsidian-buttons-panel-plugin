<div align="center">
    <h1>Buttons Panel</h1>
    <p>
        <img src="https://img.shields.io/badge/dynamic/json?logo=obsidian&color=%23483699&label=downloads&query=%24%5B%22buttons-panel%22%5D.downloads&url=https%3A%2F%2Fraw.githubusercontent.com%2Fobsidianmd%2Fobsidian-releases%2Fmaster%2Fcommunity-plugin-stats.json" alt="Obsidian Downloads">
        <img src="https://img.shields.io/github/downloads/TracingOrigins/obsidian-buttons-panel-plugin/total?logo=github" alt="GitHub Downloads">
    </p>
    <p>[中文 | <a href="https://github.com/TracingOrigins/obsidian-buttons-panel-plugin/blob/master/README.md">English</a> | <a href="https://github.com/TracingOrigins/obsidian-buttons-panel-plugin/blob/master/README.ru.md">Русский</a>]</p>
    <p><a href="https://community.obsidian.md/plugins/buttons-panel" target="_blank">Buttons Panel</a> 是一个现代化的 Obsidian 插件，用于创建自定义按钮面板，快速访问文件、命令、链接和脚本。</p>
</div>

## ✨ 功能介绍

- 🎯 **快速访问**：一键打开文件、执行命令、访问链接或运行脚本
- 🎨 **图标选项**：支持从 Lucide 图标库搜索和预览，也可使用自定义 SVG 图标
- 🏷️ **三种视图模式**：支持列表视图、标签页视图和文件夹视图
- 📁 **文件夹视图**：仿安卓桌面文件夹风格，支持拖拽排序、悬停自动展开、📌固定、点击空白关闭、名称可编辑
- 📁 **分类管理**：按分类组织按钮，支持长按拖拽调整分类与按钮顺序
- ⚙️ **灵活配置**：可配置面板布局、按钮样式和动画效果
- 📱 **全端支持**：兼容 Obsidian 所支持的桌面端与移动端（Windows、macOS、Linux、iOS、Android）
- 🌙 **主题适配**：自动适配 Obsidian 的明暗主题
- 🔄 **实时更新**：设置变更实时生效，无需重启
- 🛡️ **表单校验**：按钮编辑时，所有必填项（如按钮名称、文件路径、命令ID、网址、文件夹、脚本名称）为空会高亮红色边框，直观提示
- 🖱️ **交互模式**：三种模式 — 锁定布局（仅查看）、排序模式（拖拽排序）、编辑模式（右键菜单编辑/复制/删除）— 可从顶部导航栏切换
- 🧭 **顶部导航栏**：下拉菜单快速切换视图模式、按钮样式和交互模式，集成搜索与设置入口
- 🔍 **搜索功能**：导航栏集成搜索功能，支持实时过滤分类和按钮，快速定位目标内容。
- 🔗 **动作序列**：支持为单个按钮配置多个动作，点击按钮可一键依次执行多个操作。

## 🚀 下载安装

### 🏪 通过官方插件市场安装（推荐）

1. 打开 Obsidian，进入 **设置 → 第三方插件**。
2. 点击 **浏览**，搜索「Buttons Panel」。
3. 点击 **安装**，然后 **启用**。

### 📦 手动安装

1. 从 [Releases](https://github.com/TracingOrigins/obsidian-buttons-panel-plugin/releases) 下载最新版本的 `main.js`、`manifest.json`、`styles.css`
2. 在 Obsidian 插件目录下创建 `buttons-panel` 文件夹（如 `你的库/.obsidian/plugins/buttons-panel/`），将上述三个文件放入其中
3. 在 Obsidian 设置 → 第三方插件中启用本插件

### 🔧 通过BRAT安装（推荐给测试用户）

1. 安装 [BRAT](https://github.com/TfTHacker/obsidian42-brat) 插件
2. 在 BRAT 设置中点击"添加测试插件"
3. 输入 `TracingOrigins/obsidian-buttons-panel-plugin`
4. 启用插件

## 📖 使用方法

### 🎯 按钮面板

命令面板（Ctrl+P）执行 "打开按钮面板"，或点击左侧功能区图标快速打开面板

- **视图模式**：从顶部导航栏下拉菜单切换列表视图、标签页视图或文件夹视图
- **按钮样式**：从顶部导航栏下拉菜单切换图标在左或图标在上
- **交互模式**：从顶部导航栏下拉菜单切换锁定布局、排序模式、编辑模式

### ⚙️ 按钮面板选项

点击导航栏设置按钮，或进入 **设置 → 第三方插件 → Buttons Panel**

- **显示顶部导航栏**：控制顶部导航栏的显示与隐藏
- **启用按钮动画**：启用或禁用按钮的鼠标悬停动画效果

#### 列表视图

- **列表视图默认折叠**：启用后，每次切换到列表视图时所有分类默认折叠

#### 标签页视图

- **标签页自动换行**：启用后标签页超出宽度自动换行，否则横向滚动

#### 文件夹视图

- **文件夹名称可编辑**：展开的文件夹中单击名称可重命名
- **显示按钮个数**：在文件夹磁贴上显示按钮数量
- **点击空白关闭**：展开后点击空白区域可关闭文件夹

#### 路径

- **模板文件夹路径**：设置用于存储模板文件的文件夹路径（如 `templates/`），创建文件动作会使用此路径下的模板
- **脚本文件夹路径**：设置用于存储脚本文件的文件夹路径（如 `scripts/`），运行脚本动作会从此路径加载脚本文件
- **一键创建**：点击"创建路径"按钮可自动创建不存在的文件夹

### 🔗 按钮与动作

#### 动作序列

- **动作序列**: 一个按钮可配置多个动作（如先新建文件再插入模板、再运行脚本），点击按钮后会自动依次执行。每个动作可为不同类型，极大提升自动化和批量处理能力。
    - **配置方法**：在按钮编辑界面，点击"添加动作"添加多个动作，并可拖拽调整顺序。
    - **典型场景**：如一键新建并打开模板笔记、批量执行多条命令、自动化日常操作等。

#### 支持的动作类型

- **打开文件**: 打开任意文件
- **执行命令**: 执行 Obsidian 命令
- **打开链接**: 打开外部网页链接
- **创建文件**: 在指定位置创建新文件，文件名支持日期变量（如 `{{DATE:YYYY-MM-DD}}`），内容可使用固定模板
- **运行脚本**: 运行库中自定义的 JS 脚本，脚本需放在路径配置指定的脚本文件夹下。

### ✅ 表单校验

- 新建或编辑按钮时，点击"保存"会自动校验所有必填项
- 若有必填项为空，相关输入框会高亮红色边框
- 补全内容后红色高亮自动消失

### 🧭 顶部导航栏

- **搜索功能**：点击搜索图标打开搜索框，输入关键字实时过滤分类和按钮名称。点击清除按钮或关闭搜索框可清空搜索条件。
- **面板视图切换**：在标签页视图和列表视图间切换
- **按钮样式切换**：一键切换不同的按钮样式
- **交互模式**：下拉菜单切换锁定布局、排序模式、编辑模式
- **按钮面板设置**：快捷打开插件设置页面
- **标签栏横向滚动**（标签页视图、标签较多时）：移动端左右滑动；PC 端悬停标签栏，按住 **Shift** 滚动鼠标滚轮。

### 🖱️ 交互模式

点击导航栏编辑按钮弹出下拉菜单，三种模式可选：

| 模式 | 图标 | 行为 |
|------|------|------|
| 🔒 **锁定布局** | `lock` | 仅查看 — 所有交互禁用（无拖拽、无右键菜单） |
| ↕️ **排序模式** | `arrow-up-down` | 长按拖拽调整按钮和分类顺序 |
| ✏️ **编辑模式** | `pencil` | 右键/长按弹出菜单，可新建、编辑、复制、删除 |

- 在顶部导航栏下拉菜单或面板配置中切换模式。
- **仅在排序模式下可拖拽排序**。
- **仅在编辑模式下显示编辑控件和右键菜单**。

### 📁 文件夹视图

在导航栏或设置中切换到文件夹视图，分类将以磁贴形式展示。

| 功能 | 说明 |
|------|------|
| **打开/关闭** | 点击磁贴展开；点击外部、按 ESC、或点击空白区域（可配置）关闭 |
| **📌 固定** | 点击 📌 图标锁定文件夹，不会因任何操作关闭，直到取消固定或切换文件夹 |
| **编辑名称** | 单击文件夹名称可重命名（可在设置中开关） |
| **拖拽排序** | 排序模式下长按拖拽磁贴调整分类顺序 |
| **跨文件夹拖拽** | 从已展开文件夹拖出按钮 → 文件夹自动关闭 → 悬停其他磁贴 0.6 秒 → 自动展开 → 继续排序 |
| **边缘滚动** | 展开的文件夹内拖拽按钮到边缘自动滚动 |

### 📦 拖拽排序

在 **排序模式** 且 **未使用搜索** 时，通过长按拖拽调整顺序（桌面端也可长按鼠标）：

| 对象 | 列表视图 | 标签页视图 | 文件夹视图 |
|------|----------|------------|------------|
| **按钮** | 长按按钮后拖动，可在分类内换位；拖到其他分类的标签/放置区可跨分类移动 | 同上；当前标签下的按钮网格支持拖拽 | 在展开的文件夹内或跨文件夹拖拽；悬停磁贴 0.6 秒自动展开 |
| **分类** | 长按分类块（标题或非按钮区域），纵向拖动调整分类顺序 | 长按标签，在目标标签上悬停约 0.4 秒确认放置后松手完成换位 | 长按磁贴在网格中拖拽排序 |

- 松手后顺序自动保存。
- **锁定布局**、**编辑模式** 或 **正在搜索** 时无法拖拽排序。

#### 📱 移动端触摸操作

- **滑动页面**：在面板上快速上下滑（列表视图），或在标签栏上左右滑（标签页视图），无需长按。
- **拖拽排序**：在按钮或分类/标签上长按约 0.5 秒后再拖动；拖拽过程中会锁定面板滚动。
- 若在长按完成前发生明显滑动，将视为滚动手势，不会进入拖拽。

### 脚本功能说明

- **选择脚本**：在按钮编辑界面将动作类型选择为"脚本"，并选择或输入脚本文件名（仅支持 `.js` 文件）。
- **脚本位置**：脚本文件需放在路径配置指定的脚本文件夹（如 `scripts/`）。
- **唯一格式**：脚本使用 CommonJS 的 `module.exports` 导出，入口函数**无参数**，通过 `this.$context` 获取上下文：

    ```js
    // scripts/hello.js
    module.exports = {
        entry: main,
        name: {
            zh: '打招呼',
            en: 'Say hello',
            ru: 'Поздороваться',
        },
        description: {
            zh: '向通知栏发送一条问候。',
            en: 'Send a greeting to the notice bar.',
            ru: 'Отправить приветствие в уведомление.',
        },
        tags: ['demo'],
    };

    async function main() {
        const { app, obsidian, notice } = this.$context;
        notice('Hello from script!');
    }
    ```

- **运行上下文**：入口函数内通过 `this.$context` 获取，包含 `app`（运行中的 `obsidian.App` 实例，不是类本身，不能 `new`）、`plugin`、`obsidian`（模块命名空间，可解构 `Notice`/`TFile`/`Modal` 等）、`requestUrl`（等价于 `obsidian.requestUrl`，可规避 CORS）、`notice`（等价于 `new obsidian.Notice(msg)`）。
- **入口函数必须用普通函数**：箭头函数没有自己的 `this`，无法获取 `$context`。
- **辅助函数**：辅助函数不会自动拿到上下文，请由入口函数显式传参，例如 `await renameFile(app, obsidian, file)`。
- **本地化**：`name` / `description` 支持本地化对象（键 `zh`/`en`/`ru`，缺语言时回退 `en` → `zh`）或普通字符串，在按钮设置里选择脚本时，下拉框会**按 Obsidian 当前语言**显示。
- **字段顺序**：建议 `entry` → `name` → `description` → `tags`；其中 `entry` 必填，指向要执行的函数；`tags` 为可选的字符串数组，用于分类；辅助函数可直接写在同文件，不影响导出。
- **异常与安全**：脚本异常会自动捕获并弹通知；**请勿运行不明来源的脚本**。

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
