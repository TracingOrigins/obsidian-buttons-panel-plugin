// CategoryMoveModeRenderer.ts
// 分类移动模式渲染器，专门处理分类移动模式下的界面渲染。
import { ButtonsPanelPlugin } from '@/types/plugin';
import { CategoryConfig } from '@/types';
import { ViewStateManager } from '../managers/ViewStateManager';
import { CategoryMoveManager } from '../managers/CategoryMoveManager';
import { t } from '@/utils/i18n';

/**
 * CategoryMoveModeRenderer 分类移动模式渲染器。
 * 负责渲染分类移动模式下的面板、分类、提示等。
 * 遵循单一职责原则，只负责分类移动模式的渲染。
 */
export class CategoryMoveModeRenderer {
    private plugin: ButtonsPanelPlugin;
    private stateManager: ViewStateManager;
    private categoryMoveManager: CategoryMoveManager;

    /**
     * 构造函数，初始化渲染器依赖。
     * @param plugin 插件主类实例
     * @param stateManager 视图状态管理器
     * @param categoryMoveManager 分类移动管理器
     */
    constructor(
        plugin: ButtonsPanelPlugin,
        stateManager: ViewStateManager,
        categoryMoveManager: CategoryMoveManager
    ) {
        this.plugin = plugin;
        this.stateManager = stateManager;
        this.categoryMoveManager = categoryMoveManager;
    }

    /**
     * 渲染分类移动模式下的主面板。
     * @param container 容器元素
     */
    renderCategoryMoveModePanel(container: HTMLElement): void {
        try {
            container.empty();
            const panelEl = container.createDiv('buttons-panel-container category-move-mode');

            // 移动模式提示
            this.renderMoveModeTip(panelEl);

            // 渲染所有分类（手动渲染）
            const sortedCategories = this.plugin.settings.categories
                .slice()
                .sort((a, b) => a.order - b.order);
            sortedCategories.forEach((category) => {
                this.renderCategoryInMoveMode(panelEl, category);
            });
        } catch (error) {
            console.error('渲染分类移动模式面板时出错:', error);
        }
    }

    /**
     * 渲染移动模式提示信息。
     * @param panelEl 面板元素
     */
    private renderMoveModeTip(panelEl: HTMLElement): void {
        const moveTip = panelEl.createDiv('move-mode-tip');
        const tipContainer = moveTip.createDiv();
        const titleEl = tipContainer.createEl('strong');
        titleEl.textContent = t('category_move_mode', this.plugin);
        tipContainer.createEl('br');
        const descEl = tipContainer.createEl('span');
        descEl.textContent = t('category_move_mode_desc', this.plugin);
    }

    /**
     * 渲染分类（移动模式）。
     * @param panelEl 面板元素
     * @param category 分类对象
     */
    private renderCategoryInMoveMode(panelEl: HTMLElement, category: CategoryConfig): void {
        const categoryContainer = panelEl.createDiv('buttons-panel-category move-category-target');
        categoryContainer.setAttribute('data-category-id', category.id);

        // 渲染分类标题
        this.renderCategoryTitle(categoryContainer, category);

        // 高亮被移动的分类
        const moveCategoryState = this.stateManager.getMoveCategoryState();
        if (category.id === moveCategoryState.movingCategory?.id) {
            categoryContainer.classList.add('moving-category');
        }

        // 绑定分类容器点击事件
        this.bindCategoryContainerClick(categoryContainer, category);
    }

    /**
     * 渲染分类标题。
     * @param categoryContainer 分类容器
     * @param category 分类对象
     */
    private renderCategoryTitle(categoryContainer: HTMLElement, category: CategoryConfig): void {
        const categoryTitle = categoryContainer.createEl('h3', { text: category.name });
        categoryTitle.addClass('buttons-panel-category-title');
    }

    /**
     * 绑定分类容器点击事件。
     * @param categoryContainer 分类容器
     * @param category 分类对象
     */
    private bindCategoryContainerClick(
        categoryContainer: HTMLElement,
        category: CategoryConfig
    ): void {
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
    }
}
