import {App, ButtonComponent, setIcon, Menu} from 'obsidian';
import {ButtonsPanelPlugin} from '../../types/plugin';
import {ButtonConfig, CategoryConfig} from '../../types';
import {t} from '../../utils/i18n';
import {ButtonEditModal} from '../modals/ButtonEditModal/index';
import {RenameCategoryModal} from '../modals/RenameCategoryModal';
import {CreateCategoryModal} from '../modals/CreateCategoryModal';
import {DeleteCategoryModal} from '../modals/DeleteCategoryModal';
import {DeleteButtonModal} from '../modals/DeleteButtonModal';
import { safeSetSVG } from '../../utils/validation';

/**
 * 按钮管理区域类，负责渲染和管理按钮设置界面，包括分类、按钮的增删改查、拖拽排序、移动、长按菜单等。
 * 支持移动端和桌面端的交互优化。
 */
export class ButtonManagementSection {
	private plugin: ButtonsPanelPlugin; // 插件主类实例
	private app: App; // Obsidian应用实例
	private displayCallback?: () => void; // 刷新回调
	private draggedCategoryIndex: number = -1; // 当前拖拽的分类索引

	/**
	 * 构造函数，初始化插件、app、回调
	 */
	constructor(
		plugin: ButtonsPanelPlugin,
		app: App,
		displayCallback?: () => void
	) {
		this.plugin = plugin;
		this.app = app;
		this.displayCallback = displayCallback;
	}

