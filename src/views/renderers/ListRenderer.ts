// ListRenderer.ts
// 列表渲染器，负责渲染按钮面板的列表视图。
import { ButtonsPanelPlugin } from '@/types/plugin';
import { ButtonConfig, CategoryConfig } from '@/types';
import { t } from '@/utils/i18n';
import { ButtonComponent, App, Menu } from 'obsidian';
import { CreateCategoryModal } from '../../settings/modals/CreateCategoryModal';
import { RenameCategoryModal } from '../../settings/modals/RenameCategoryModal';
import { DeleteCategoryModal } from '../../settings/modals/DeleteCategoryModal';
import { AddButtonModal } from '../../settings/modals/AddButtonModal';
import { ButtonRenderer } from './ButtonRenderer';
import { ViewStateManager } from '../managers/ViewStateManager';
import { CategoryMoveManager } from '../managers/CategoryMoveManager';

/**
 * ListRenderer 列表渲染器。
 * 负责渲染按钮面板的列表视图，包括分类、按钮、右键菜单、移动模式等。
 * 遵循单一职责原则，只负责列表渲染。
 */
export class ListRenderer {
    private plugin: ButtonsPanelPlugin;
    private stateManager: ViewStateManager;
    private categoryMoveManager: CategoryMoveManager;
    private buttonRenderer: ButtonRenderer;
    private app: App;
    private moveManager: any;
    private mainView: any; // 主视图引用

    /**
     * 构造函数，初始化渲染器依赖。
     * @param plugin 插件主类实例
     * @param stateManager 视图状态管理器
     * @param categoryMoveManager 分类移动管理器
     * @param buttonRenderer 按钮渲染器
     * @param app Obsidian应用实例
     * @param moveManager 按钮移动管理器
     * @param mainView 主视图实例
     */
    constructor(
        plugin: ButtonsPanelPlugin,
        stateManager: ViewStateManager,
        categoryMoveManager: CategoryMoveManager,
        buttonRenderer: ButtonRenderer,
        app: App,
        moveManager?: any,
        mainView?: any
    ) {
        this.plugin = plugin;
        this.stateManager = stateManager;
        this.categoryMoveManager = categoryMoveManager;
        this.buttonRenderer = buttonRenderer;
        this.app = app;
        this.moveManager = moveManager;
        this.mainView = mainView;
    }

    /**
     * 渲染列表视图。
     * @param container 容器元素
     * @param groupedButtons 按分类分组的按钮
     * @param sortedCategories 排序后的分类数组
     * @param panelConfig 面板配置
     * @param onMoveStart 按钮移动回调
     * @param onRenderComplete 渲染完成回调
     */
    renderListView(
        container: HTMLElement,
        groupedButtons: Record<string, ButtonConfig[]>,
        sortedCategories: CategoryConfig[],
        panelConfig: any,
        onMoveStart?: (button: ButtonConfig, buttonEl: HTMLElement) => void,
        onRenderComplete?: () => void
    ): void {
        sortedCategories.forEach((category) => {
            const categoryContainer = container.createDiv('buttons-panel-category');

            // 渲染分类标题
            this.renderCategoryTitle(categoryContainer, category, panelConfig);

            // 渲染分类按钮
            this.renderCategoryButtons(
                categoryContainer,
                category,
                groupedButtons[category.id],
                panelConfig,
                onMoveStart
            );

            // 处理分类移动模式
            this.handleCategoryMoveMode(categoryContainer, category, sortedCategories);
        });

        // 添加分类按钮
        this.addCategoryButton(container, panelConfig);

        // 处理分类移动模式的ESC退出
        this.handleCategoryMoveEsc();

        if (onRenderComplete) {
            onRenderComplete();
        }
    }

    /**
     * 渲染分类标题。
     * @param container 分类容器
     * @param category 分类对象
     * @param panelConfig 面板配置
     */
    private renderCategoryTitle(
        container: HTMLElement,
        category: CategoryConfig,
        panelConfig: any
    ): void {
        const categoryTitle = container.createEl('h3', { text: category.name });
        categoryTitle.addClass('buttons-panel-category-title');

        // 分类名称右键菜单（仅编辑模式下）
        if (panelConfig.enableEditMode) {
            this.bindCategoryTitleContextMenu(categoryTitle, category);
        }
    }

