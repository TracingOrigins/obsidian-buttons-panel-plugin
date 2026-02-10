// ButtonRenderer.ts
// 按钮渲染器，负责渲染单个按钮及其事件绑定、右键菜单等。
import type { MenuItem } from 'obsidian';
import { Menu, App } from 'obsidian';
import { ActionDispatcher } from '@/core/ActionDispatcher';
import { ButtonConfig, PanelConfig } from '@/common/types';
import { t } from '@/common/utils/i18n';
import { ButtonEditModal } from '@/common/modals/ButtonEditModal';
import { ButtonDeleteModal } from '@/common/modals/ButtonDeleteModal';
import { ButtonsPanelPlugin } from '@/common/types/plugin';
import { safeSetSVG } from '@/common/utils/dom';

/**
 * ButtonRenderer 按钮渲染器。
 * 负责渲染单个按钮、绑定事件、右键菜单、样式等。
 * 遵循单一职责原则，只负责按钮渲染。
 */
export class ButtonRenderer {
    private plugin: ButtonsPanelPlugin;
    private actionDispatcher: ActionDispatcher;
    private app: App;

    /**
     * 构造函数，初始化渲染器依赖。
     * @param plugin 插件主类实例
     * @param app Obsidian应用实例
     */
    constructor(plugin: ButtonsPanelPlugin, app: App) {
        this.plugin = plugin;
        this.app = app;
        this.actionDispatcher = new ActionDispatcher(app, this.plugin);
    }

