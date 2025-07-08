> English | [中文](#Chinese)

<h2 id = "English">✨ Project Structure</h2>

```text
src/
├── assets/             # Static assets
│   └── icons.json      # Lucide icon data
├── core/               # Core business logic
│   └── ActionDispatcher.ts # Action execution logic
├── services/           # Service layer
│   ├── CreateFileService.ts # Create file service
│   ├── ExecuteCommandService.ts # Command execution service
│   ├── OpenFileService.ts # File opening service
│   ├── OpenUrlService.ts # URL opening service
│   └── RunScriptService.ts # Script execution service
├── views/              # View layer components
│   ├── ButtonsPanel.ts # Button panel view
│   └── PanelSettingsView.ts # Panel settings view
├── settings/           # Settings related components
│   ├── SettingsTab/    # Settings tab components
│   │   ├── index.ts    # Settings tab main component
│   │   ├── ButtonManagementSection.ts # Button management section
│   │   ├── PanelConfigSection.ts # Panel configuration section
│   │   ├── PathConfigSection.ts # Path configuration section
│   │   └── HelpSection.ts # Help and documentation section
│   └── modals/         # Settings related modals
│       ├── ButtonEditModal/ # Button editing modal
│       │   ├── index.ts # Main button edit modal
│       │   ├── NameSection.ts # Name input section
│       │   ├── IconSection.ts # Icon selection section
│       │   ├── ScopeSection.ts # Scope dropdown section
│       │   ├── OpenFileSection.ts # File selection section
│       │   ├── ExcuteCommandSection.ts # Command selection section
│       │   ├── OpenUrlSection.ts # URL input section
│       │   ├── CreateFileSection.ts # Create file input section
│       │   └── RunScriptSection.ts # Script selection section
│       ├── CommandSearchModal.ts # Command search modal
│       ├── FileSearchModal.ts # File search modal
│       ├── FolderSearchModal.ts # Folder search modal
│       ├── IconSearchModal.ts # Icon search modal
│       ├── FileNameSuggestModal.ts # File name suggestion modal
│       ├── CreateCategoryModal.ts # Create category modal
│       ├── RenameCategoryModal.ts # Rename category modal
│       ├── DeleteButtonModal.ts # Delete button confirmation modal
│       └── DeleteCategoryModal.ts # Delete category confirmation modal
├── locales/            # Internationalization files
│   ├── en.json         # English translations
│   └── zh.json         # Chinese translations
├── types/              # Type definitions
│   ├── index.ts        # Interfaces and types
│   └── plugin.ts       # Plugin type declarations
├── utils/              # Utility functions
│   ├── i18n.ts         # Internationalization utilities
│   ├── path.ts         # Path handling utilities
│   └── validation.ts   # Form validation utilities
└── main.ts             # Main entry file
```

---

> 中文 | [English](#English)

<h2 id = "Chinese">✨ 项目结构</h2>

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