    /**
     * 绑定分类标题右键菜单。
     * @param categoryTitle 分类标题元素
     * @param category 分类对象
     */
    private bindCategoryTitleContextMenu(
        categoryTitle: HTMLElement,
        category: CategoryConfig
    ): void {
        categoryTitle.addEventListener('contextmenu', (e) => {
            if (this.stateManager.isInAnyMoveMode()) return; // 移动模式下禁用

            e.preventDefault();
            e.stopPropagation();

            const menu = new Menu();

            // 移动选项
            menu.addItem((item: any) =>
                item
                    .setTitle(t('move'))
                    .setIcon('move')
                    .onClick(() => {
                        // 直接调用主视图的分类移动方法
                        if (
                            this.mainView &&
                            typeof this.mainView.handleCategoryMoveStart === 'function'
                        ) {
                            this.mainView.handleCategoryMoveStart(category);
                        }
                    })
            );

            // 编辑选项
            menu.addItem((item: any) =>
                item
                    .setTitle(t('edit'))
                    .setIcon('pencil')
                    .onClick(() => {
                        new RenameCategoryModal(this.app, this.plugin, category, async () => {
                            await this.plugin.saveSettings();
                        }).open();
                    })
            );

            // 复制选项
            menu.addItem((item: any) =>
                item
                    .setTitle(t('copy'))
                    .setIcon('copy')
                    .onClick(async () => {
                        const newCategory = JSON.parse(JSON.stringify(category));
                        newCategory.id =
                            Date.now().toString() + Math.random().toString(36).substring(2, 9);
                        newCategory.name = category.name;
                        newCategory.order = this.plugin.settings.categories.length;
                        newCategory.buttons.forEach((btn: ButtonConfig) => {
                            btn.id =
                                Date.now().toString() + Math.random().toString(36).substring(2, 9);
                        });
                        this.plugin.settings.categories.push(newCategory);
                        // 统一排序order
                        this.plugin.settings.categories.forEach((cat, idx) => {
                            cat.order = idx;
                        });
                        await this.plugin.saveSettings();
                    })
            );

            // 删除选项
            menu.addItem((item: any) =>
                item
                    .setTitle(t('delete'))
                    .setIcon('trash')
                    .onClick(() => {
                        new DeleteCategoryModal(this.app, this.plugin, category, async () => {
                            await this.plugin.saveSettings();
                        }).open();
                    })
            );

            menu.showAtPosition({ x: e.clientX, y: e.clientY });
        });
    }

    /**
     * 渲染分类下的所有按钮。
     * @param container 分类容器
     * @param category 分类对象
     * @param buttons 按钮数组
     * @param panelConfig 面板配置
     * @param onMoveStart 按钮移动回调
     */
    private renderCategoryButtons(
        container: HTMLElement,
        category: CategoryConfig,
        buttons: ButtonConfig[],
        panelConfig: any,
        onMoveStart?: (button: ButtonConfig, buttonEl: HTMLElement) => void
    ): void {
        // 渲染按钮网格时，自动添加 icon-top 或 icon-left 类
        const gridStyleClass = panelConfig.displayStyle === 'icon_top' ? 'icon-top' : 'icon-left';
        const buttonsContainer = container.createDiv('buttons-panel-grid ' + gridStyleClass);

        buttons.forEach((button) => {
            this.buttonRenderer.renderButton(
                buttonsContainer,
                button,
                panelConfig,
                onMoveStart,
                this.stateManager.isInMoveMode(),
                this.moveManager
            );
        });

        // 分类内加号按钮
        if (!this.stateManager.isInCategoryMoveMode() && panelConfig.enableEditMode) {
            const addBtn = new ButtonComponent(buttonsContainer.createDiv('add-button-card'))
                .setIcon('plus')
                .setTooltip(t('add_button'))
                .onClick(() => {
                    new AddButtonModal(this.app, this.plugin, category, async () => {
                        await this.plugin.saveSettings();
                        // 可选：刷新面板
                    }).open();
                });
            addBtn.buttonEl.classList.add('add-button-btn');
        }
    }

    /**
     * 处理分类移动模式。
     * @param categoryContainer 分类容器
     * @param category 分类对象
     * @param sortedCategories 排序后的分类数组
     */
    private handleCategoryMoveMode(
        categoryContainer: HTMLElement,
        category: CategoryConfig,
        sortedCategories: CategoryConfig[]
    ): void {
        if (this.stateManager.isInCategoryMoveMode()) {
            categoryContainer.classList.add('move-category-target');
            categoryContainer.onclick = null; // 先移除旧事件
            categoryContainer.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const moveCategoryState = this.stateManager.getMoveCategoryState();
                if (!moveCategoryState.movingCategory) return;
                this.categoryMoveManager.handleCategoryMoveClick(
                    moveCategoryState.movingCategory,
                    category
                );
            });
            // 进入分类移动模式时，绑定 ESC 监听
            if (typeof (window as any).app?.view?.enterCategoryMoveMode === 'function') {
                (window as any).app.view.enterCategoryMoveMode();
            }
            // 高亮被移动的分类
            const moveCategoryState = this.stateManager.getMoveCategoryState();
            if (category.id === moveCategoryState.movingCategory?.id) {
                categoryContainer.classList.add('moving-category');
            }
        }
    }

    /**
     * 添加分类按钮。
     * @param container 容器元素
     * @param panelConfig 面板配置
     */
    private addCategoryButton(container: HTMLElement, panelConfig: any): void {
        if (panelConfig.enableEditMode && !this.stateManager.isInCategoryMoveMode()) {
            const addCategoryBtn = new ButtonComponent(
                container.createDiv('buttons-panel-category add-category-card')
            )
                .setIcon('plus')
                .setTooltip(t('add_category'))
                .onClick(() => {
                    new CreateCategoryModal(this.app, this.plugin, async (categoryName: string) => {
                        const newCategory = {
                            id: Date.now().toString(),
                            name: categoryName,
                            order: this.plugin.settings.categories.length,
                            buttons: [],
                        };
                        this.plugin.settings.categories.push(newCategory);
                        await this.plugin.saveSettings();
                        if (this.mainView && typeof this.mainView.renderPanel === 'function') {
                            this.mainView.renderPanel();
                        }
                    }).open();
                });
            addCategoryBtn.buttonEl.classList.add('add-category-btn');
        }
    }

    /**
     * 处理分类移动模式的ESC退出（保留空实现，主视图统一处理ESC）。
     */
    private handleCategoryMoveEsc(): void {
        // 分类移动模式下不再单独绑定 ESC，统一由主视图监听
    }
}
