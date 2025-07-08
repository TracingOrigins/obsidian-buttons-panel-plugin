> 中文 | [Ehglish](https://github.com/TracingOrigins/obsidian-buttons-panel-plugin/blob/master/README.md)

# Obsidian 按钮面板插件

一个现代化的 Obsidian 插件，用于创建自定义按钮面板，快速访问文件、命令、链接和脚本。

---

## ✨ 功能特性

- 🎯 **快速访问**：一键打开文件、执行命令、访问链接或运行脚本
- 🎨 **图标选择器**：集成 Lucide 图标库，支持搜索和预览
- 🏷️ **标签页视图**：支持列表视图和标签页视图两种展示模式
- 📁 **分类管理**：按分类组织按钮，支持拖动排序
- ⚙️ **灵活配置**：可配置面板布局、按钮样式和动画效果
- 📱 **响应式设计**：支持桌面和移动设备
- 🌙 **主题适配**：自动适配 Obsidian 的明暗主题
- 🎛️ **独立设置页**：设置页面在独立标签页中打开，便于管理
- 🔄 **实时更新**：设置变更实时生效，无需重启
- 🛡️ **表单校验**：按钮编辑时，所有必填项（如按钮名称、文件路径、命令ID、网址、文件夹、脚本名称）为空会高亮红色边框，直观提示，**无弹窗打扰**

---

## 🚀 安装

1. 下载最新版本的插件（[Releases](https://github.com/TracingOrigins/obsidian-buttons-panel-plugin/releases)）
2. 将插件文件夹放入你的 Obsidian 插件目录（通常为 `.obsidian/plugins/`，如 `你的库/.obsidian/plugins/obsidian-buttons-panel-plugin/`）
3. 在 Obsidian 设置 → 第三方插件中启用本插件

---

## 📖 使用方法

### 打开按钮面板

- 命令面板（Ctrl+P）执行 "打开按钮面板（右侧边栏）"
- 点击左侧 ribbon 网格图标快速打开面板和配置页
- 按钮面板将在右侧边栏中打开，方便快速访问

### 打开按钮面板设置页面

- 命令面板执行 "打开按钮面板设置（中央内容区域）"
- 设置页面将在中央内容区域中打开，便于详细配置
- 也可在 Obsidian 设置页面的插件设置中进行配置

### 支持的动作类型

- **打开文件**: 打开任意文件
- **执行命令**: 执行 Obsidian 命令
- **打开链接**: 打开外部网页链接
- **创建文件**: 在指定位置创建新文件，支持日期变量（如 `{{DATE:YYYY-MM-DD}}`）和模板内容
- **运行脚本**: 运行库中自定义的 JS 脚本（目前支持 QuickAdd和Components 两种脚本格式），可实现自动化、批量处理等高级功能。脚本需放在设置指定的脚本文件夹下。

### 表单校验体验

- 新建或编辑按钮时，点击"保存"会自动校验所有必填项
- 若有必填项为空，相关输入框会高亮红色边框，**不会弹出提示框**
- 补全内容后红色高亮自动消失，体验流畅

### 面板配置

- **面板标题**: 设置面板显示标题
- **显示标题**: 控制是否在面板中显示标题
- **面板高度**: 自定义面板的高度（如 `auto`、`300px`）
- **视图模式**: 选择列表视图或标签页视图
- **按钮样式**: 图标和文本同行或图标在上文本在下
- **动画效果**: 启用按钮悬停动画

> 示例：你可以将面板高度设置为 `400px`，并选择"标签页视图"，让不同分类的按钮分组显示。

### 路径配置

- **模板文件夹路径**: 设置用于存储模板文件的文件夹路径（如 `templates/`），创建文件动作会使用此路径下的模板
- **脚本文件夹路径**: 设置用于存储脚本文件的文件夹路径（如 `scripts/`），运行脚本动作会从此路径加载脚本文件
- **路径验证**: 输入路径时会实时验证文件夹是否存在，无效路径会高亮红色边框提示
- **一键创建**: 点击"创建路径"按钮可自动创建不存在的文件夹，方便快速设置

> 示例：你可以设置模板文件夹为 `templates/`，脚本文件夹为 `scripts/`，这样创建文件和运行脚本功能就能正常工作了。

### 按钮管理

- **分类组织**: 按分类分组管理按钮
- **拖动排序**: 支持按钮和分类的拖动排序
- **图标选择**: 从 6000+ Lucide 图标中选择
- **实时预览**: 配置时实时预览按钮效果

> 示例：你可以新建多个分类，每个分类下添加不同的按钮，并通过拖拽调整顺序。

### 🧩 脚本功能说明

- 在按钮编辑界面，将动作类型选择为"脚本"，并选择或输入脚本文件名（仅支持 `.js` 文件）。
- 脚本文件需放在插件设置中指定的脚本文件夹（如 `scripts/`），可在设置页自定义路径。
- 支持两种脚本格式：
  - **QuickAdd 脚本格式**：脚本需导出一个异步函数，例如：

    ```js
    // scripts/hello.js
    module.exports = async function(params, app, plugin, notice) {
      notice('Hello from script!');
      // 你可以在这里访问 Obsidian API、插件实例等
    }
    ```

  - **Components 脚本格式**：脚本需导出一个对象，对象的 `default.entry` 为异步函数，例如：

    ```js
    // scripts/components-demo.js
    exports.default = {
      entry: async function(params, app, plugin, notice) {
        notice('Hello from Components script!');
        // 你可以在这里访问 Obsidian API、插件实例等
      }
    }
    ```

- 脚本运行时会自动注入 `app`（Obsidian 实例）、`plugin`（插件实例）、`notice`（通知方法）。
- 脚本异常会自动捕获并弹出通知。
- **安全提示**：请勿运行不明来源的脚本，脚本执行有一定安全风险。

> 示例：你可以编写批量处理、自动化等高级脚本，并通过按钮一键运行。

---

## 🛠️ 开发

### 项目结构

```text
src/
├── assets/             # 静态资源
│   └── icons.json      # Lucide 图标数据
├── core/               # 核心业务逻辑
│   └── ActionDispatcher.ts # 动作执行逻辑
├── services/           # 服务层
│   ├── CreateFileService.ts # 创建文件服务
│   ├── ExecuteCommandService.ts # 命令执行服务
│   ├── OpenFileService.ts # 文件打开服务
│   ├── OpenUrlService.ts # 链接打开服务
│   └── RunScriptService.ts # 脚本运行服务
├── views/              # 视图层组件
│   ├── ButtonsPanel.ts # 按钮面板视图
│   └── PanelSettingsView.ts # 面板设置视图
├── settings/           # 设置相关组件
│   ├── SettingsTab/    # 设置标签页组件
│   │   ├── index.ts    # 设置标签页主组件
│   │   ├── ButtonManagementSection.ts # 按钮管理部分
│   │   ├── PanelConfigSection.ts # 面板设置部分
│   │   ├── PathConfigSection.ts # 路径配置部分
│   │   └── HelpSection.ts # 帮助文档部分
│   └── modals/         # 设置相关弹窗
│       ├── ButtonEditModal/ # 按钮编辑弹窗
│       │   ├── index.ts # 主按钮编辑弹窗
│       │   ├── NameSection.ts # 名称输入部分
│       │   ├── IconSection.ts # 图标选择部分
│       │   ├── ScopeSection.ts # 作用域下拉部分
│       │   ├── OpenFileSection.ts # 文件选择部分
│       │   ├── ExcuteCommandSection.ts # 命令选择部分
│       │   ├── OpenUrlSection.ts # 链接输入部分
│       │   ├── CreateFileSection.ts # 创建文件输入部分
│       │   ├── RunScriptSection.ts # 脚本选择部分
│       ├── CommandSearchModal.ts # 命令搜索弹窗
│       ├── FileSearchModal.ts # 文件搜索弹窗
│       ├── FolderSearchModal.ts # 文件夹搜索弹窗
│       ├── IconSearchModal.ts # 图标搜索弹窗
│       ├── FileNameSuggestModal.ts # 文件名建议弹窗
│       ├── CreateCategoryModal.ts # 创建分类弹窗
│       ├── RenameCategoryModal.ts # 重命名分类弹窗
│       ├── DeleteButtonModal.ts # 删除按钮确认弹窗
│       └── DeleteCategoryModal.ts # 删除分类确认弹窗
├── locales/            # 国际化文件
│   ├── en.json         # 英文翻译
│   └── zh.json         # 中文翻译
├── types/              # 类型定义
│   ├── index.ts        # 接口和类型
│   └── plugin.ts       # 插件类型声明
├── utils/              # 工具函数
│   ├── i18n.ts         # 国际化工具
│   ├── path.ts         # 路径处理工具
│   └── validation.ts   # 表单验证工具
└── main.ts             # 主入口文件
```

### 构建

```bash
npm install
npm run build
```

### 开发模式

```bash
npm run dev
```

---

## 🎨 技术栈

- **TypeScript**: 类型安全的 JavaScript
- **Obsidian API**: 官方插件 API
- **Lucide Icons**: 现代化图标库
- **CSS Grid**: 响应式布局
- **ESBuild**: 快速构建工具

---

## 📄 许可证

MIT License

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

- 如有建议、Bug 或新需求，欢迎在 [GitHub Issues](https://github.com/TracingOrigins/obsidian-buttons-panel-plugin/issues) 提出
- 参与贡献请先阅读项目代码结构和注释，建议使用分支提交 PR
- 也欢迎补充文档、翻译、优化样式等方面的贡献

---

## 📝 更新日志

### v1.0.0
- 🎉 首个正式版发布！
- 📋 支持自定义按钮面板，快速访问文件、命令、链接和脚本
- 🗂️ 分类管理与拖拽排序
- ⚡ 支持文件、命令、链接及新建文件等多种动作
- 🖼️ 内置 Lucide 图标选择器
- 📱 响应式设计，自动适配明暗主题
- 🎛️ 独立设置标签页，配置更便捷
- 🧩 侧边栏集成，随时一键打开

### v1.1.0
- 🔧 重构：重命名一些文件名，更新相关类型和所有引用

---

## 致谢

本插件部分图标资源来自开源项目 [Lucide](https://github.com/lucide-icons/lucide)，遵循 ISC License 协议。