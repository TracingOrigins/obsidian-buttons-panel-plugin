> 中文 | [English](./structure.md)

## ✨ 项目结构

```text
src/
├── assets/                 # 静态资源
│   └── icons.json          # Lucide 图标数据
├── core/                   # 核心业务逻辑
│   └── ActionDispatcher.ts # 动作执行分发器
├── locales/                # 国际化
│   ├── en.json             # 英文翻译
│   └── zh.json             # 中文翻译
├── main.ts                 # 插件主入口
├── services/               # 服务层
│   ├── CommandService.ts
│   ├── CreateFileService.ts
│   ├── FileService.ts
│   ├── ScriptService.ts
│   └── UrlService.ts
├── settings/               # 设置相关
│   ├── actions/            # 按钮动作类型工厂与实现
│   │   ├── ActionSequence.ts
│   │   ├── actionTypes.ts
│   │   ├── ButtonActionFactory.ts
│   │   ├── CommandAction.ts
│   │   ├── CreateFileAction.ts
│   │   ├── FileAction.ts
│   │   ├── IButtonAction.ts
│   │   ├── ScriptAction.ts
│   │   ├── UrlAction.ts
│   ├── components/         # 设置页表单输入组件
│   │   ├── CommandInput.ts
│   │   ├── FileInput.ts
│   │   ├── FileNameInput.ts
│   │   ├── FolderInput.ts
│   │   ├── IconInput.ts
│   │   ├── NameInput.ts
│   │   ├── ScopeDropdown.ts
│   │   ├── ScriptInput.ts
│   │   ├── UrlInput.ts
│   │   └── index.ts
│   ├── modals/             # 设置相关弹窗
│   │   ├── AddButtonModal.ts
│   │   ├── CommandSearchModal.ts
│   │   ├── CreateCategoryModal.ts
│   │   ├── DeleteButtonModal.ts
│   │   ├── DeleteCategoryModal.ts
│   │   ├── EditButtonModal.ts
│   │   ├── FileNameSuggestModal.ts
│   │   ├── FileSearchModal.ts
│   │   ├── FolderSearchModal.ts
│   │   ├── IconSearchModal.ts
│   │   ├── RenameCategoryModal.ts
│   ├── sections/           # 设置页分区
│   │   ├── ButtonManagementSection.ts
│   │   ├── HelpSection.ts
│   │   ├── PanelConfigSection.ts
│   │   └── PathConfigSection.ts
│   └── ButtonsPanelSettingTab.ts # 设置页主入口
├── types/                  # 类型定义
│   ├── action.ts
│   ├── global.d.ts
│   ├── index.ts
│   ├── plugin.ts
│   └── settings.ts
├── utils/                  # 工具函数
│   ├── buttonFactory.ts
│   ├── dom.ts
│   ├── i18n.ts
│   ├── obsidian.ts
│   └── path.ts
└── views/                  # 视图层
    ├── ButtonsPanelView.ts         # 主面板视图
    ├── PanelSettingsView.ts        # 面板设置视图
    ├── managers/                   # 视图状态与移动管理
    │   ├── ButtonMoveManager.ts
    │   ├── CategoryMoveManager.ts
    │   └── ViewStateManager.ts
    └── renderers/                  # 视图渲染器
        ├── ButtonMoveModeRenderer.ts
        ├── ButtonRenderer.ts
        ├── CategoryMoveModeRenderer.ts
        ├── ListRenderer.ts
        ├── PanelActionsRenderer.ts
        ├── PanelRenderer.ts
        ├── TabsRenderer.ts
```

- 目录和文件命名均采用小驼峰或大驼峰风格，便于维护和查找。
- 视图、设置、服务、类型、工具等分层清晰，便于扩展和协作。
- 主要功能如按钮面板、分类、动作、脚本、设置、国际化等均有独立模块。
