> English | [中文](https://github.com/TracingOrigins/obsidian-buttons-panel-plugin/blob/master/README.zh.md)

<h1 align="center">Buttons Panel</h1>

<p align="center">
    <img alt="Release version" src="https://img.shields.io/github/v/release/TracingOrigins/obsidian-buttons-panel-plugin?style=for-the-badge">
    <img alt="Download count" src="https://img.shields.io/github/downloads/TracingOrigins/obsidian-buttons-panel-plugin/total?style=for-the-badge">
</p>
<p align="center">
    <span>Buttons Panel is a modern Obsidian plugin that lets you create a customizable button panel for quick access to files, commands, links, and scripts.</span>
</p>

## ✨ Features

- 🎯 **Quick Access**: Instantly open files, execute commands, visit links, or run scripts with a single click.
- 🎨 **Icon Picker**: Integrated Lucide icon library with search and live preview.
- 🏷️ **Tabbed & List Views**: Switch between list and tabbed display modes for flexible organization.
- 📁 **Category Management**: Organize buttons by category and reorder them via drag-and-drop.
- ⚙️ **Flexible Configuration**: Fully customizable panel layout, button styles, and animation effects.
- 📱 **Responsive Design**: Optimized for both desktop and mobile devices.
- 🌙 **Theme Adaptation**: Seamlessly adapts to Obsidian’s light and dark themes.
- 🎛️ **Dedicated Settings Tab**: Manage all plugin settings in a separate, user-friendly tab.
- 🔄 **Live Updates**: All changes take effect immediately—no restart required.
- 🛡️ **Form Validation**: Required fields (button name, file path, command ID, URL, folder, script name) are highlighted in red if empty for intuitive feedback.
- 🖱️ **Edit Mode**: Enable edit mode to create categories and buttons directly in the panel, and use right-click menus for move, edit, copy, and delete.
- 🧭 **Top Navigation Bar**: Quickly switch panel view, button style, edit mode, and open settings from the top navigation bar.
- 🔍 **Search Feature**: The navigation bar includes a search function that filters categories and buttons in real-time for quick access.
- 🔗 **Action Sequences**: Configure multiple actions for a single button and execute them in order with one click.

## 🚀 Installation

### 📦 Manual Installation

1. Download the latest release from the [Releases](https://github.com/TracingOrigins/obsidian-buttons-panel-plugin/releases) page.
2. Place the plugin folder into your Obsidian plugins directory (usually `.obsidian/plugins/`, e.g. `YourVault/.obsidian/plugins/buttons-panel/`).
3. Enable the plugin in Obsidian under Settings → Community Plugins.

### 🔧 Install via BRAT (Recommended for Beta Users)

1. Install the [BRAT](https://github.com/TfTHacker/obsidian42-brat) plugin.
2. In BRAT settings, click "Add Beta plugin".
3. Enter `TracingOrigins/obsidian-buttons-panel-plugin`.
4. Enable the plugin.

## 📖 Usage

### 🎯 Opening the Button Panel

- Use the command palette (Ctrl+P) and run "Open buttons panel (right sidebar)".
- Click the grid icon in the left ribbon to quickly open the panel and settings.
- The button panel will appear in the right sidebar for fast access.

### ⚙️ Opening the Button Panel Settings

- Use the command palette to run "Open buttons panel settings (central content area)".
- The settings page will open in the main content area for detailed configuration.
- You can also access settings via the plugin section in Obsidian’s settings.

### 🔗 Action Sequences

- **Action Sequences**: Configure a button to perform multiple actions in sequence (e.g., create a file, insert a template, run a script). Clicking the button will execute all actions in order. Each action can be of a different type, greatly enhancing automation and batch processing.
    - **How to configure**: In the button editor, click "Add Action" to add multiple actions and drag to reorder them.
    - **Typical use cases**: One-click to create and open a template note, batch execute multiple commands, automate daily routines, and more.

### 🔗 Supported Action Types

- **Open File**: Open any file in your vault.
- **Command**: Execute any Obsidian command.
- **Open Link**: Open an external web link.
- **Create File**: Create a new file at a specified location, supporting date variables (e.g. `{{DATE:YYYY-MM-DD}}`) and templates.
- **Run Script**: Run a custom JS script from your vault (supports both QuickAdd and Components script formats). Scripts must be placed in the configured script folder.

### ✅ Form Validation

- When creating or editing a button, clicking "Save" will automatically validate all required fields.
- If any required field is empty, the corresponding input will be highlighted in red.
- The red highlight disappears automatically once the field is filled.

### 🎛️ Panel Options

- **Panel Title**: Set a custom title for the panel.
- **Show Title**: Toggle the display of the panel title.
- **View Mode**: Choose between list or tabbed view.
- **Button Style**: Display icon and text on the same line, or icon above text.
- **Animation**: Enable button hover animation.
- **Edit Mode**: Enable or disable edit mode.
- **Top Navigation**: Enable or disable the top navigation bar.

> Example: Choose "Tabbed View" to group buttons by category.

### 📁 Path Management

- **Template Folder Path**: Set the folder path for storing template files (e.g., `templates/`). The create file action will use templates from this path.
- **Script Folder Path**: Set the folder path for storing script files (e.g., `scripts/`). The run script action will load script files from this path.
- **Path Validation**: Paths are validated in real-time. Invalid paths are highlighted with a red border.
- **One-Click Creation**: Click the "Create Paths" button to automatically create any missing folders.

> Example: Set the template folder to `templates/` and script folder to `scripts/` so that the create file and run script features work properly.

### 🖱️ Edit Mode

- Enable "Edit Mode" in the panel settings to unlock advanced management features.
- **In Edit Mode**, categories and buttons support right-click context menus, including:
    - **Move**: Enter move mode for categories or buttons to quickly change their position.
    - **Edit**: Open the editor for categories or buttons.
    - **Copy**: Duplicate the category or button to the end of the same category.
    - **Delete**: Remove the category or button after confirmation.
- This feature is optional and can be toggled in the panel configuration section of the settings tab.

#### 📦 Button Move Mode

- **Enter Move Mode**: In edit mode, right-click a button and select "Move" to enter button move mode.
- **Move Methods**:
    - **Click another button**: Move the button to that button's position.
    - **Click category name**: Move the button to the last position of that category (quick move to category end).
    - **Click button container blank area**: Move the button to the last position of the current category.
    - **Click empty category placeholder**: Move the button to the first position of that category.
    - **Click itself**: Exit move mode without changing position.
    - **Press ESC key**: Exit move mode without changing position.
- The panel will automatically save and refresh after moving.

### 🧭 Top Navigation Bar

- The panel features a top navigation bar with the following functions:
    - **Panel View Switch**: Switch between tabbed and list views.
    - **Button Style Switch**: Instantly change button styles.
    - **Edit Mode Toggle**: Quickly enter or exit edit mode.
    - **Search Feature**: Click the search icon to open the search box and filter categories and button names in real-time.
    - **Panel Settings**: Open the panel settings page with one click.
- The navigation bar is designed for efficiency and a smooth user experience.

### 🔍 Search Feature

- Click the search icon in the navigation bar to open the search box.
- After entering keywords, the panel will automatically filter and display matching categories and buttons.
- Search only filters category names and button names, with real-time updates.
- Click the clear button or close the search box to clear the search criteria.

### 🧩 Script Feature

- In the button editor, select "Script" as the action type and choose or enter a script file name (`.js` only).
- Script files must be placed in the script folder specified in plugin settings (e.g., `scripts/`). You can customize this path in the settings tab.
- Two script formats are supported:
    - **QuickAdd script format**: The script must export an async function, for example:

        ```js
        // scripts/hello.js
        module.exports = async function (params, app, plugin, notice) {
            notice('Hello from script!');
            // You can access the Obsidian API, plugin instance, etc. here
        };
        ```

    - **Components script format**: The script must export an object whose `default.entry` is an async function, for example:

        ```js
        // scripts/components-demo.js
        exports.default = {
            entry: async function (params, app, plugin, notice) {
                notice('Hello from Components script!');
                // You can access the Obsidian API, plugin instance, etc. here
            },
        };
        ```

- The script environment injects `app` (Obsidian instance), `plugin` (plugin instance), and `notice` (notification method).
- Script errors are automatically caught and shown as notifications.
- **Security Note**: Do not run scripts from untrusted sources. Script execution has inherent risks.

> Example: Write batch processing or automation scripts and run them with a single click.  
> Example: Configure a button with “Create File → Insert Template → Run Script” actions, and all will be executed in order with one click.

## 🛠️ Development

- Clone this repository.
- Make sure your NodeJS is at least v18 (`node --version`), LTS version recommended.
- Run `npm install` to install dependencies.
- Run `npm run dev` to start development mode with live compilation (automatically deploys to test vault).
- Run `npm run build` to build the production version and deploy to test vault.
- Run `npm run lint` to check code quality.
- To deploy to a custom vault, create a `.env` file in the project root and add: `VAULT_PATH=/path/to/your/vault`.

## 🎨 Tech Stack

- **TypeScript**: Type-safe JavaScript with strict mode.
- **React**: Modern framework for building user interfaces.
- **Obsidian API**: Official plugin API.
- **Lucide Icons**: Modern icon library (6000+ icons).
- **CSS Grid & Flexbox**: Responsive layout.
- **ESBuild**: Fast build tool with TypeScript and React support.

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🌟 Support & Help

If you find this plugin helpful, please consider:

- ⭐ **Starring** the repository.
- 🐛 Using the [bug report template](https://github.com/TracingOrigins/obsidian-buttons-panel-plugin/issues/new?template=bug_report.md) to submit bug reports.
- 💡 Using the [feature request template](https://github.com/TracingOrigins/obsidian-buttons-panel-plugin/issues/new?template=feature_request.md) to submit feature suggestions.
- ❓ Asking questions or sharing ideas in our [Discussions](https://github.com/TracingOrigins/obsidian-buttons-panel-plugin/discussions).
- 📝 Referring to the [Contributing Guide](docs/contributing/contributing.md) to contribute code or documentation.
- 💰 Providing [sponsorship](https://support.tracingorigins.top) to the developer (if available).

## 🙏 Acknowledgements

This plugin uses icons from the open-source project [Lucide](https://github.com/lucide-icons/lucide), which is licensed under the ISC License.
