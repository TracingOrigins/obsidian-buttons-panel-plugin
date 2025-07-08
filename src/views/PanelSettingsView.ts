import {ItemView, WorkspaceLeaf} from 'obsidian';
import {ButtonsPanelPlugin} from '../types/plugin';
import {ButtonsPanelSettingTab} from '../settings/SettingsTab/index';
import {t} from '../utils/i18n';

export const BUTTONS_PANEL_SETTINGS_VIEW_TYPE = 'buttons-panel-settings-view';

/**
 * 按钮面板配置视图类，在主页面新标签页中显示面板设置界面。
 */
export class PanelSettingsView extends ItemView {
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
		return t('buttons_panel_settings', this.plugin);
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
