> English | [中文](./structure.zh.md)

## ✨ Project Structure

```text
src/
├── assets/                 # Static assets
│   └── icons.json          # Lucide icon data
├── core/                   # Core business logic
│   └── ActionDispatcher.ts # Action dispatcher
├── locales/                # Localization
│   ├── en.json             # English translations
│   └── zh.json             # Chinese translations
├── main.ts                 # Plugin entry point
├── services/               # Service layer
│   ├── CommandService.ts
│   ├── CreateFileService.ts
│   ├── FileService.ts
│   ├── ScriptService.ts
│   └── UrlService.ts
├── settings/               # Settings related
│   ├── actions/            # Button action types and factory
│   │   ├── ActionSequence.ts
│   │   ├── actionTypes.ts
│   │   ├── ButtonActionFactory.ts
│   │   ├── CommandAction.ts
│   │   ├── CreateFileAction.ts
│   │   ├── FileAction.ts
│   │   ├── IButtonAction.ts
│   │   ├── ScriptAction.ts
│   │   ├── UrlAction.ts
│   ├── components/         # Form input components for settings
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
│   ├── modals/             # Settings related modals
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
│   ├── sections/           # Settings page sections
│   │   ├── ButtonManagementSection.ts
│   │   ├── HelpSection.ts
│   │   ├── PanelConfigSection.ts
│   │   └── PathConfigSection.ts
│   └── ButtonsPanelSettingTab.ts # Settings main entry
├── types/                  # Type definitions
│   ├── action.ts
│   ├── global.d.ts
│   ├── index.ts
│   ├── plugin.ts
│   └── settings.ts
├── utils/                  # Utility functions
│   ├── buttonFactory.ts
│   ├── dom.ts
│   ├── i18n.ts
│   ├── obsidian.ts
│   └── path.ts
└── views/                  # View layer
    ├── ButtonsPanelView.ts         # Main panel view
    ├── PanelSettingsView.ts        # Panel settings view
    ├── managers/                   # View state and move managers
    │   ├── ButtonMoveManager.ts
    │   ├── CategoryMoveManager.ts
    │   └── ViewStateManager.ts
    └── renderers/                  # View renderers
        ├── ButtonMoveModeRenderer.ts
        ├── ButtonRenderer.ts
        ├── CategoryMoveModeRenderer.ts
        ├── ListRenderer.ts
        ├── PanelActionsRenderer.ts
        ├── PanelRenderer.ts
        ├── TabsRenderer.ts
```

- All directories and files use camelCase or PascalCase for easy maintenance and lookup.
- Clear separation of views, settings, services, types, and utilities for scalability and collaboration.
- Major features such as button panel, categories, actions, scripts, settings, and i18n are modularized.
