import {ItemView, WorkspaceLeaf, Menu} from 'obsidian';
import {ButtonsPanelPlugin} from '../types/plugin';
import {ButtonConfig, PanelConfig} from '../types';
import {CategoryConfig} from '../types';
import {ActionDispatcher} from '../core/ActionDispatcher';
import {t} from '../utils/i18n';
import { safeSetSVG } from '../utils/validation';

/**
 * 按钮面板主视图类，负责渲染按钮面板、处理按钮交互、支持多种视图模式（列表/标签页）。
 */
export class ButtonsPanelView extends ItemView {
	/** 当前面板的按钮数据 */
	private buttons: ButtonConfig[] = [];
	/** 面板的显示设置 */
	private panelConfig: PanelConfig;
	/** 按钮动作执行器 */
	private ActionDispatcher: ActionDispatcher;
	/** 插件主类实例 */
	private plugin: ButtonsPanelPlugin;
	/** 渲染防抖定时器 */
	private renderTimeout: number | null = null;
	/** 是否正在渲染，防止重复渲染 */
	private isRendering = false;
	/** 当前激活的标签页ID（仅标签页模式下） */
	private activeTabId: string | null = null;

	/**
	 * 构造函数，初始化视图、按钮、设置等。
	 * @param leaf Obsidian的WorkspaceLeaf对象
	 * @param plugin 插件主类实例
	 * @param buttons 按钮数据数组
	 * @param panelConfig 面板设置
	 */
	constructor(
		leaf: WorkspaceLeaf,
		plugin: ButtonsPanelPlugin,
		buttons: ButtonConfig[],
		panelConfig: PanelConfig
	) {
		super(leaf);
		this.plugin = plugin;
		this.buttons = buttons;
		this.panelConfig = panelConfig;
		this.ActionDispatcher = new ActionDispatcher(this.app, this.plugin);
		this.containerEl.addClass('buttons-panel-plugin');
	}

	/**
	 * 获取视图类型字符串（用于Obsidian识别）。
	 */
	getViewType(): string {
		return 'buttons-panel-view';
	}

	/**
	 * 获取视图图标（左侧边栏显示）。
	 */
	getIcon(): string {
		return 'layout-grid';
	}

	/**
	 * 获取视图显示名称（顶部标题）。
	 */
	getDisplayText(): string {
		return t('buttons_panel', this.plugin);
	}

	/**
	 * 视图打开时自动调用，渲染按钮面板。
	 */
	async onOpen(): Promise<void> {
		this.renderPanel();
	}

	/**
	 * 视图关闭时自动调用，可用于资源清理。
	 */
	async onClose(): Promise<void> {
		this.containerEl.empty();
	}

	/**
	 * 防抖渲染，避免频繁重新渲染。
	 */
	private debouncedRender(): void {
		if (this.renderTimeout) {
			clearTimeout(this.renderTimeout);
		}
		this.renderTimeout = window.setTimeout(() => {
			this.renderPanel();
		}, 100);
	}

	/**
	 * 更新按钮数据并重新渲染。
	 * @param buttons 新的按钮数组
	 */
	updateButtons(buttons: ButtonConfig[]): void {
		try {
			this.buttons = buttons;
			this.debouncedRender();
		} catch (error) {
			console.warn('更新按钮数据时出错:', error);
		}
	}

	/**
	 * 更新面板设置并重新渲染。
	 * @param config 新的面板设置
	 */
	updatePanelConfig(config: PanelConfig): void {
		try {
			this.panelConfig = config;
			this.debouncedRender();
		} catch (error) {
			console.warn('更新面板设置时出错:', error);
		}
	}

	/**
	 * 应用面板样式。
	 * @param panelEl 面板元素
	 */
	private applyPanelStyles(panelEl: HTMLElement): void {
		if (this.panelConfig.panelHeight && this.panelConfig.panelHeight !== 'auto') {
			panelEl.style.height = this.panelConfig.panelHeight;
		}
	}

