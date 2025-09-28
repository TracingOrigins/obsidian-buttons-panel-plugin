// ButtonMoveManager.ts
// 按钮移动管理器，负责处理按钮的移动逻辑。
import { ButtonsPanelPlugin } from '@/common/types/plugin';
import { ButtonConfig } from '@/common/types';
import { ViewStateManager } from '@/views/managers/ViewStateManager';
import { safeSetSVG } from '@/common/utils/dom';
import { refreshAllSettingsViews } from '@/common/utils/obsidian';

/**
 * ButtonMoveManager 按钮移动管理器。
 * 负责处理按钮的移动、拖拽、指示器、事件监听等逻辑。
 * 遵循单一职责原则，只负责按钮移动功能。
 */
export class ButtonMoveManager {
    private plugin: ButtonsPanelPlugin;
    private stateManager: ViewStateManager;
    /** 移动事件是否已注册 */
    private moveEventsRegistered: boolean = false;

    /**
     * 构造函数，初始化插件和状态管理器。
     * @param plugin 插件主类实例
     * @param stateManager 视图状态管理器
     */
    constructor(plugin: ButtonsPanelPlugin, stateManager: ViewStateManager) {
        this.plugin = plugin;
        this.stateManager = stateManager;
    }

    /**
     * 开始按钮移动模式，创建指示器并添加事件监听。
     * @param button 当前移动的按钮对象
     * @param buttonEl 按钮对应的DOM元素
     * @param panelConfig 面板配置
     */
    startMoveMode(button: ButtonConfig, buttonEl: HTMLElement, panelConfig: any): void {
        const moveState = this.stateManager.getMoveState();
        moveState.isMoving = true;
        moveState.movingButton = button;
        moveState.movingElement = buttonEl;

        // 创建简化的移动指示器
        const indicator = this.createMoveIndicator(button, panelConfig);
        moveState.moveIndicator = indicator;

        this.stateManager.setMoveState(moveState);

        // 添加事件监听器
        this.addMoveEventListeners();
    }

    /**
     * 结束按钮移动模式，移除指示器和事件监听，重置状态。
     */
    endMoveMode(): void {
        const moveState = this.stateManager.getMoveState();

        // 移除移动指示器
        if (moveState.moveIndicator) {
            moveState.moveIndicator.remove();
            moveState.moveIndicator = null;
        }

        // 移除事件监听器
        this.removeMoveEventListeners();

        // 重置状态
        this.stateManager.resetMoveState();
    }

    /**
     * 创建移动指示器DOM元素。
     * @param button 按钮对象
     * @param panelConfig 面板配置
     * @returns 指示器DOM元素
     */
    private createMoveIndicator(button: ButtonConfig, panelConfig: any): HTMLElement {
        const indicator = document.createElement('button');
        indicator.className = 'buttons-panel-plugin button-move-indicator';
        indicator.setAttribute('data-button-id', button.id);

        // 根据面板的全局设置来决定显示样式
        if (panelConfig.displayStyle === 'icon_top') {
            indicator.addClass('icon-top');
        } else {
            indicator.addClass('icon-left');
        }

        // 添加图标
        if (button.icon) {
            const iconEl = indicator.createEl('span', { cls: 'button-icon' });
            if (button.icon.trim().startsWith('<svg')) {
                safeSetSVG(iconEl, button.icon);
            } else {
                iconEl.textContent = button.icon;
            }
        }

        // 添加按钮文字
        const textEl = indicator.createEl('span', {
            text: button.name,
            cls: 'button-text',
        });

        document.body.appendChild(indicator);
        return indicator;
    }

    /**
     * 添加全局移动事件监听器，使用插件的事件注册系统。
     */
    private addMoveEventListeners(): void {
        if (!this.moveEventsRegistered) {
            // 使用插件的事件注册系统，确保在插件禁用时正确清理
            this.plugin.registerEvent({
                unload: () => {
                    document.removeEventListener('mousemove', this.handleMoveMouseMove);
                    document.removeEventListener('keydown', this.handleMoveKeyDown);
                }
            });
            document.addEventListener('mousemove', this.handleMoveMouseMove);
            document.addEventListener('keydown', this.handleMoveKeyDown);
            this.moveEventsRegistered = true;
        }
    }

    /**
     * 移除全局移动事件监听器。
     */
    private removeMoveEventListeners(): void {
        if (this.moveEventsRegistered) {
            document.removeEventListener('mousemove', this.handleMoveMouseMove);
            document.removeEventListener('keydown', this.handleMoveKeyDown);
            this.moveEventsRegistered = false;
        }
    }

