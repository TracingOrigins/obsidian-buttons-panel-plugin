// ButtonMoveModeRenderer.ts
// 按钮移动模式渲染器，专门处理按钮移动模式下的界面渲染。
import { ButtonsPanelPlugin } from '@/common/types/plugin';
import { ButtonConfig, CategoryConfig, PanelConfig } from '@/common/types';
import { ViewStateManager } from '@/views/managers/ViewStateManager';
import { ButtonMoveManager } from '@/views/managers/ButtonMoveManager';
import { ButtonRenderer } from '@/views/renderers/ButtonRenderer';
import { t } from '@/common/utils/i18n';

/**
 * ButtonMoveModeRenderer 按钮移动模式渲染器。
 * 负责渲染按钮移动模式下的面板、分类、按钮、占位符等。
 * 遵循单一职责原则，只负责按钮移动模式的渲染。
 */
export class ButtonMoveModeRenderer {
    private plugin: ButtonsPanelPlugin;
    private stateManager: ViewStateManager;
    private moveManager: ButtonMoveManager;
    private buttonRenderer: ButtonRenderer;

    /**
     * 构造函数，初始化渲染器依赖。
     * @param plugin 插件主类实例
     * @param stateManager 视图状态管理器
     * @param moveManager 按钮移动管理器
     * @param buttonRenderer 按钮渲染器
     */
    constructor(
        plugin: ButtonsPanelPlugin,
        stateManager: ViewStateManager,
        moveManager: ButtonMoveManager,
        buttonRenderer: ButtonRenderer
    ) {
        this.plugin = plugin;
        this.stateManager = stateManager;
        this.moveManager = moveManager;
        this.buttonRenderer = buttonRenderer;
    }

