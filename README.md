<div align="center">
    <h1>Buttons Panel</h1>
    <p>
        <img src="https://img.shields.io/badge/dynamic/json?logo=obsidian&color=%23483699&label=downloads&query=%24%5B%22buttons-panel%22%5D.downloads&url=https%3A%2F%2Fraw.githubusercontent.com%2Fobsidianmd%2Fobsidian-releases%2Fmaster%2Fcommunity-plugin-stats.json" alt="Obsidian Downloads">
        <img src="https://img.shields.io/github/downloads/TracingOrigins/obsidian-buttons-panel-plugin/total?logo=github" alt="GitHub Downloads">
    </p>
    <p>[<a href="https://github.com/TracingOrigins/obsidian-buttons-panel-plugin/blob/master/README.zh.md">中文</a> | English | <a href="https://github.com/TracingOrigins/obsidian-buttons-panel-plugin/blob/master/README.ru.md">Русский</a>]</p>
    <p><a href="https://community.obsidian.md/plugins/buttons-panel" target="_blank">Buttons Panel</a> is a modern Obsidian plugin that lets you create a customizable button panel for quick access to files, commands, links, and scripts.</p>
</div>

## ✨ Features

- 🎯 **Quick Access**: Instantly open files, execute commands, visit links, or run scripts with a single click.
- 🎨 **Icon Options**: Search and preview from the Lucide icon library, plus support for custom SVG icons.
- 🏷️ **Three View Modes**: Switch between list, tabbed, and folder views.
- 📁 **Folder View**: Android-style folder grid with drag-and-drop, auto-expand on hover, pin to keep open, click-to-close, and editable folder names.
- 📁 **Category Management**: Organize buttons by category; reorder categories and buttons via long-press drag-and-drop.
- ⚙️ **Flexible Configuration**: Fully customizable panel layout, button styles, and animation effects.
- 📱 **Cross-Platform**: Works on all platforms supported by Obsidian (Windows, macOS, Linux, iOS, Android).
- 🌙 **Theme Adaptation**: Seamlessly adapts to Obsidian’s light and dark themes.

- 🔄 **Live Updates**: All changes take effect immediately—no restart required.
- 🛡️ **Form Validation**: Required fields (button name, file path, command ID, URL, folder, script name) are highlighted in red if empty for intuitive feedback.
- 🖱️ **Interaction Mode**: Three modes — Locked (view only), Sort (drag to reorder), Edit (create/edit/delete via context menu) — switchable from the top navigation bar.
- 🧭 **Top Navigation Bar**: Dropdown menus to quickly switch panel view, button style, and interaction mode; plus search and settings access.
- 🔍 **Search Feature**: The navigation bar includes a search function that filters categories and buttons in real-time for quick access.
- 🔗 **Action Sequences**: Configure multiple actions for a single button and execute them in order with one click.

## 🚀 Installation

### 🏪 Install from Community Plugins (Recommended)

1. Open Obsidian and go to **Settings → Community Plugins**.
2. Click **Browse** and search for "Buttons Panel".
3. Click **Install**, then **Enable**.

### 📦 Manual Installation