    /**
     * 鼠标移动时更新指示器位置。
     */
    private handleMoveMouseMove = (e: MouseEvent): void => {
        const moveState = this.stateManager.getMoveState();
        if (!moveState.moveIndicator) return;

        moveState.moveIndicator.style.left = e.clientX + 10 + 'px';
        moveState.moveIndicator.style.top = e.clientY + 10 + 'px';
    };

    /**
     * 键盘事件处理（如ESC退出移动模式）。
     */
    private handleMoveKeyDown = (e: KeyboardEvent): void => {
        if (e.key === 'Escape') {
            this.endMoveMode();
        }
    };

    /**
     * 更新按钮在分类中的位置，参考设置页拖动逻辑，保证顺序和order正确。
     * @param button 按钮对象
     * @param targetCategoryId 目标分类ID
     * @param targetIndex 目标插入索引
     */
    async updateButtonPosition(
        button: ButtonConfig,
        targetCategoryId: string,
        targetIndex: number
    ): Promise<void> {
        try {
            const categories = this.plugin.settings.categories;
            const sourceCategory = categories.find((cat) =>
                cat.buttons.some((b) => b.id === button.id)
            );
            const targetCategory = categories.find((cat) => cat.id === targetCategoryId);

            if (!sourceCategory || !targetCategory) {
                console.warn('找不到源分类或目标分类');
                return;
            }

            // 1. 从源分类中移除按钮
            const sourceIndex = sourceCategory.buttons.findIndex((b) => b.id === button.id);
            if (sourceIndex === -1) return;
            const [buttonToMove] = sourceCategory.buttons.splice(sourceIndex, 1);

            // 2. 插入到目标分类指定位置
            if (targetIndex < 0 || targetIndex > targetCategory.buttons.length) {
                targetCategory.buttons.push(buttonToMove);
            } else {
                targetCategory.buttons.splice(targetIndex, 0, buttonToMove);
            }

            // 3. 重新排序两个分类的order
            [sourceCategory, targetCategory].forEach((category) => {
                category.buttons.forEach((btn, idx) => {
                    btn.order = idx;
                });
            });

            await this.plugin.saveSettings();
            refreshAllSettingsViews(this.plugin.app);
        } catch (error) {
            console.error('更新按钮位置时出错:', error);
        }
    }

    /**
     * 处理移动到空分类的逻辑。
     * @param categoryId 目标分类ID
     */
    handleMoveToEmptyCategory(categoryId: string): void {
        const moveState = this.stateManager.getMoveState();
        if (!moveState.movingButton) return;

        this.updateButtonPosition(moveState.movingButton, categoryId, 0);
        this.endMoveMode();
    }

    /**
     * 处理按钮移动点击事件。
     * @param e 事件对象
     */
    handleMoveClick = (e: Event): void => {
        const target = e.target as HTMLElement;
        const buttonEl = target.closest('button[data-button-id]') as HTMLElement;

        if (!buttonEl) return;

        const moveState = this.stateManager.getMoveState();
        if (!moveState.movingButton) return;

        const targetButtonId = buttonEl.getAttribute('data-button-id');
        if (targetButtonId === moveState.movingButton.id) {
            // 点击自身，直接退出移动模式，不做任何更改
            this.endMoveMode();
            return;
        }

        const targetCategoryId = this.getButtonCategoryId(buttonEl);
        const targetIndex = this.getButtonIndex(buttonEl);

        if (targetCategoryId && targetIndex !== -1) {
            this.updateButtonPosition(moveState.movingButton, targetCategoryId, targetIndex);
        }

        this.endMoveMode();
    };

    /**
     * 获取按钮在容器中的索引。
     * @param buttonEl 按钮DOM元素
     * @returns 索引
     */
    private getButtonIndex(buttonEl: HTMLElement): number {
        const container = buttonEl.parentElement;
        if (!container) return -1;
        const buttons = Array.from(container.children).filter((el) => el.tagName === 'BUTTON');
        return buttons.indexOf(buttonEl);
    }

    /**
     * 获取按钮所属的分类ID。
     * @param buttonEl 按钮DOM元素
     * @returns 分类ID
     */
    private getButtonCategoryId(buttonEl: HTMLElement): string {
        const categoryContainer = buttonEl.closest('.buttons-panel-category');
        if (categoryContainer) {
            const categoryTitle = categoryContainer.querySelector('.buttons-panel-category-title');
            if (categoryTitle) {
                const categoryName = categoryTitle.textContent;
                const category = this.plugin.settings.categories.find(
                    (cat) => cat.name === categoryName
                );
                return category?.id || '';
            }
        }
        return '';
    }
}