    /**
     * 渲染移动模式下的主面板。
     * @param container 容器元素
     * @param panelConfig 面板配置
     */
    renderMoveModePanel(container: HTMLElement, panelConfig: PanelConfig): void {
        try {
            container.empty();
            const panelEl = container.createDiv('buttons-panel-container button-move-mode');

            // 移动模式提示
            this.renderMoveModeTip(panelEl);

            // 渲染所有分类和按钮（手动渲染，不用listRenderer）
            const sortedCategories = this.plugin.settings.categories
                .slice()
                .sort((a, b) => a.order - b.order);
            sortedCategories.forEach((category) => {
                this.renderCategoryInMoveMode(panelEl, category, panelConfig);
            });
        } catch (error) {
            console.error('渲染移动模式面板时出错:', error);
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
        titleEl.textContent = t('button_move_mode');
        tipContainer.createEl('br');
        const descEl = tipContainer.createEl('span');
        descEl.textContent = t('button_move_mode_desc');
    }

    /**
     * 渲染分类（移动模式）。
     * @param panelEl 面板元素
     * @param category 分类对象
     * @param panelConfig 面板配置
     */
    private renderCategoryInMoveMode(
        panelEl: HTMLElement,
        category: CategoryConfig,
        panelConfig: PanelConfig
    ): void {
        const categoryContainer = panelEl.createDiv('buttons-panel-category move-mode-category');
        categoryContainer.setAttribute('data-category-id', category.id);

        // 渲染分类标题
        this.renderCategoryTitle(categoryContainer, category);

        // 渲染分类按钮
        this.renderCategoryButtons(categoryContainer, category, panelConfig);

        // 渲染空分类占位符
        // this.renderEmptyCategoryPlaceholder(categoryContainer, category);

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
        categoryTitle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const moveState = this.stateManager.getMoveState();
            if (!moveState.isMoving || !moveState.movingButton) return;
            void this.moveManager.updateButtonPosition(
                moveState.movingButton,
                category.id,
                category.buttons.length
            );
            this.moveManager.endMoveMode();
            // 触发视图刷新
            document.dispatchEvent(new CustomEvent('buttons-panel-refresh'));
        });
    }

    /**
     * 渲染分类下的所有按钮（移动模式）。
     * @param categoryContainer 分类容器
     * @param category 分类对象
     * @param panelConfig 面板配置
     */
    private renderCategoryButtons(
        categoryContainer: HTMLElement,
        category: CategoryConfig,
        panelConfig: PanelConfig
    ): void {
        const buttonsContainer = categoryContainer.createDiv('buttons-panel-grid');
        if (panelConfig.displayStyle === 'icon_top') {
            buttonsContainer.addClass('icon-top');
        } else {
            buttonsContainer.addClass('icon-left');
        }

        // 渲染按钮
        category.buttons.forEach((button, index) => {
            this.renderButtonInMoveMode(buttonsContainer, button, category, index, panelConfig);
        });

        // 绑定按钮容器点击事件
        this.bindButtonsContainerClick(buttonsContainer, category);

        // 渲染空分类占位符
        this.renderEmptyCategoryPlaceholder(buttonsContainer, category);
    }

    /**
     * 渲染单个按钮（移动模式）。
     * @param buttonsContainer 按钮容器
     * @param button 按钮对象
     * @param category 分类对象
     * @param index 按钮索引
     * @param panelConfig 面板配置
     */
    private renderButtonInMoveMode(
        buttonsContainer: HTMLElement,
        button: ButtonConfig,
        category: CategoryConfig,
        index: number,
        panelConfig: PanelConfig
    ): void {
        const btnEl = this.buttonRenderer.renderButton(buttonsContainer, button, panelConfig);
        const newBtnEl = btnEl.cloneNode(true) as HTMLElement;
        btnEl.replaceWith(newBtnEl);
        newBtnEl.classList.add('move-button-target');

        const moveState = this.stateManager.getMoveState();
        const isMoving = moveState.movingButton && button.id === moveState.movingButton.id;
        if (isMoving) {
            newBtnEl.classList.add('moving');
        }
        newBtnEl.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const moveState = this.stateManager.getMoveState();
            if (!moveState.isMoving || !moveState.movingButton) return;
            void this.moveManager.updateButtonPosition(
                moveState.movingButton,
                category.id,
                index
            );
            this.moveManager.endMoveMode();
            document.dispatchEvent(new CustomEvent('buttons-panel-refresh'));
        });
    }

    /**
     * 渲染空分类占位符。
     * @param buttonsContainer 按钮容器
     * @param category 分类对象
     */
    private renderEmptyCategoryPlaceholder(
        buttonsContainer: HTMLElement,
        category: CategoryConfig
    ): void {
        // 如果分类为空，添加一个可点击的占位符
        if (category.buttons.length === 0) {
            const emptyPlaceholder = buttonsContainer.createDiv('empty-category-placeholder');
            const placeholderContainer = emptyPlaceholder.createDiv();
            const contentDiv = placeholderContainer.createDiv();

            // 创建加号图标
            const plusIcon = contentDiv.createDiv();
            plusIcon.textContent = '+';

            // 创建提示文字
            const textDiv = contentDiv.createDiv();
            textDiv.textContent = t('empty_category_placeholder');

            emptyPlaceholder.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const moveState = this.stateManager.getMoveState();
                if (!moveState.isMoving || !moveState.movingButton) return;
                void this.moveManager.updateButtonPosition(
                    moveState.movingButton,
                    category.id,
                    0
                );
                this.moveManager.endMoveMode();
                // 触发视图刷新
                document.dispatchEvent(new CustomEvent('buttons-panel-refresh'));
            });
        }

        // if (category.buttons.length === 0) {
        // 	const emptyPlaceholder = buttonsContainer.createDiv('empty-category-placeholder');
        // 	emptyPlaceholder.textContent = t('empty_category_placeholder', this.plugin);
        // 	emptyPlaceholder.addEventListener('click', (e) => {
        // 		e.preventDefault();
        // 		e.stopPropagation();
        // 		const moveState = this.stateManager.getMoveState();
        // 		if (!moveState.isMoving || !moveState.movingButton) return;
        // 		this.moveManager.updateButtonPosition(moveState.movingButton, category.id, 0);
        // 		this.moveManager.endMoveMode();
        // 		// 触发视图刷新
        // 		document.dispatchEvent(new CustomEvent('buttons-panel-refresh'));
        // 	});
        // }
    }

    /**
     * 绑定按钮容器点击事件。
     * @param buttonsContainer 按钮容器
     * @param category 分类对象
     */
    private bindButtonsContainerClick(
        buttonsContainer: HTMLElement,
        category: CategoryConfig
    ): void {
        buttonsContainer.addEventListener('click', (e) => {
            if (e.target === buttonsContainer) {
                e.preventDefault();
                e.stopPropagation();
                const moveState = this.stateManager.getMoveState();
                if (!moveState.isMoving || !moveState.movingButton) return;
                void this.moveManager.updateButtonPosition(
                    moveState.movingButton,
                    category.id,
                    category.buttons.length
                );
                this.moveManager.endMoveMode();
                // 触发视图刷新
                document.dispatchEvent(new CustomEvent('buttons-panel-refresh'));
            }
        });
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
            if (e.target === categoryContainer) {
                e.preventDefault();
                e.stopPropagation();
                const moveState = this.stateManager.getMoveState();
                if (!moveState.isMoving || !moveState.movingButton) return;
                void this.moveManager.updateButtonPosition(
                    moveState.movingButton,
                    category.id,
                    category.buttons.length
                );
                this.moveManager.endMoveMode();
                // 触发视图刷新
                document.dispatchEvent(new CustomEvent('buttons-panel-refresh'));
            }
        });
    }
}
