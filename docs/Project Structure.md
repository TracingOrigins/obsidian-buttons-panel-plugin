## ✨ Project Structure

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
