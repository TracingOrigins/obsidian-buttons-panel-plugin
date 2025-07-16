import { IButtonAction } from './IButtonAction';
import { ButtonActionFactory } from './ButtonActionFactory';
import { Setting, ButtonComponent } from 'obsidian';
import { t } from '@/utils/i18n';

/**
 * 动作序列类，负责管理一组按钮动作的增删改查、渲染、验证和序列化。
 * 用于“添加按钮/编辑按钮”表单中，支持多动作配置、顺序调整、表单校验等。
 */
export class ActionSequence {
    actions: IButtonAction[] = [];
    private container: HTMLElement | null = null;
    private context: any = null;

    /**
     * 构造函数，将原始动作数据转为动作实例。
     * @param rawActions 原始动作配置数组
     */
    constructor(rawActions: any[]) {
        this.actions = rawActions.map(ButtonActionFactory.fromRaw);
    }

    /**
     * 添加一个动作到序列，并自动渲染。
     * @param action 新增的动作实例
     */
    addAction(action: IButtonAction) {
        this.actions.push(action);
        // 如果容器已存在，只渲染新添加的动作
        if (this.container && this.context) {
            // 找到动作列表容器（排除标题和按钮）
            const actionsContainer =
                (this.container.querySelector('.actions-list-container') as HTMLElement) ||
                this.container;
            this.renderActionItem(actionsContainer, action, this.actions.length - 1, this.context);
        }
    }

    /**
     * 移除指定索引的动作，并刷新渲染。
     * @param idx 要移除的动作索引
     */
    removeAction(idx: number) {
        this.actions.splice(idx, 1);
        // 重新渲染以更新索引
        if (this.container && this.context) {
            this.renderAll(this.container, this.context);
        }
    }

    /**
     * 渲染整个动作序列的表单。
     * @param container 容器元素
     * @param context 上下文（如插件实例等）
     */
    renderAll(container: HTMLElement, context: any) {
        // 保存容器和上下文引用
        this.container = container;
        this.context = context;

        // 清空容器
        container.empty();

        // 动作列表标题
        container.createEl('h4', { text: t('actions_list', context.plugin) });

        // 创建动作列表容器
        const actionsContainer = container.createDiv('actions-list-container');

        // 渲染每个动作
        this.actions.forEach((action, index) => {
            this.renderActionItem(actionsContainer, action, index, context);
        });

        // 添加动作按钮
        const addActionCard = container.createDiv('add-action-card');
        new ButtonComponent(addActionCard)
            .setIcon('plus')
            .setTooltip(t('add_action', context.plugin))
            .setClass('add-action-btn')
            .onClick(() => {
                this.addDefaultAction();
            });
    }

    /**
     * 渲染单个动作的表单项，包括类型选择、内容渲染、上下移动、删除等。
     */
    private renderActionItem(
        container: HTMLElement,
        action: IButtonAction,
        index: number,
        context: any
    ) {
        const actionEl = container.createDiv('action-item');

        // 动作类型选择
        new Setting(actionEl)
            .setName(`${t('action', context.plugin)} ${index + 1}`)
            .setDesc(t('action_type_desc', context.plugin))
            .addDropdown((dropdown) => {
                // 从动作实例获取当前类型
                const currentType = action.type;

                // 从 ButtonActionFactory 获取所有可用的动作类型
                const availableTypes = ButtonActionFactory.getAvailableActionTypes();

                // 动态添加所有可用的动作类型选项
                availableTypes.forEach((type) => {
                    dropdown.addOption(type, t(type, context.plugin));
                });

                dropdown.setValue(currentType).onChange((value) => {
                    // 验证动作类型是否有效
                    if (!ButtonActionFactory.isValidActionType(value)) {
                        console.error('Invalid action type:', value);
                        return;
                    }
                    // 创建新的动作实例
                    const newAction = ButtonActionFactory.createAction(value, {});
                    // 替换当前动作
                    this.actions[index] = newAction;
                    // 只重新渲染动作内容部分
                    this.renderActionContent(actionEl, newAction, context);
                });
            });

        // 渲染动作的具体内容
        this.renderActionContent(actionEl, action, context);

        // 底部按钮区：所有按钮放在同一个Setting里
        const footer = actionEl.createDiv('action-footer setting-item');
        const btnSetting = new Setting(footer).setClass('action-btn-setting');
        if (this.actions.length > 1) {
            if (index > 0) {
                btnSetting.addButton((btn) => {
                    btn.setIcon('arrow-up')
                        .setTooltip(t('move_up', context.plugin))
                        .setClass('action-move-btn')
                        .setClass('custom-button')
                        .onClick(() => this.moveAction(index, 'up'));
                });
            }
            if (index < this.actions.length - 1) {
                btnSetting.addButton((btn) => {
                    btn.setIcon('arrow-down')
                        .setTooltip(t('move_down', context.plugin))
                        .setClass('action-move-btn')
                        .setClass('custom-button')
                        .onClick(() => this.moveAction(index, 'down'));
                });
            }
        }
        btnSetting.addButton((btn) => {
            btn.setIcon('trash-2')
                .setTooltip(t('remove_action', context.plugin))
                .setClass('action-delete-btn')
                .setClass('custom-button')
                .onClick(() => this.removeAction(index));
        });
    }

    /**
     * 渲染动作的具体内容表单。
     */
    private renderActionContent(actionEl: HTMLElement, action: IButtonAction, context: any) {
        // 只移除 .action-content，不影响底部按钮区
        const existingContent = actionEl.querySelector('.action-content');
        if (existingContent) {
            existingContent.remove();
        }
        // footer 一定存在，直接插入到 footer 前
        const footer = actionEl.querySelector('.action-footer');
        const actionContentEl = actionEl.createDiv({ cls: 'action-content' });
        actionEl.insertBefore(actionContentEl, footer);
        action.render(actionContentEl, context);
    }

    /**
     * 上下移动动作顺序。
     */
    private moveAction(index: number, direction: 'up' | 'down') {
        if (direction === 'up' && index > 0) {
            [this.actions[index], this.actions[index - 1]] = [
                this.actions[index - 1],
                this.actions[index],
            ];
        } else if (direction === 'down' && index < this.actions.length - 1) {
            [this.actions[index], this.actions[index + 1]] = [
                this.actions[index + 1],
                this.actions[index],
            ];
        }
        // 重新渲染以更新顺序
        if (this.container && this.context) {
            this.renderAll(this.container, this.context);
        }
    }

    /**
     * 添加一个默认“打开文件”动作。
     */
    public addDefaultAction() {
        // 默认添加一个"打开文件"动作
        const defaultAction = ButtonActionFactory.createAction('file', { filePath: '' });
        this.addAction(defaultAction);
    }

    /**
     * 校验所有动作表单。
     */
    validateAll() {
        return this.actions.every((action) => action.validate());
    }

    /**
     * 批量设置所有动作的错误提示。
     */
    setAllErrors(message: string): void {
        this.actions.forEach((action) => {
            action.setError?.(message);
        });
    }

    /**
     * 批量清除所有动作的错误提示。
     */
    clearAllErrors(): void {
        this.actions.forEach((action) => {
            action.clearError?.();
        });
    }

    /**
     * 序列化为 JSON 数据，便于保存到设置。
     */
    toJSON() {
        return this.actions.map((a) => a.toJSON());
    }
}
