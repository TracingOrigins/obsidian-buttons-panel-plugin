import { App, PluginSettingTab, type SettingDefinitionItem } from 'obsidian';
import { ButtonsPanelPlugin } from '@/types';
import { createPanelConfigSection } from '@/settings/sections/PanelConfigSection';
import { createPathConfigSection } from '@/settings/sections/PathConfigSection';
import { t } from '@/utils/i18n';

/**
 * ButtonsPanelSettingTab 插件设置页签类。
 * 负责渲染面板设置、路径设置、帮助等设置界面。
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
        containerEl.addClass('buttons-panel');

        // 标签页定义
        const tabs = [
            { key: 'panel', label: t('panel_config') },
            { key: 'paths', label: t('path_config') },
        ];

        const tabBar = containerEl.createDiv('settings-tab-bar');
        const tabEls = new Map<string, HTMLElement>();

        tabs.forEach((tab) => {
            const tabEl = tabBar.createDiv('settings-tab');
            tabEl.setText(tab.label);
            tabEl.toggleClass('is-active', tab.key === this.currentActiveTab);
            tabEl.addEventListener('click', () => {
                if (this.currentActiveTab === tab.key) return;
                // 更新旧 tab 样式
                const prevEl = tabEls.get(this.currentActiveTab);
                if (prevEl) prevEl.toggleClass('is-active', false);
                // 更新新 tab 样式
                this.currentActiveTab = tab.key;
                tabEl.toggleClass('is-active', true);
                this.renderContent();
            });
            tabEls.set(tab.key, tabEl);
        });

        this.contentEl = containerEl.createDiv('settings-tab-content');
        this.renderContent();
    }

    private contentEl: HTMLElement | null = null;

    getSettingDefinitions(): SettingDefinitionItem[] {
        return [];
    }

    private renderContent(): void {
        if (!this.contentEl) return;
        this.contentEl.empty();

        if (this.currentActiveTab === 'panel') {
            createPanelConfigSection(this.contentEl, this.plugin, () => this.renderContent());
        } else {
            createPathConfigSection(this.contentEl, this.plugin, this.app);
        }
    }
}
