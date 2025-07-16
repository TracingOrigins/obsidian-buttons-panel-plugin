> English | [中文](./structure.zh.md)

## ✨ Project Structure

```text
src/
├── assets/                 # Static assets
├── common/                 # Common reusable modules
│   ├── actions/            # Shared action types, factories, and logic
│   ├── components/         # Shared UI components
│   ├── modals/             # Shared modal dialogs
│   ├── types/              # Shared type definitions
│   └── utils/              # Shared utility functions
├── core/                   # Core business logic (e.g. ActionDispatcher)
├── locales/                # Localization files
├── services/               # Service layer (file, command, script, url, etc.)
├── settings/               # Settings page specific modules
│   └── sections/           # Settings page sections
└── views/                  # Main panel view layer
    ├── managers/           # View state and move managers (panel only)
    └── renderers/          # View renderers
```

- All directories and files use camelCase or PascalCase for easy maintenance and lookup.
- Clear separation of common, views, settings, services, and core for scalability and collaboration.
- Major features such as button panel, categories, actions, scripts, settings, and i18n are modularized.
