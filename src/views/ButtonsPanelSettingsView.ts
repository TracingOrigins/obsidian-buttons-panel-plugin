// ButtonsPanelSettingsView.ts
// 本文件定义了面板设置视图类 ButtonsPanelSettingsView，用于在 Obsidian 插件中渲染和管理按钮面板的设置界面。
// 该视图负责展示和处理与按钮面板相关的所有设置项，支持用户交互和配置保存。
//
// 主要内容：
// - ButtonsPanelSettingsView 类：主视图类，负责初始化、渲染和事件处理
// - 构造函数与生命周期方法
// - 视图渲染、设置项展示、事件绑定等核心逻辑
// - 详细参数、返回值、用途说明
//
// 注释风格与 src/settings/components、modals、sections、types、utils、views/renderers 等目录下已确认文件保持一致。
import { ItemView, WorkspaceLeaf } from 'obsidian';
import { ButtonsPanelSettingTab } from '@/settings/ButtonsPanelSettingTab';
import { t } from '@/common/utils/i18n';
import { ButtonsPanelPlugin } from '@/common/types';

export const BUTTONS_PANEL_SETTINGS_VIEW_TYPE = 'buttons-panel-settings-view';

/**
 * 按钮面板配置视图类，在主页面新标签页中显示面板设置界面。
 */
export class ButtonsPanelSettingsView extends ItemView {
    /** 插件主类实例 */
    plugin: ButtonsPanelPlugin;
    /** 设置页签实例 */
    settingTab: ButtonsPanelSettingTab;

    /**
     * 构造函数，初始化配置视图。
     * @param leaf Obsidian的WorkspaceLeaf对象
     * @param plugin 插件主类实例
     */
    constructor(leaf: WorkspaceLeaf, plugin: ButtonsPanelPlugin) {
        super(leaf);
        this.plugin = plugin;
        this.settingTab = new ButtonsPanelSettingTab(plugin.app, plugin);
    }

    /**
     * 获取视图类型字符串（用于Obsidian识别）。
     */
    getViewType(): string {
        return BUTTONS_PANEL_SETTINGS_VIEW_TYPE;
    }

    /**
     * 获取视图图标（左侧边栏显示）。
     */
    getIcon(): string {
        return 'settings';
    }

    /**
     * 获取视图显示名称（顶部标题）。
     */
    getDisplayText(): string {
        return t('buttons_panel_settings');
    }

    /**
     * 视图打开时自动调用，渲染配置界面。
     */
    async onOpen(): Promise<void> {
        this.renderSettings();
        // 监听设置变化，自动刷新页面
        this.registerEvent(
            this.plugin.app.workspace.on('layout-change', () => {
                this.refreshSettings();
            })
        );
    }

    /**
     * 视图关闭时自动调用，可用于资源清理。
     */
    async onClose(): Promise<void> {
        this.containerEl.empty();
    }

    /**
     * 渲染配置界面，包含面板设置、按钮管理、帮助等。
     */
    private renderSettings(): void {
        const container = (this.containerEl.children[1] || this.containerEl) as HTMLElement;
        container.empty();
        container.addClass('buttons-panel-plugin');
        // 复用SettingsTab的display逻辑
        this.settingTab.containerEl = container;
        this.settingTab.display();
    }

    /**
     * 延迟刷新设置，确保设置已保存。
     */
    refreshSettings(): void {
        window.setTimeout(() => {
            this.renderSettings();
        }, 100);
    }
}
