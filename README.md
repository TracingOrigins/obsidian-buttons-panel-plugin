> Ehglish | [中文](https://github.com/TracingOrigins/obsidian-buttons-panel-plugin/blob/master/README.zh.md)

<h1 align="center">Buttons Panel</h1>

<p align="center">
    <img alt="Release version" src="https://img.shields.io/github/v/release/TracingOrigins/obsidian-buttons-panel-plugin?style=for-the-badge">
    <img alt="Download count" src="https://img.shields.io/github/downloads/TracingOrigins/obsidian-buttons-panel-plugin/total?style=for-the-badge">
</p>
<p align="center">
    <span>Buttons Panel is a modern Obsidian plugin for creating a customizable button panel to quickly access files, commands, links, and scripts.</span>
</p>

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

## 🚀 Installation

### 📦 Manual Installation

1. Download the latest release ([Releases](https://github.com/TracingOrigins/obsidian-buttons-panel-plugin/releases))
2. Place the plugin folder into your Obsidian plugins directory (usually `.obsidian/plugins/`, e.g. `YourVault/.obsidian/plugins/buttons-panel/`)
3. Enable the plugin in Obsidian Settings → Community Plugins

### 🔧 Install via BRAT (Recommended for Beta Users)
1. Install [BRAT](https://github.com/TfTHacker/obsidian42-brat) plugin
2. Click "Add Beta plugin" in BRAT settings
3. Enter `TracingOrigins/obsidian-buttons-panel-plugin`
4. Enable the plugin

## 📖 Usage

### 🎯 Open the Button Panel

- Use the command palette (Ctrl+P) and run "Open buttons panel (right sidebar)"
- Click the grid icon in the left ribbon to quickly open the panel and settings
- The button panel will appear in the right sidebar for quick access

### ⚙️ Open the Button Panel Settings Page

- Use the command palette to run "Open buttons panel settings (central content area)"
- The settings page will open in the central content area for detailed configuration
- You can also configure in the plugin settings under Obsidian Settings

### 🔗 Supported Action Types

- **File**: Open any file
- **Command**: Execute an Obsidian command
- **Link**: Open an external web link
- **Create File**: Create a new file at a specified location, supports date variables (e.g. `{{DATE:YYYY-MM-DD}}`) and templates
- **Script**: Run a custom JS script from your vault (supports both QuickAdd and Components script formats), enabling automation and advanced workflows. Scripts must be placed in the configured script folder.

### ✅ Form Validation Experience

- When creating or editing a button, clicking "Save" will automatically validate all required fields
- If any required field is empty, the corresponding input will be highlighted in red (no popup)
- The red highlight disappears automatically once the field is filled

### 🎛️ Panel Settings

- **Panel Title**: Set the panel's display title
- **Show Title**: Toggle the display of the panel title
- **Panel Height**: Customize the panel height (e.g. `auto`, `300px`)
- **View Mode**: Choose between list or tabbed view
- **Button Style**: Icon and text on the same line, or icon above text
- **Animation**: Enable button hover animation

> Example: Set the panel height to `400px` and choose "Tabbed View" to group buttons by category.

### 📁 Path Configuration

- **Template Folder Path**: Set the folder path for storing template files (e.g., `templates/`). The create file action will use templates from this path
- **Script Folder Path**: Set the folder path for storing script files (e.g., `scripts/`). The run script action will load script files from this path
- **Path Validation**: Paths are validated in real-time when entered. Invalid paths are highlighted with a red border
- **One-Click Creation**: Click the "Create Paths" button to automatically create non-existent folders for quick setup

> Example: Set the template folder to `templates/` and script folder to `scripts/` so that the create file and run script features work properly.

### 🎮 Button Management

- **Category Organization**: Manage buttons in groups by category
- **Drag-and-Drop Sorting**: Reorder buttons and categories via drag-and-drop
- **Icon Picker**: Choose from 6000+ Lucide icons
- **Live Preview**: Instantly preview button effects during configuration

> Example: Create multiple categories, add different buttons to each, and rearrange them by dragging.

### 🖱️ Button Context Menu (Right-Click)

- You can enable the right-click context menu for sidebar panel buttons in the panel settings.
- When enabled, right-clicking a button in the sidebar panel will show a menu with **Edit**, **Copy**, and **Delete** options:
  - **Edit**: Open the button editor modal for quick modification.
  - **Copy**: Duplicate the button (with a new ID) to the end of the same category.
  - **Delete**: Remove the button after confirmation.
- This feature is optional and can be toggled in the panel configuration section of the settings tab.

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

## 🛠️ Development

- Clone this repo
- Make sure your NodeJS is at least v16 (`node --version`)
- `npm i` or `yarn` to install dependencies
- `npm run dev` to start compilation in watch mode
- `npm run build` to build the plugin
- `npm run build:vault` to build the plugin and copy it to your vault's plugins folder(need create a .env file in the project root and add the line: VAULT_PATH=/path/to/your/vault)


## 🎨 Tech Stack

- **TypeScript**: Type-safe JavaScript
- **Obsidian API**: Official plugin API
- **Lucide Icons**: Modern icon library
- **CSS Grid**: Responsive layout
- **ESBuild**: Fast build tool

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌟 Support & Help

If this plugin helps you, consider:
- ⭐ **Starring** the repository
- 🐛 Using the [bug report template](https://github.com/TracingOrigins/obsidian-buttons-panel-plugin/issues/new?template=bug_report.md) to submit bug reports
- 💡 Using the [feature request template](https://github.com/TracingOrigins/obsidian-buttons-panel-plugin/issues/new?template=feature_request.md) to submit feature suggestions
- ❓ Asking questions or sharing ideas in our [Discussions](https://github.com/TracingOrigins/obsidian-buttons-panel-plugin/discussions)
- 📝 Referring to the [Contributing Guide](./docs/contributing.md) to contribute code or documentation
- 💰 Providing [sponsorship](https://support.tracingorigins.cn) to the developer (if available)

## 🙏 Acknowledgements

This plugin uses icons from the open-source project [Lucide](https://github.com/lucide-icons/lucide), which is licensed under the ISC License.