	/**
	 * 渲染整个按钮面板，根据设置支持列表/标签页两种模式。
	 * 包含分类分组、动态tab、按钮拖拽等。
	 */
	private renderPanel(): void {
		try {
			if (this.isRendering) {
				console.log('renderPanel already in progress, skipping');
				return;
			}
			console.log('renderPanel called');
			this.isRendering = true;
			const container = this.contentEl;
			if (!container) {
				console.warn('contentEl is not available');
				this.isRendering = false;
				return;
			}
			container.empty();
			const panelEl = container.createDiv('buttons-panel-container');
			this.applyPanelStyles(panelEl);
			// 显示面板标题
			if (this.panelConfig.showTitle) {
				const titleEl = panelEl.createEl('h2', {text: this.panelConfig.title});
				titleEl.addClass('buttons-panel-title');
			}

			// 按分类分组按钮
			const groupedButtons = this.plugin.settings.categories.reduce((acc, category) => {
				acc[category.id] = category.buttons;
				return acc;
			}, {} as Record<string, ButtonConfig[]>);
			// 保证分类顺序与设置一致
			const sortedCategories = this.plugin.settings.categories
				.sort((a, b) => a.order - b.order);
			const panelViewType = this.panelConfig.panelViewType || 'list';
			if (panelViewType === 'tabs') {
				this.renderTabsView(panelEl, groupedButtons, sortedCategories);
			} else {
				this.renderListView(panelEl, groupedButtons, sortedCategories);
			}
		} catch (error) {
			console.error('渲染按钮面板时出错:', error);
		} finally {
			this.isRendering = false;
		}
	}

	/**
	 * 渲染标签页视图。
	 * @param container 容器元素
	 * @param groupedButtons 按分类分组的按钮
	 * @param sortedCategories 排序后的分类数组
	 */
	private renderTabsView(container: HTMLElement, groupedButtons: Record<string, ButtonConfig[]>, sortedCategories: CategoryConfig[]): void {
		const tabsContainer = container.createDiv('buttons-panel-tab-bar-container');
		// 创建标签栏
		const tabBar = tabsContainer.createDiv('buttons-panel-tab-bar');
		// 如果当前activeTabId无效或未设置，默认第一个分类
		if (!this.activeTabId || !sortedCategories.some(cat => cat.id === this.activeTabId)) {
			this.activeTabId = sortedCategories[0]?.id || null;
		}
		sortedCategories.forEach(category => {
			const tabEl = tabBar.createDiv('buttons-panel-tab');
			const iconEl = tabEl.createSpan({cls: 'tab-icon'});
			// iconEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon lucide-layout-grid"><rect x="3" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="14" width="7" height="7" rx="1"></rect><rect x="3" y="14" width="7" height="7" rx="1"></rect></svg>`;
			safeSetSVG(iconEl, `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon lucide-layout-grid"><rect x="3" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="14" width="7" height="7" rx="1"></rect><rect x="3" y="14" width="7" height="7" rx="1"></rect></svg>`);
			tabEl.createSpan({text: category.name, cls: 'tab-lable'});
			tabEl.toggleClass('is-active', category.id === this.activeTabId);
			tabEl.addEventListener('click', () => {
				this.activeTabId = category.id;
				tabBar.querySelectorAll('.buttons-panel-tab').forEach(tab => tab.removeClass('is-active'));
				tabEl.addClass('is-active');
				this.renderTabContent(tabContent, groupedButtons[category.id]);
			});
		});
		// 创建标签内容区域
		const tabContent = tabsContainer.createDiv('buttons-panel-tab-content');
		if (this.activeTabId) {
			this.renderTabContent(tabContent, groupedButtons[this.activeTabId]);
		}
	}

	/**
	 * 渲染标签页内容。
	 * @param container 内容容器
	 * @param buttons 按钮数组
	 */
	private renderTabContent(container: HTMLElement, buttons: ButtonConfig[]): void {
		container.empty();
		const buttonsContainer = container.createDiv('buttons-panel-grid');
		buttons.forEach(button => {
			this.renderButton(buttonsContainer, button);
		});
	}

