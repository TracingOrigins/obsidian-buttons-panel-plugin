> Ehglish | [中文](https://github.com/TracingOrigins/obsidian-buttons-panel-plugin/blob/master/README.zh.md)

# Obsidian Buttons Panel Plugin

A modern Obsidian plugin for creating a customizable button panel to quickly access files, commands, links, and scripts.

---

## ✨ Features

- 🎯 **Quick Access**: One-click to open files, execute commands, visit links, or run scripts
- 🎨 **Icon Picker**: Integrated Lucide icon library with search and preview
- 🏷️ **Tabbed View**: Supports both list and tabbed display modes
- 📁 **Category Management**: Organize buttons by category, supports drag-and-drop sorting
- ⚙️ **Flexible Configuration**: Panel layout, button style, and animation are all configurable
- 📱 **Responsive Design**: Works on both desktop and mobile devices
- 🌙 **Theme Adaptation**: Automatically adapts to Obsidian's light and dark themes
- 🎛️ **Dedicated Settings Tab**: Manage settings in a separate tab for convenience
- 🔄 **Live Updates**: Changes take effect immediately, no restart required
- 🛡️ **Form Validation**: Required fields (button name, file path, command ID, URL, folder, script name) are highlighted in red if empty—no intrusive popups

---

## 🚀 Installation

1. Download the latest release ([Releases](https://github.com/TracingOrigins/obsidian-buttons-panel-plugin/releases))
2. Place the plugin folder into your Obsidian plugins directory (usually `.obsidian/plugins/`, e.g. `YourVault/.obsidian/plugins/obsidian-buttons-panel-plugin/`)
3. Enable the plugin in Obsidian Settings → Community Plugins

---

## 📖 Usage

### Open the Button Panel

- Use the command palette (Ctrl+P) and run "Open buttons panel (right sidebar)"
- Click the grid icon in the left ribbon to quickly open the panel and settings
- The button panel will appear in the right sidebar for quick access

### Open the Button Panel Settings Page

- Use the command palette to run "Open buttons panel settings (central content area)"
- The settings page will open in the central content area for detailed configuration
- You can also configure in the plugin settings under Obsidian Settings

### Supported Action Types

- **File**: Open any file
- **Command**: Execute an Obsidian command
- **Link**: Open an external web link
- **Create File**: Create a new file at a specified location, supports date variables (e.g. `{{DATE:YYYY-MM-DD}}`) and templates
- **Script**: Run a custom JS script from your vault (supports both QuickAdd and Components script formats), enabling automation and advanced workflows. Scripts must be placed in the configured script folder.

### Form Validation Experience

- When creating or editing a button, clicking "Save" will automatically validate all required fields
- If any required field is empty, the corresponding input will be highlighted in red (no popup)
- The red highlight disappears automatically once the field is filled

### Panel Settings

- **Panel Title**: Set the panel's display title
- **Show Title**: Toggle the display of the panel title
- **Panel Height**: Customize the panel height (e.g. `auto`, `300px`)
- **View Mode**: Choose between list or tabbed view
- **Button Style**: Icon and text on the same line, or icon above text
- **Animation**: Enable button hover animation

> Example: Set the panel height to `400px` and choose "Tabbed View" to group buttons by category.

### Path Configuration

- **Template Folder Path**: Set the folder path for storing template files (e.g., `templates/`). The create file action will use templates from this path
- **Script Folder Path**: Set the folder path for storing script files (e.g., `scripts/`). The run script action will load script files from this path
- **Path Validation**: Paths are validated in real-time when entered. Invalid paths are highlighted with a red border
- **One-Click Creation**: Click the "Create Paths" button to automatically create non-existent folders for quick setup

> Example: Set the template folder to `templates/` and script folder to `scripts/` so that the create file and run script features work properly.

### Button Management

- **Category Organization**: Manage buttons in groups by category
- **Drag-and-Drop Sorting**: Reorder buttons and categories via drag-and-drop
- **Icon Picker**: Choose from 6000+ Lucide icons
- **Live Preview**: Instantly preview button effects during configuration

> Example: Create multiple categories, add different buttons to each, and rearrange them by dragging.

### 🧩 Script Feature

- In the button editor, select "Script" as the action type and choose or enter a script file name (`.js` only).
- Script files must be placed in the script folder specified in plugin settings (e.g., `scripts/`). You can customize this path in the settings tab.
- Two script formats are supported:
  - **QuickAdd script format**: The script must export an async function, for example:

    ```js
    // scripts/hello.js
    module.exports = async function(params, app, plugin, notice) {
      notice('Hello from script!');
      // You can access the Obsidian API, plugin instance, etc. here
    }
    ```

  - **Components script format**: The script must export an object whose `default.entry` is an async function, for example:

    ```js
    // scripts/components-demo.js
    exports.default = {
      entry: async function(params, app, plugin, notice) {
        notice('Hello from Components script!');
        // You can access the Obsidian API, plugin instance, etc. here
      }
    }
    ```

- The script environment injects `app` (Obsidian instance), `plugin` (plugin instance), and `notice` (notification method).
- Script errors are automatically caught and shown as notifications.
- **Security Note**: Do not run scripts from untrusted sources. Script execution has inherent risks.

> Example: Write batch processing or automation scripts and run them with a single click.

---

## 🛠️ Development

### Project Structure

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

### Build

```bash
npm install
npm run build
```

### Development Mode

```bash
npm run dev
```

---

## 🎨 Tech Stack

- **TypeScript**: Type-safe JavaScript
- **Obsidian API**: Official plugin API
- **Lucide Icons**: Modern icon library
- **CSS Grid**: Responsive layout
- **ESBuild**: Fast build tool

---

## 📄 License

MIT License

---

## 🤝 Contributing

Contributions are welcome! Submit Issues and Pull Requests.

- For suggestions, bugs, or feature requests, please open a [GitHub Issue](https://github.com/TracingOrigins/obsidian-buttons-panel-plugin/issues)
- Before contributing, please review the project structure and comments; PRs via branches are recommended
- Documentation, translation, and style improvements are also welcome

---

## 📝 Changelog

### v1.0.0
- 🎉 First official release!
- 📋 Customizable button panel for quick access to files, commands, and links
- 🗂️ Category management and drag-and-drop sorting
- ⚡ Supports file, command, link, and file creation actions
- 🖼️ Built-in icon picker (Lucide)
- 📱 Responsive design, adapts to light/dark themes
- 🎛️ Dedicated settings tab for easy configuration
- 🧩 Sidebar integration for instant access

### v1.1.0
- 🔧 refactor: rename some file names, update related types and all references

---

## Acknowledgements

This plugin uses icons from the open-source project [Lucide](https://github.com/lucide-icons/lucide), which is licensed under the ISC License.