	/**
	 * 创建渲染按钮管理区域，支持分组、拖拽排序、编辑、删除等。
	 * @param containerEl 按钮管理内容容器
	 */
	create(containerEl: HTMLElement): void {
		// 渲染每个分类
		const sortedCategories = [...this.plugin.settings.categories].sort((a, b) => a.order - b.order);

		sortedCategories.forEach((category, index) => {
			// 1. 创建details元素时不设置open属性
			const details = containerEl.createEl('details', {
				cls: 'button-category-group'
			});

			// 2. 渲染后立即设置details.open为内存状态
			const isOpen = this.plugin.categoryOpenState[category.id] === true;
			details.open = isOpen;

			// 3. summary点击时允许默认行为，并在下一个事件循环中同步状态
			const summary = details.createEl('summary', {
				cls: 'button-category-summary'
			});
			summary.addEventListener('click', (e) => {
				setTimeout(() => {
					this.plugin.categoryOpenState[category.id] = details.open;
					updateCollapseIcon();
				}, 0);
			});

			// 左侧：折叠图标容器
			const leftContainer = summary.createDiv({cls: 'summary-left-container'});
			leftContainer.innerHTML = `<span class="custom-collapse-icon" tabindex="0" aria-label="${t('toggle_collapse', this.plugin)}" role="button">
				<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M6 4.5L12 9L6 13.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
			</span>`;
			const collapseIcon = leftContainer.querySelector('.custom-collapse-icon') as HTMLElement;
			// 4. 图标点击时触发summary的点击事件
			if (collapseIcon) {
				collapseIcon.addEventListener('click', (e) => {
					e.preventDefault();
					e.stopPropagation();
					summary.click();
				});
			}

			// 5. toggle事件也同步状态和图标
			details.addEventListener('toggle', () => {
				this.plugin.categoryOpenState[category.id] = details.open;
				updateCollapseIcon();
			});

			// 6. updateCollapseIcon函数用于同步图标class
			function updateCollapseIcon() {
				if (!collapseIcon) return;
				if (details.open) {
					collapseIcon.classList.remove('collapsed');
					collapseIcon.classList.add('expanded');
				} else {
					collapseIcon.classList.remove('expanded');
					collapseIcon.classList.add('collapsed');
				}
			}

			updateCollapseIcon();

			// 分类拖动逻辑
			this.setupCategoryDrag(details, index, sortedCategories);

			// 中间：分类名称容器
			const centerContainer = summary.createDiv({cls: 'summary-center-container'});
			centerContainer.createSpan({text: category.name});

			// 右侧：操作按钮容器
			const rightContainer = summary.createDiv({cls: 'summary-right-container'});
			new ButtonComponent(rightContainer)
				.setIcon('pencil')
				.setTooltip(t('rename_category', this.plugin))
				.setClass('rename-category-button')
				.onClick((e) => {
					e.preventDefault();
					e.stopPropagation();
					new RenameCategoryModal(this.app, this.plugin, category, () => {
						this.displayCallback?.();
					}).open();
				});
			new ButtonComponent(rightContainer)
				.setIcon('copy')
				.setTooltip(t('copy_category', this.plugin))
				.setClass('copy-category-button')
				.onClick(async (e) => {
					e.preventDefault();
					e.stopPropagation();
					await this.handleCopyCategory(category);
				});
			new ButtonComponent(rightContainer)
				.setIcon('trash')
				.setTooltip(t('delete_category', this.plugin))
				.setClass('delete-category-button')
				.setWarning()
				.onClick((e) => {
					e.preventDefault();
					e.stopPropagation();
					this.handleDeleteCategory(category);
				});

			const buttonListContainer = details.createDiv('button-list-container');
			const buttonsInCategory = [...category.buttons].sort((a, b) => a.order - b.order);

			buttonsInCategory.forEach((button, buttonIndex) => {
				this.renderButtonSettingItem(buttonListContainer, button, category, buttonIndex);
			});

			// 分类下添加按钮功能卡片
			const addButtonCard = buttonListContainer.createDiv('add-button-card');
			const addBtn = new ButtonComponent(addButtonCard)
				.setIcon('plus')
				.setTooltip(t('add_button', this.plugin))
				.setCta()
				.onClick(() => {
					new ButtonEditModal(this.app, this.plugin, null, category, () => {
						this.displayCallback?.();
					}).open();
				});
			addBtn.buttonEl.classList.add('add-button-btn');

			// 使分类区域支持拖拽放置按钮（拖动到分类空白处）
			this.makeCategoryDroppable(details, category);
		});
		// 分类渲染完后再渲染添加分类卡片
		const addCategoryCard = containerEl.createDiv('add-category-card');
		const addCategoryBtn = new ButtonComponent(addCategoryCard)
			.setIcon('plus')
			.setTooltip(t('add_category', this.plugin))
			.setCta()
			.onClick(() => {
				new CreateCategoryModal(this.app, this.plugin, async (value: string) => {
					const newCategory: CategoryConfig = {
						id: Date.now().toString(),
						name: value,
						order: this.plugin.settings.categories.length,
						buttons: [],
					};
					this.plugin.settings.categories.push(newCategory);
					await this.plugin.saveSettings();
					this.displayCallback?.();
				}).open();
			});
		addCategoryBtn.buttonEl.classList.add('add-category-btn');
	}