1. Download the latest `main.js`, `manifest.json`, and `styles.css` from [Releases](https://github.com/TracingOrigins/obsidian-buttons-panel-plugin/releases).
2. Create a `buttons-panel` folder under your Obsidian plugins directory (e.g. `YourVault/.obsidian/plugins/buttons-panel/`) and place the three files inside.
3. Enable the plugin in Obsidian under Settings → Community Plugins.

### 🔧 Install via BRAT (Recommended for Beta Users)

1. Install the [BRAT](https://github.com/TfTHacker/obsidian42-brat) plugin.
2. In BRAT settings, click "Add Beta plugin".
3. Enter `TracingOrigins/obsidian-buttons-panel-plugin`.
4. Enable the plugin.

## 📂 Showcase Vault

Want to see Buttons Panel in action? Check out the [showcase vault](https://github.com/TracingOrigins/obsidian-showcase-vault), which includes complete configuration examples and common usage scenarios. Download it and open with Obsidian to try it out.

## 📖 Usage

### 🎯 Button Panel

Use the command palette (Ctrl+P) and run "Open buttons panel", or click the ribbon icon to quickly open the panel.

- **View Mode**: Switch between list, tabbed, or folder view from the top navigation bar dropdown.
- **Button Style**: Switch between icon next to text or icon above text from the top navigation bar dropdown.
- **Interaction Mode**: Switch between locked, sort, or edit mode from the top navigation bar dropdown.

### ⚙️ Button Panel Options

Click the settings button in the navigation bar, or go to **Settings → Community Plugins → Buttons Panel**.

- **Show Navigation Bar**: Show or hide the top navigation bar.
- **Enable Button Animation**: Enable or disable hover animation effects for buttons.

#### List View

- **Auto Collapse in List View**: When enabled, all categories start collapsed each time you switch to list view.

#### Tabs View

- **Tabs Auto Wrap**: When enabled, tabs wrap to the next line instead of horizontal scrolling.

#### Folder View

- **Folder Name Editable**: Click the folder name to rename when expanded.
- **Show Button Count**: Display the number of buttons on the folder tile.
- **Close on Blank Click**: Click any empty area inside the expanded folder to close it.

#### Path

- **Template Folder Path**: Set the folder for template files (e.g., `templates/`). The create file action uses templates from this path.
- **Script Folder Path**: Set the folder for script files (e.g., `scripts/`). The run script action loads scripts from this path.
- **One-Click Creation**: Click "Create Paths" to automatically create missing folders.

### 🔗 Buttons & Actions

#### Action Sequences

- **Action Sequences**: Configure a button to perform multiple actions in sequence (e.g., create a file, then run a script). Clicking the button executes all actions in order.
    - **How to configure**: In the button editor, click "Add Action" to add multiple actions and drag to reorder them.
    - **Typical use cases**: One-click to create and open a template note, batch execute multiple commands, automate daily routines, and more.

#### Supported Action Types

- **Open File**: Open any file in your vault.
- **Command**: Execute any Obsidian command.
- **Open Link**: Open an external web link.
- **Create File**: Create a new file at a specified location. The file name supports date variables (e.g., `{{DATE:YYYY-MM-DD}}`), and content can use a fixed template.
- **Run Script**: Run a custom JS script from your vault. Scripts must be placed in the folder specified in Path Config.

### 🎨 Custom Icon Tips

You can paste custom SVG code as button icons. Here are some recommended online icon libraries:

- [Lucide](https://lucide.dev/): The plugin's built-in icon library — you can also copy SVGs directly.
- [Feather Icons](https://feathericons.com/): Clean, beautiful open-source outline icons.
- [Tabler Icons](https://tabler.io/icons): High-quality outline icons compatible with Lucide's style.
- [iconfont](https://www.iconfont.cn/): Alibaba's vast icon library with Chinese search support.

**Tips:**

1. **Prefer outline/stroke icons**: They blend better with Obsidian's UI and adapt more naturally.
2. **Change `fill` to `currentColor`**: After copying the SVG, change `fill` to `currentColor` (e.g. `fill="currentColor"`) so the icon automatically follows Obsidian's theme color and works seamlessly across light and dark themes.
3. **Use 24px grid icons**: Choose icons with `viewBox="0 0 24 24"` — the most universal size standard, matching the plugin's built-in icon style.

### ✅ Form Validation

- When creating or editing a button, clicking "Save" will automatically validate all required fields.
- If any required field is empty, the corresponding input will be highlighted in red.
- The red highlight disappears automatically once the field is filled.

### 🧭 Top Navigation Bar

- **Search**: Click the search icon to open a search box. Enter keywords to filter categories and button names in real-time. Clear or close the search box to reset.
- **Panel View Switch**: Switch between tabbed and list views.
- **Button Style Switch**: Instantly change button styles.
- **Interaction Mode**: Dropdown to switch between Locked, Sort, and Edit modes.
- **Panel Settings**: Quick access to the plugin settings page.
- **Tab Bar Scrolling** (tabbed view, many tabs): Swipe left/right on mobile; hold **Shift** and scroll on desktop.

### 🖱️ Interaction Mode

Click the edit button in the navigation bar to open a dropdown with three modes:

| Mode | Icon | Behavior |
|------|------|----------|
| 🔒 **Locked** | `lock` | View only — all interactions disabled (no drag, no context menu) |
| ↕️ **Sort** | `arrow-up-down` | Long-press drag to reorder buttons and categories |
| ✏️ **Edit** | `pencil` | Right-click / long-press menu to add, edit, copy, or delete |

- Switch modes from the navigation bar dropdown or in Panel Config settings.
- **Drag-and-drop is only available in Sort mode**.
- **Editing controls are only available in Edit mode**.

### 📁 Folder View

Switch to folder view from the navigation bar or settings. Categories appear as folder tiles in a responsive grid.

| Feature | Description |
|---------|-------------|
| **Open/Close** | Click a tile to expand; click outside, press ESC, or click blank space (configurable) to close |
| **📌 Pin** | Click 📌 to lock — folder stays open until unpinned or you switch folders |
| **Edit name** | Click folder name to rename (configurable in settings) |
| **Reorder folders** | Long-press drag in sort mode |
| **Cross-folder drag** | Drag button out → auto-close → hover 0.6s on another tile → auto-expand → continue sorting |
| **Auto-scroll** | Drag near edges inside expanded folder to scroll |

### 📦 Drag-and-Drop Reordering

When **Sort mode** is active and **search is not active**, long-press and drag to reorder (mouse long-press works on desktop too):

| Target | List view | Tabbed view | Folder view |
|--------|-----------|-------------|-------------|
| **Buttons** | Long-press a button, then drag to reorder within a category; drag over another category's tab/zone to move across categories | Same; active tab's grid supports drag reorder | Drag within expanded folder or between folders; hover 0.6s over a tile to auto-expand |
| **Categories** | Long-press the category block (title or non-button area), then drag vertically to reorder | Long-press a tab, hold ~0.4s over another tab to confirm drop target, then release to reorder | Long-press a tile to reorder in grid |

- Order is saved automatically when you release.
- Reordering is unavailable in **Locked** or **Edit** mode, or while **search is active**.

#### 📱 Touch Gestures (Mobile)

- **Scroll the panel**: Swipe up/down on the panel (list view) or left/right on the tab bar (tabbed view) without long-pressing.
- **Drag to reorder**: Long-press (~0.5s) on a button or category/tab, then drag. While dragging, panel scrolling is locked so the item follows your finger.
- If a quick swipe is detected before the long-press completes, the gesture is treated as scrolling and drag does not start.

### Script Feature

- **Select a script**: In the button editor, set the action type to "Script" and choose or enter a script file name (`.js` only).
- **Script location**: Scripts must be placed in the folder specified in Path Config (e.g. `scripts/`).
- **Single format**: Scripts export via CommonJS `module.exports`. The entry function takes **no parameters** and reads its context from `this.$context`:

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

- **Runtime context**: Available inside the entry function via `this.$context`: `app` (the running `obsidian.App` instance — not the class, so don't use `new`), `plugin`, `obsidian` (module namespace for destructuring `Notice`/`TFile`/`Modal`, etc.), `requestUrl` (equivalent to `obsidian.requestUrl`, avoids CORS), and `notice` (equivalent to `new obsidian.Notice(msg)`).
- **Entry must be a regular function**: Arrow functions have no own `this`, so `$context` would be unavailable.
- **Helper functions**: Helpers do not receive the context automatically — pass what they need explicitly, e.g. `await renameFile(app, obsidian, file)`.
- **Localization**: `name` / `description` accept a localized object keyed by `zh`/`en`/`ru` (missing languages fall back to `en` → `zh`) or a plain string; when picking a script in the button settings, the dropdown shows them **in the current Obsidian language**.
- **Field order**: `entry` → `name` → `description` → `tags` is recommended; `entry` is required and points to the function to run; `tags` is an optional string array for categorization; helper functions can live in the same file without affecting the export.
- **Errors & security**: Script errors are automatically caught and shown as notifications; **do not run scripts from untrusted sources**.

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
- **@dnd-kit**: Drag-and-drop for button and category reordering.

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