	/**
	 * 渲染列表视图。
	 * @param container 容器元素
	 * @param groupedButtons 按分类分组的按钮
	 * @param sortedCategories 排序后的分类数组
	 */
	private renderListView(container: HTMLElement, groupedButtons: Record<string, ButtonConfig[]>, sortedCategories: CategoryConfig[]): void {
		sortedCategories.forEach(category => {
			const categoryContainer = container.createDiv('buttons-panel-category');
			const categoryTitle = categoryContainer.createEl('h3', {text: category.name});
			categoryTitle.addClass('buttons-panel-category-title');
			const buttonsContainer = categoryContainer.createDiv('buttons-panel-grid');
			groupedButtons[category.id].forEach(button => {
				this.renderButton(buttonsContainer, button);
			});
		});
	}

	/**
	 * 渲染单个按钮，包含图标、文字、描述、点击/右键菜单等。
	 * @param container 按钮父容器
	 * @param button 按钮配置对象
	 */
	private renderButton(container: HTMLElement, button: ButtonConfig): void {
		// 创建按钮容器，不使用text属性
		const buttonEl = container.createEl('button');
		// 根据面板的全局设置来决定显示样式
		if (this.panelConfig.displayStyle === 'icon_top') {
			buttonEl.addClass('icon-top');
		} else {
			buttonEl.addClass('icon-left');
		}
		// 根据设置决定是否添加动画
		if (this.panelConfig.enableAnimation) {
			buttonEl.addClass('with-animation');
		}
		// 添加图标
		if (button.icon) {
			const iconEl = buttonEl.createEl('span', {cls: 'button-icon'});
			// 检查是否为SVG代码
			if (button.icon.trim().startsWith('<svg')) {
				// iconEl.innerHTML = button.icon;
				safeSetSVG(iconEl, button.icon);
			} else {
				// 普通文本图标
				iconEl.textContent = button.icon;
			}
		}
		// 添加按钮文字
		const textEl = buttonEl.createEl('span', {
			text: button.name,
			cls: 'button-text'
		});
		// 添加点击事件，防止重复点击，执行按钮动作
		buttonEl.addEventListener('click', async (e) => {
			e.preventDefault();
			e.stopPropagation();
			// 防止重复点击
			if (buttonEl.disabled) {
				return;
			}
			buttonEl.disabled = true;
			try {
				await this.ActionDispatcher.executeAction(button.action);
			} finally {
				buttonEl.disabled = false;
			}
		});

		// 新增：右键菜单
		if (this.panelConfig.enableButtonContextMenu) {
			buttonEl.addEventListener('contextmenu', (e) => {
				e.preventDefault();
				e.stopPropagation();
				const menu = new Menu();
				menu.addItem((item) => {
					item.setTitle(t('edit', this.plugin) || '编辑')
						.setIcon('pencil')
						.onClick(() => {
							const category = this.plugin.settings.categories.find(cat => cat.buttons.some(b => b.id === button.id));
							if (category) {
								new (require('../settings/modals/ButtonEditModal').ButtonEditModal)(this.app, this.plugin, button, category, async () => {
									await this.plugin.saveSettings();
									this.debouncedRender();
								}).open();
							}
					});
				});
				menu.addItem((item) => {
					item.setTitle(t('copy', this.plugin) || '复制')
						.setIcon('copy')
						.onClick(async () => {
							const category = this.plugin.settings.categories.find(cat => cat.buttons.some(b => b.id === button.id));
							if (category) {
								const newButton = {
									...JSON.parse(JSON.stringify(button)),
									id: Date.now().toString(),
									order: category.buttons.length
								};
								category.buttons.push(newButton);
								await this.plugin.saveSettings();
								this.debouncedRender();
							}
					});
				});
				menu.addItem((item) => {
					item.setTitle(t('delete', this.plugin) || '删除')
						.setIcon('trash');
					item.onClick(() => {
						const category = this.plugin.settings.categories.find(cat => cat.buttons.some(b => b.id === button.id));
						if (category) {
							new (require('../settings/modals/DeleteButtonModal').DeleteButtonModal)(this.app, this.plugin, button, category, async () => {
								const idx = category.buttons.findIndex(b => b.id === button.id);
								if (idx > -1) category.buttons.splice(idx, 1);
								await this.plugin.saveSettings();
								this.debouncedRender();
							}).open();
						}
					});
				});
				menu.showAtPosition({x: e.clientX, y: e.clientY});
			});
		}
	}
} 