	/**
	 * 设置分类拖动逻辑，支持分类的拖拽排序。
	 * @param details 分类详情元素
	 * @param index 当前分类索引
	 * @param sortedCategories 排序后的分类数组
	 */
	private setupCategoryDrag(details: HTMLElement, index: number, sortedCategories: CategoryConfig[]): void {
		details.draggable = true;
		details.addEventListener('dragstart', (e) => {
			if (e.target !== details) {
				e.stopPropagation();
				return;
			}
			this.draggedCategoryIndex = index;
			details.addClass('is-dragging');
		});

		details.addEventListener('dragend', () => {
			this.draggedCategoryIndex = -1;
			details.removeClass('is-dragging');
		});

		details.addEventListener('dragover', (e) => {
			e.preventDefault();
			if (index !== this.draggedCategoryIndex) {
				details.addClass('drag-over-category');
			}
		});

		details.addEventListener('dragleave', () => {
			details.removeClass('drag-over-category');
		});

		details.addEventListener('drop', async (e) => {
			e.preventDefault();
			details.removeClass('drag-over-category');
			if (this.draggedCategoryIndex === -1 || this.draggedCategoryIndex === index) {
				return;
			}
			// 重新排序分类
			const newOrder = [...this.plugin.settings.categories];
			const [draggedItem] = newOrder.splice(this.draggedCategoryIndex, 1);
			newOrder.splice(index, 0, draggedItem);
			this.plugin.settings.categories = newOrder;
			this.plugin.settings.categories.forEach((cat: CategoryConfig, i: number) => {
				cat.order = i;
			});
			await this.plugin.saveSettings();
			this.displayCallback?.();
		});

		// 分类长按菜单
		if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
			let touchTimer: number | null = null;
			let touchStartX = 0;
			let touchStartY = 0;
			let hasMoved = false;

			details.addEventListener('touchstart', (e) => {
				touchStartX = e.touches[0].clientX;
				touchStartY = e.touches[0].clientY;
				hasMoved = false;
				
				touchTimer = window.setTimeout(() => {
					// 检查全局标记，若为true则不弹出分类菜单
					if ((window as any).__BUTTON_PANEL_SUPPRESS_CATEGORY_MENU) {
						(window as any).__BUTTON_PANEL_SUPPRESS_CATEGORY_MENU = false;
						return;
					}
					if (!hasMoved) {
						details.addClass('is-dragging');
						const menu = new Menu();
						const currentCategory = sortedCategories[index];
						sortedCategories.forEach((cat, idx) => {
							if (cat.id === currentCategory.id) return;
							menu.addItem((item) => {
								item.setTitle(`${t('move_to', this.plugin)}: ${cat.name}`)
									.setIcon('arrow-right')
									.onClick(async () => {
										const categories = [...this.plugin.settings.categories];
										const from = categories.findIndex(c => c.id === currentCategory.id);
										const to = categories.findIndex(c => c.id === cat.id);
										if (from === -1 || to === -1 || from === to) return;
										const [moved] = categories.splice(from, 1);
										categories.splice(to, 0, moved);
										categories.forEach((c, i) => c.order = i);
										this.plugin.settings.categories = categories;
										await this.plugin.saveSettings();
										this.displayCallback?.();
										details.removeClass('is-dragging');
									});
							});
						});
						const touch = e.touches[0];
						menu.showAtPosition({x: touch.clientX, y: touch.clientY});
						setTimeout(() => {
							const menuDom = document.body.querySelector('.menu');
							if (menuDom) menuDom.classList.add('buttons-panel-plugin');
							// 监听菜单外点击，自动移除is-dragging
							const removeDragging = () => {
								details.removeClass('is-dragging');
								document.removeEventListener('mousedown', removeDragging, true);
								document.removeEventListener('touchstart', removeDragging, true);
							};
							setTimeout(() => {
								document.addEventListener('mousedown', removeDragging, true);
								document.addEventListener('touchstart', removeDragging, true);
							}, 0);
						}, 0);
					}
				}, 500);
			}, {passive: true});
			
			details.addEventListener('touchmove', (e) => {
				const touchX = e.touches[0].clientX;
				const touchY = e.touches[0].clientY;
				const deltaX = Math.abs(touchX - touchStartX);
				const deltaY = Math.abs(touchY - touchStartY);
				
				if (deltaX > 10 || deltaY > 10) {
					hasMoved = true;
					if (touchTimer) {
						clearTimeout(touchTimer);
						touchTimer = null;
					}
				}
			}, {passive: true});
			
			details.addEventListener('touchend', () => {
				if (touchTimer) {
					clearTimeout(touchTimer);
					touchTimer = null;
				}
				(window as any).__BUTTON_PANEL_SUPPRESS_CATEGORY_MENU = false;
			}, {passive: true});
		}
	}

	/**
	 * 渲染单个按钮的设置项，支持拖拽排序、编辑、复制、删除等。
	 * @param container 按钮列表容器
	 * @param button 按钮配置对象
	 * @param category 当前分类对象
	 * @param buttonIndex 按钮在分类中的索引
	 */
	private renderButtonSettingItem(container: HTMLElement, button: ButtonConfig, category: CategoryConfig, buttonIndex: number): void {
		const itemEl = container.createDiv({cls: 'button-setting-item'});
		itemEl.draggable = true;

		// 拖动开始：记录按钮ID和源分类信息
		itemEl.addEventListener('dragstart', (e) => {
			if (e.dataTransfer) {
				e.dataTransfer.setData('text/plain', button.id);
				e.dataTransfer.setData('application/json', JSON.stringify({
					sourceCategoryId: category.id,
					sourceButtonIndex: buttonIndex
				}));
				e.dataTransfer.effectAllowed = 'move';
			}
			itemEl.addClass('is-dragging');
			document.body.addClass('button-dragging');
		});

		// 拖动结束：清理样式
		itemEl.addEventListener('dragend', () => {
			itemEl.removeClass('is-dragging');
			document.body.removeClass('button-dragging');
		});

		// 拖动悬停：显示可放置的指示
		itemEl.addEventListener('dragover', (e) => {
			e.preventDefault();
			itemEl.addClass('drag-over');
		});
		itemEl.addEventListener('dragleave', () => {
			itemEl.removeClass('drag-over');
		});

		// 放置：处理排序
		itemEl.addEventListener('drop', async (e) => {
			e.preventDefault();
			itemEl.removeClass('drag-over');

			const draggedButtonId = e.dataTransfer?.getData('text/plain');
			if (!draggedButtonId || draggedButtonId === button.id) return;

			// 获取拖拽按钮的源分类信息
			const dragData = e.dataTransfer?.getData('application/json');
			let sourceCategoryId = '';
			if (dragData) {
				try {
					const parsedData = JSON.parse(dragData);
					sourceCategoryId = parsedData.sourceCategoryId;
				} catch (e) {
					console.error('解析拖拽数据失败:', e);
				}
			}

			// 判断是否为跨分类拖动
			const isCrossCategory = sourceCategoryId && sourceCategoryId !== category.id;

			if (isCrossCategory) {
				// 跨分类拖动：先移动到目标分类末尾，再排序到目标位置
				const {sourceCategory, buttonToMove} = this.findButtonAndCategory(draggedButtonId);
				if (!sourceCategory || !buttonToMove) return;

				// 1. 从源分类中移除按钮
				this.removeButtonFromCategory(sourceCategory, draggedButtonId);

				// 2. 添加到目标分类的末尾
				this.insertButtonToCategory(category, buttonToMove, category.buttons.length);

				// 3. 在目标分类内排序：从末尾移动到目标按钮位置
				const buttonsInCategory = [...category.buttons].sort((a, b) => a.order - b.order);
				const targetIdx = buttonsInCategory.findIndex(b => b.id === button.id);
				const draggedIdx = buttonsInCategory.findIndex(b => b.id === draggedButtonId);

				if (targetIdx !== -1 && draggedIdx !== -1 && draggedIdx !== targetIdx) {
					// 从当前位置移除，插入到目标位置
					const [movedItem] = buttonsInCategory.splice(draggedIdx, 1);
					buttonsInCategory.splice(targetIdx, 0, movedItem);

					// 更新分类内按钮的 order，从0开始排序
					buttonsInCategory.forEach((b, i) => b.order = i);

					// 更新分类中的按钮数组
					category.buttons = buttonsInCategory;
				}

				await this.plugin.saveSettings();
				this.displayCallback?.();
			} else {
				// 同分类内排序
				const buttonsInSameCategory = [...category.buttons].sort((a, b) => a.order - b.order);

				const draggedIdx = buttonsInSameCategory.findIndex(b => b.id === draggedButtonId);
				const targetIdx = buttonsInSameCategory.findIndex(b => b.id === button.id);
				if (draggedIdx === -1 || targetIdx === -1 || draggedIdx === targetIdx) return;

				const [draggedItem] = buttonsInSameCategory.splice(draggedIdx, 1);
				buttonsInSameCategory.splice(targetIdx, 0, draggedItem);

				// 更新分类内按钮的 order，从0开始排序
				buttonsInSameCategory.forEach((b, i) => b.order = i);

				// 更新分类中的按钮数组
				category.buttons = buttonsInSameCategory;
				await this.plugin.saveSettings();
				this.displayCallback?.();
			}
		});

		// 按钮长按菜单
		if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
			let touchTimer: number | null = null;
			let touchStartX = 0;
			let touchStartY = 0;
			let hasMoved = false;

			itemEl.addEventListener('touchstart', (e) => {
				touchStartX = e.touches[0].clientX;
				touchStartY = e.touches[0].clientY;
				hasMoved = false;
				
				touchTimer = window.setTimeout(() => {
					if (!hasMoved) {
						(window as any).__BUTTON_PANEL_SUPPRESS_CATEGORY_MENU = true;
						if (typeof e.stopPropagation === 'function') e.stopPropagation();
						const menu = new Menu();
						const allCategories = this.plugin.settings.categories;
						const currentCategory = category;
						const currentButton = button;
						allCategories.forEach((cat: CategoryConfig) => {
							// 分类项
							menu.addItem((item) => {
								item.setIcon('arrow-right')
									.setTitle(cat.name)
									.onClick(async () => {
										this.removeButtonFromCategory(currentCategory, currentButton.id);
										this.insertButtonToCategory(cat, currentButton, cat.buttons.length);
										await this.plugin.saveSettings();
										this.displayCallback?.();
									});
							});
							// 分类下的按钮项
							cat.buttons.forEach((btn: ButtonConfig, idx: number) => {
								if (cat.id === currentCategory.id && btn.id === currentButton.id) return;
								menu.addItem((item) => {
									item.setIcon('arrow-right')
										.setTitle(btn.name)
										.onClick(async () => {
											this.removeButtonFromCategory(currentCategory, currentButton.id);
											this.insertButtonToCategory(cat, currentButton, idx);
											await this.plugin.saveSettings();
											this.displayCallback?.();
										});
									(item as any).dom?.style && ((item as any).dom.style.paddingLeft = '2em');
								});
							});
						});
						const touch = e.touches[0];
						menu.showAtPosition({x: touch.clientX, y: touch.clientY});
						setTimeout(() => {
							const menuDom = document.body.querySelector('.menu');
							if (menuDom) menuDom.classList.add('buttons-panel-plugin');
						}, 0);
					}
				}, 500);
			}, {passive: false});
			
			itemEl.addEventListener('touchmove', (e) => {
				const touchX = e.touches[0].clientX;
				const touchY = e.touches[0].clientY;
				const deltaX = Math.abs(touchX - touchStartX);
				const deltaY = Math.abs(touchY - touchStartY);
				
				// 如果移动距离超过阈值，标记为已移动并取消长按
				if (deltaX > 10 || deltaY > 10) {
					hasMoved = true;
					if (touchTimer) {
						clearTimeout(touchTimer);
						touchTimer = null;
					}
				}
			}, {passive: true});
			
			itemEl.addEventListener('touchend', () => {
				if (touchTimer) {
					clearTimeout(touchTimer);
					touchTimer = null;
				}
			}, {passive: true});
		}

		const dragHandle = itemEl.createDiv({cls: 'button-drag-handle'});
		setIcon(dragHandle, 'grip-vertical');

		// 创建按钮内容容器
		const buttonContent = itemEl.createDiv({cls: 'button-content'});

		// 显示按钮图标
		if (button.icon) {
			const iconEl = buttonContent.createDiv({cls: 'button-list-icon'});
			if (button.icon.trim().startsWith('<svg')) {
				// iconEl.innerHTML = button.icon;
				safeSetSVG(iconEl, button.icon);
			} else {
				iconEl.textContent = button.icon;
			}
		}

		// 显示按钮名称
		buttonContent.createSpan({text: button.name, cls: 'button-name-text'});

		// 右侧：控制按钮
		const controlsContainer = itemEl.createDiv('button-controls-container');

		new ButtonComponent(controlsContainer)
			.setIcon('pencil')
			.setTooltip(t('edit_button_tooltip', this.plugin))
			.onClick(() => {
				new ButtonEditModal(this.app, this.plugin, button, category, () => {
					this.plugin.saveSettings();
					this.displayCallback?.();
				}).open();
			});

		new ButtonComponent(controlsContainer)
			.setIcon('copy')
			.setTooltip(t('copy_button_tooltip', this.plugin))
			.onClick(async () => {
				const newButton: ButtonConfig = {
					...JSON.parse(JSON.stringify(button)),
					id: Date.now().toString(),
					order: category.buttons.length
				};
				category.buttons.push(newButton);
				await this.plugin.saveSettings();
				this.displayCallback?.();
			});

		new ButtonComponent(controlsContainer)
			.setIcon('trash')
			.setWarning()
			.setTooltip(t('delete_button_tooltip', this.plugin))
			.onClick(() => {
							new DeleteButtonModal(this.app, this.plugin, button, category, () => {
				this.removeButtonFromCategory(category, button.id);
				this.plugin.saveSettings();
				this.displayCallback?.();
			}).open();
			});
	}

	/**
	 * 处理删除分类逻辑，弹出确认模态框
	 * @param category 要删除的分类
	 */
	private handleDeleteCategory(category: CategoryConfig): void {
		new DeleteCategoryModal(this.app, this.plugin, category, () => {
			this.displayCallback?.();
		}).open();
	}

	/**
	 * 处理复制分类逻辑，深拷贝分类及其按钮
	 * @param category 要复制的分类
	 */
	private async handleCopyCategory(category: CategoryConfig): Promise<void> {
		// 直接使用原分类名称，允许重名
		const newName = category.name;

		// 深拷贝分类及其按钮
		const copiedCategory: CategoryConfig = {
			id: Date.now().toString(),
			name: newName,
			order: this.plugin.settings.categories.length,
			buttons: category.buttons.map((button, index) => ({
				...JSON.parse(JSON.stringify(button)),
				id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
				order: index // 重新设置按钮顺序
			}))
		};

		// 添加到分类列表
		this.plugin.settings.categories.push(copiedCategory);

		// 保存设置
		await this.plugin.saveSettings();

		// 刷新显示
		this.displayCallback?.();

		// 显示成功消息
		// new Notice(tWithParams('category_copy_success', { oldName: category.name, newName }, this.plugin));
	}

	/**
	 * 使分类区域支持拖拽放置按钮（拖动到分类空白处）
	 * @param categoryEl 分类详情元素
	 * @param category 分类对象
	 */
	private makeCategoryDroppable(categoryEl: HTMLElement, category: CategoryConfig): void {
		categoryEl.addEventListener('dragover', (e) => {
			e.preventDefault();
			if (e.dataTransfer) {
				e.dataTransfer.dropEffect = 'move';
			}
			if (e.dataTransfer) {
				categoryEl.addClass('drag-over-category');
			}
		});

		categoryEl.addEventListener('dragleave', (e) => {
			if (!categoryEl.contains(e.relatedTarget as Node)) {
				categoryEl.removeClass('drag-over-category');
			}
		});

		categoryEl.addEventListener('drop', async (e) => {
			e.preventDefault();
			categoryEl.removeClass('drag-over-category');

			// 递归判断 target 是否为按钮（button-setting-item）
			let el = e.target as HTMLElement | null;
			let isButton = false;
			while (el && el !== categoryEl) {
				if (el.classList && el.classList.contains('button-setting-item')) {
					isButton = true;
					break;
				}
				el = el.parentElement;
			}
			if (isButton) return;

			const draggedButtonId = e.dataTransfer?.getData('text/plain');
			if (!draggedButtonId) return;

			// 查找被拖拽的按钮及其源分类
			const {sourceCategory, buttonToMove} = this.findButtonAndCategory(draggedButtonId);
			if (!sourceCategory || !buttonToMove) return;

			// 如果按钮当前分类与目标分类不同，则更新分类
			if (sourceCategory.id !== category.id) {
				// 从源分类中移除按钮
				this.removeButtonFromCategory(sourceCategory, draggedButtonId);

				// 添加到目标分类的末尾
				this.insertButtonToCategory(category, buttonToMove, category.buttons.length);

				await this.plugin.saveSettings();
				this.displayCallback?.();
			} else {
				// 如果是同一个分类，检查按钮是否已经在末尾
				const lastButton = category.buttons[category.buttons.length - 1];
				if (lastButton && lastButton.id !== draggedButtonId) {
					// 如果不在末尾，移动到末尾
					const currentIndex = category.buttons.findIndex(b => b.id === draggedButtonId);
					if (currentIndex > -1) {
						const [movedButton] = category.buttons.splice(currentIndex, 1);
						this.insertButtonToCategory(category, movedButton, category.buttons.length);
						await this.plugin.saveSettings();
						this.displayCallback?.();
					}
				}
			}
		});
	}

	/**
	 * 查找按钮及其所属分类
	 * @param buttonId 按钮ID
	 * @returns { sourceCategory, buttonToMove }
	 */
	private findButtonAndCategory(buttonId: string): {
		sourceCategory: CategoryConfig | null;
		buttonToMove: ButtonConfig | null
	} {
		for (const category of this.plugin.settings.categories) {
			const button = category.buttons.find((b: ButtonConfig) => b.id === buttonId);
			if (button) {
				return {sourceCategory: category, buttonToMove: button};
			}
		}
		return {sourceCategory: null, buttonToMove: null};
	}

	/**
	 * 从分类中移除按钮
	 * @param category 分类对象
	 * @param buttonId 按钮ID
	 */
	private removeButtonFromCategory(category: CategoryConfig, buttonId: string): void {
		const index = category.buttons.findIndex((b: ButtonConfig) => b.id === buttonId);
		if (index > -1) {
			category.buttons.splice(index, 1);
			this.reorderCategoryButtons(category);
		}
	}

	/**
	 * 向分类指定位置插入按钮
	 * @param category 分类对象
	 * @param button 按钮对象
	 * @param position 插入位置索引
	 */
	private insertButtonToCategory(category: CategoryConfig, button: ButtonConfig, position: number): void {
		category.buttons.splice(position, 0, button);
		this.reorderCategoryButtons(category);
	}

	/**
	 * 重新排序分类内按钮的order字段
	 * @param category 分类对象
	 */
	private reorderCategoryButtons(category: CategoryConfig): void {
		category.buttons.forEach((button: ButtonConfig, index: number) => {
			button.order = index;
		});
	}
}

/**
 * 工具函数：创建按钮管理区域
 * @param containerEl 容器元素
 * @param plugin 插件主类
 * @param app Obsidian应用实例
 * @param displayCallback 刷新回调
 */
export function createButtonManagementSection(
	containerEl: HTMLElement,
	plugin: ButtonsPanelPlugin,
	app: App,
	displayCallback?: () => void
): void {
	const buttonsManagement = new ButtonManagementSection(
		plugin,
		app,
		displayCallback
	);
	buttonsManagement.create(containerEl);
}