    /**
     * 渲染单个按钮。
     * @param container 按钮容器
     * @param button 按钮配置
     * @param panelConfig 面板配置
     * @param onMoveStart 移动模式回调
     * @param isInMoveMode 是否处于移动模式
     * @param moveManager 移动管理器
     * @returns 按钮DOM元素
     */
    renderButton(
        container: HTMLElement,
        button: ButtonConfig,
        panelConfig: PanelConfig,
        onMoveStart?: (button: ButtonConfig, buttonEl: HTMLElement) => void,
        isInMoveMode = false,
        moveManager?: { stateManager?: { getMoveState?: () => { movingButton?: ButtonConfig | null } }; handleMoveClick?: (e: Event) => void }
    ): HTMLElement {
        // 创建按钮元素
        const buttonEl = container.createEl('button');

        // 设置样式类
        this.applyButtonStyles(buttonEl, panelConfig);

        // 设置按钮ID
        buttonEl.setAttribute('data-button-id', button.id);

        // 渲染图标
        this.renderButtonIcon(buttonEl, button);

        // 渲染文字
        this.renderButtonText(buttonEl, button);

        // 分类移动模式下所有按钮都可点击，并加 move-button-target
        if (isInMoveMode) {
            const moveState = moveManager?.stateManager?.getMoveState?.();
            const movingButtonId = moveState?.movingButton?.id;
            buttonEl.classList.add('move-button-target');
            if (button.id === movingButtonId) {
                buttonEl.classList.add('moving');
            }
            buttonEl.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (moveManager && typeof moveManager.handleMoveClick === 'function') {
                    moveManager.handleMoveClick(e);
                }
            });
            return buttonEl;
        }

        // 绑定事件
        this.bindButtonEvents(buttonEl, button, onMoveStart);

        return buttonEl;
    }

    /**
     * 应用按钮样式。
     * @param buttonEl 按钮DOM元素
     * @param panelConfig 面板配置
     */
    private applyButtonStyles(buttonEl: HTMLElement, panelConfig: PanelConfig): void {
        // 根据面板的全局设置来决定显示样式
        if (panelConfig.displayStyle === 'icon_top') {
            buttonEl.addClass('icon-top');
        } else {
            buttonEl.addClass('icon-left');
        }

        // 根据设置决定是否添加动画
        if (panelConfig.enableAnimation) {
            buttonEl.addClass('with-animation');
        }
    }

    /**
     * 渲染按钮图标。
     * @param buttonEl 按钮DOM元素
     * @param button 按钮配置
     */
    private renderButtonIcon(buttonEl: HTMLElement, button: ButtonConfig): void {
        if (!button.icon) return;

        const iconEl = buttonEl.createEl('span', { cls: 'button-icon' });

        // 检查是否为SVG代码
        if (button.icon.trim().startsWith('<svg')) {
            safeSetSVG(iconEl, button.icon);
        } else {
            // 普通文本图标
            iconEl.textContent = button.icon;
        }
    }

    /**
     * 渲染按钮文字。
     * @param buttonEl 按钮DOM元素
     * @param button 按钮配置
     */
    private renderButtonText(buttonEl: HTMLElement, button: ButtonConfig): void {
        buttonEl.createEl('span', {
            text: button.name,
            cls: 'button-text',
        });
    }

    /**
     * 绑定按钮事件。
     * @param buttonEl 按钮DOM元素
     * @param button 按钮配置
     * @param onMoveStart 移动模式回调
     */
    private bindButtonEvents(
        buttonEl: HTMLElement,
        button: ButtonConfig,
        onMoveStart?: (button: ButtonConfig, buttonEl: HTMLElement) => void
    ): void {
        // 点击事件
        buttonEl.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            if ((buttonEl as HTMLButtonElement).disabled) return;

            (buttonEl as HTMLButtonElement).disabled = true;
            try {
                await this.actionDispatcher.executeActions(
                    button.actions,
                    button.executionMode || 'sequential',
                    button.stopOnError ?? true,
                    button.delayBetweenActions ?? 100
                );
            } finally {
                (buttonEl as HTMLButtonElement).disabled = false;
            }
        });

        // 右键菜单
        if (this.plugin.settings.panelConfig?.enableEditMode) {
            buttonEl.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.showButtonContextMenu(e, button, onMoveStart);
            });
        }
    }

    /**
     * 显示按钮右键菜单。
     * @param e 鼠标事件
     * @param button 按钮配置
     * @param onMoveStart 移动模式回调
     */
    private showButtonContextMenu(
        e: MouseEvent,
        button: ButtonConfig,
        onMoveStart?: (button: ButtonConfig, buttonEl: HTMLElement) => void
    ): void {
        const menu = new Menu();

        // 移动选项
        menu.addItem((item: MenuItem) => {
            item.setTitle(t('move'))
                .setIcon('move')
                .onClick(() => {
                    if (onMoveStart) {
                        onMoveStart(button, e.target as HTMLElement);
                    }
                });
        });

        // 编辑选项
        menu.addItem((item: MenuItem) => {
            item.setTitle(t('edit'))
                .setIcon('pencil')
                .onClick(() => {
                    const category = this.plugin.settings.categories.find((cat) =>
                        cat.buttons.some((b) => b.id === button.id)
                    );
                    if (category) {
                        new ButtonEditModal(this.app, this.plugin, button, category, async () => {
                            await this.plugin.saveSettings();
                        }).open();
                    }
                });
        });

        // 复制选项
        menu.addItem((item: MenuItem) => {
            item.setTitle(t('copy') || '复制')
                .setIcon('copy')
                .onClick(async () => {
                    const category = this.plugin.settings.categories.find((cat) =>
                        cat.buttons.some((b) => b.id === button.id)
                    );
                    if (category) {
                        const newButton = {
                            ...JSON.parse(JSON.stringify(button)),
                            id: Date.now().toString(),
                            order: category.buttons.length,
                        };
                        category.buttons.push(newButton);
                        // 统一排序order
                        category.buttons.forEach((btn, idx) => {
                            btn.order = idx;
                        });
                        await this.plugin.saveSettings();
                    }
                });
        });

        // 删除选项
        menu.addItem((item: MenuItem) => {
            item.setTitle(t('delete') || '删除')
                .setIcon('trash')
                .onClick(() => {
                    const category = this.plugin.settings.categories.find((cat) =>
                        cat.buttons.some((b) => b.id === button.id)
                    );
                    if (category) {
                        new ButtonDeleteModal(this.app, this.plugin, button, category, async () => {
                            const idx = category.buttons.findIndex((b) => b.id === button.id);
                            if (idx > -1) category.buttons.splice(idx, 1);
                            await this.plugin.saveSettings();
                        }).open();
                    }
                });
        });

        menu.showAtPosition({ x: e.clientX, y: e.clientY });
    }

    /**
     * 高亮移动中的按钮。
     * @param buttonEl 按钮DOM元素
     * @param isMoving 是否高亮
     */
    highlightMovingButton(buttonEl: HTMLElement, isMoving: boolean): void {
        if (isMoving) {
            buttonEl.classList.add('moving');
        } else {
            buttonEl.classList.remove('moving');
        }
    }
}
