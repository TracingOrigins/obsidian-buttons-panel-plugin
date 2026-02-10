import { App, PluginSettingTab } from 'obsidian';
import { ButtonsPanelPlugin } from '@/common/types';
import { createPanelConfigSection } from '@/settings/sections/PanelConfigSection';
import { createHelpSection } from '@/settings/sections/HelpSection';
import { createPathConfigSection } from '@/settings/sections/PathConfigSection';
import { createButtonManagementSection } from '@/settings/sections/ButtonManagementSection';
import { t } from '@/common/utils/i18n';

/**
 * ButtonsPanelSettingTab 插件设置页签类。
 * 负责渲染面板设置、按钮管理、路径设置、帮助等设置界面。
 */
export class ButtonsPanelSettingTab extends PluginSettingTab {
    /** 插件主类实例 */
    plugin: ButtonsPanelPlugin;
    /** 设置页签图标 */
    icon: string = 'mouse';
    /** 当前选中的tab（不持久化） */
    private currentActiveTab: string = 'panel';

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
     * 渲染设置页签主入口，包含tab切换、内容区。
     */
    display(): void {
        const { containerEl } = this;
        containerEl.empty();
        containerEl.addClass('buttons-panel-plugin');

        // 标签页定义
        const tabs = [
            { key: 'panel', label: t('panel_config') },
            { key: 'paths', label: t('path_config') },
            { key: 'buttons', label: t('button_management') },
            { key: 'help', label: t('help') },
        ];

        const tabBar = containerEl.createDiv('settings-tab-bar');
        tabs.forEach((tab) => {
            const tabEl = tabBar.createDiv('settings-tab');
            tabEl.setText(tab.label);
            tabEl.toggleClass('is-active', tab.key === this.currentActiveTab);
            tabEl.addEventListener('click', () => {
                // 切换tab但不保存状态
                this.currentActiveTab = tab.key;
                this.display();
            });
        });

        const content = containerEl.createDiv('settings-tab-content');
        if (this.currentActiveTab === 'panel') {
            createPanelConfigSection(content, this.plugin, () => this.display());
        } else if (this.currentActiveTab === 'paths') {
            createPathConfigSection(content, this.plugin, this.app);
        } else if (this.currentActiveTab === 'buttons') {
            createButtonManagementSection(content, this.plugin, this.app, () => this.display());
        } else if (this.currentActiveTab === 'help') {
            createHelpSection(content, this.plugin);
        }
    }
}
