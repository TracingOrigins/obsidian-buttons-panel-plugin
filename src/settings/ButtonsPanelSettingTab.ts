import { App, PluginSettingTab, SettingPage } from 'obsidian';
import type { SettingDefinitionItem } from 'obsidian';
import { ButtonsPanelPlugin } from '@/types';
import { createPanelConfigSection } from '@/settings/sections/PanelConfigSection';
import { createPathConfigSection } from '@/settings/sections/PathConfigSection';
import { t } from '@/utils/i18n';

/**
 * 面板设置页面：包装现有的面板配置渲染逻辑。
 */
class PanelSettingsPage extends SettingPage {
    private plugin: ButtonsPanelPlugin;

    constructor(plugin: ButtonsPanelPlugin) {
        super();
        this.plugin = plugin;
        this.title = t('panel_config');
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();
        createPanelConfigSection(containerEl, this.plugin, () => {
            containerEl.empty();
            createPanelConfigSection(containerEl, this.plugin, () => {});
        });
    }
}

/**
 * 路径设置页面：包装现有的路径配置渲染逻辑。
 */
class PathSettingsPage extends SettingPage {
    private plugin: ButtonsPanelPlugin;
    private app: App;

    constructor(plugin: ButtonsPanelPlugin, app: App) {
        super();
        this.plugin = plugin;
        this.app = app;
        this.title = t('path_config');
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();
        createPathConfigSection(containerEl, this.plugin, this.app);
    }
}

/**
 * ButtonsPanelSettingTab 插件设置页签类。
 * 负责渲染面板设置、路径设置等设置界面。
 */
export class ButtonsPanelSettingTab extends PluginSettingTab {
    /** 插件主类实例 */
    plugin: ButtonsPanelPlugin;

    /**
     * 构造函数，初始化设置页签。
     * @param app Obsidian应用实例
     * @param plugin 插件主类实例
     */
    constructor(app: App, plugin: ButtonsPanelPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    /**
     * 声明式设置定义（Obsidian 1.13.0+）。
     * 将设置分为面板配置和路径配置两个页面。
     */
    getSettingDefinitions(): SettingDefinitionItem[] {
        return [
            {
                type: 'page',
                name: t('panel_config'),
                page: () => new PanelSettingsPage(this.plugin),
            },
            {
                type: 'page',
                name: t('path_config'),
                page: () => new PathSettingsPage(this.plugin, this.app),
            },
        ];
    }
}
