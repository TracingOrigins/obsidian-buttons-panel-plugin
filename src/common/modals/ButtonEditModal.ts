import { Modal, Setting, Notice } from 'obsidian';
import { ButtonConfig, CategoryConfig } from '@/common/types';
import { t } from '@/common/utils/i18n';
import { ActionSequence } from '@/common/actions/ActionSequence';
import { NameInput, IconInput } from '@/common/components';

/**
 * ButtonEditModal 按钮编辑模态框类。
 * 用于编辑指定按钮的基本信息和动作配置，支持保存校验、同步更新等。
 */
export class ButtonEditModal extends Modal {
    // 插件主类实例
    plugin: any;
    // 待编辑的按钮对象
    button: ButtonConfig;
    // 按钮所属分类
    parentCategory: CategoryConfig;
    // 保存成功回调
    onSave?: () => void;
    // 临时按钮对象，用于保存修改前的值
    tempButton: ButtonConfig;
    // 动作序列对象，用于管理动作的添加、删除、验证等
    actionSequence: ActionSequence;
    // 名称输入组件实例
    nameInput: NameInput | null = null;
    // 图标输入组件实例
    iconInput: IconInput | null = null;

    /**
     * 构造函数，初始化模态框和临时按钮对象。
     * @param app Obsidian应用实例
     * @param plugin 插件主类实例
     * @param button 待编辑的按钮对象
     * @param parentCategory 按钮所属分类
     * @param onSave 保存成功回调
     */
    constructor(
        app: any,
        plugin: any,
        button: ButtonConfig,
        parentCategory: CategoryConfig,
        onSave?: () => void
    ) {
        super(app);
        this.plugin = plugin;
        this.button = button;
        this.parentCategory = parentCategory;
        this.onSave = onSave;
        // 深拷贝按钮对象，避免直接修改原始数据
        this.tempButton = JSON.parse(JSON.stringify(button));
        // 过滤掉无效的 action
        const validActions = Array.isArray(this.tempButton.actions)
            ? this.tempButton.actions.filter((a) => a && typeof a === 'object' && a.type)
            : [];
        this.actionSequence = new ActionSequence(validActions);
    }

    /**
     * 打开模态框时自动调用，渲染表单界面。
     */
    onOpen(): void {
        const { contentEl } = this;
        contentEl.empty();
        contentEl.addClass('buttons-panel-plugin');
        contentEl.addClass('button-edit-modal');
        contentEl.createEl('h2', { text: t('edit_button') });
        const formContainer = contentEl.createDiv('form-container');
        // 拆分为两个独立容器
        const basicInfoContainer = formContainer.createDiv('basic-info-container');
        const actionSettingsContainer = formContainer.createDiv('action-settings-container');
        this.createBasicSettings(basicInfoContainer);
        this.createActionSettings(actionSettingsContainer);
        this.createActionButtons(contentEl);
    }

    /**
     * 渲染基本信息设置区域。
     * @param container 容器元素
     */
    createBasicSettings(container: HTMLElement): void {
        container.createEl('h3', { text: t('basic_info') });

        // 使用可复用的名称输入组件
        this.nameInput = new NameInput(container, {
            name: t('button_name'),
            description: t('button_name_desc'),
            placeholder: t('button_name_placeholder'),
            value: this.tempButton.name,
            onValueChange: (value: string) => {
                this.tempButton.name = value;
            },
            onEnter: () => {
                // 回车时保存按钮
                this.saveButton();
            },
            onValidationError: (error: string) => {
                console.warn('Name validation error:', error);
            },
        });

        // 使用可复用的图标输入组件
        this.iconInput = new IconInput(
            container,
            {
                name: t('button_icon'),
                description: t('button_icon_desc'),
                placeholder: t('button_icon_placeholder'),
                searchTooltip: t('search_icons_tooltip'),
                uploadTooltip: t('upload_svg_icon_tooltip'),
            },
            { app: this.app, plugin: this.plugin },
            (value: string) => {
                this.tempButton.icon = value;
            }
        );

        // 设置初始值
        this.nameInput.setValue(this.tempButton.name || '');
        this.iconInput.setValue(this.tempButton.icon || '');
    }

    /**
     * 渲染动作设置区域。
     * @param container 容器元素
     */
    createActionSettings(container: HTMLElement): void {
        container.empty();
        container.createEl('h3', { text: t('action_settings') });
        // 新增：基本设置小标题和容器
        const basicActionSettings = container.createDiv('basic-action-settings');
        basicActionSettings.createEl('h4', { text: t('basic_settings') });
        // 执行模式
        new Setting(basicActionSettings)
            .setName(t('execution_mode'))
            .setDesc(t('execution_mode_desc'))
            .addDropdown((drop) => {
                drop.addOption('sequential', t('sequential'));
                drop.addOption('parallel', t('parallel'));
                drop.setValue(this.tempButton.executionMode || 'sequential');
                drop.onChange((value) => {
                    this.tempButton.executionMode = value as any;
                    // 触发UI刷新以禁用/启用相关选项
                    container.empty();
                    this.createActionSettings(container);
                });
            });
        const isParallel = this.tempButton.executionMode === 'parallel';
        // 错误时是否中断
        const stopSetting = new Setting(basicActionSettings)
            .setName(t('stop_on_error'))
            .setDesc(t('stop_on_error_desc'))
            .addToggle((toggle) => {
                toggle.setValue(this.tempButton.stopOnError ?? true);
                toggle.onChange((value) => {
                    this.tempButton.stopOnError = value;
                });
                if (isParallel) toggle.setDisabled(true);
            });
        if (isParallel) {
            stopSetting.settingEl.addClass('is-disabled');
            stopSetting.settingEl.addClass('is-hidden');
            stopSetting.setDesc(t('only_sequential_effective'));
        }
        // 动作间延迟
        const delaySetting = new Setting(basicActionSettings)
            .setName(t('delay_between_actions'))
            .setDesc(t('delay_between_actions_desc'))
            .addText((text) => {
                text.inputEl.type = 'number';
                text.setValue(String(this.tempButton.delayBetweenActions ?? 100));
                text.onChange((value) => {
                    this.tempButton.delayBetweenActions = Number(value) || 100;
                });
                if (isParallel) text.setDisabled(true);
            });
        if (isParallel) {
            delaySetting.settingEl.addClass('is-disabled');
            delaySetting.settingEl.addClass('is-hidden');
            delaySetting.setDesc(t('only_sequential_effective'));
        }
        const actionValueContainer = container.createDiv({ cls: 'action-list' });
        // 用面向对象的 ActionSequence 渲染所有动作
        this.actionSequence.renderAll(actionValueContainer, { app: this.app, plugin: this.plugin });
    }

    /**
     * 创建保存和取消按钮。
     * @param container 容器元素
     */
    private createActionButtons(container: HTMLElement): void {
        new Setting(container)
            .addButton((btn) => {
                btn.setButtonText(t('save'))
                    .setCta()
                    .setClass('custom-save-button')
                    .onClick(() => this.saveButton());
            })
            .addButton((btn) => {
                btn.setButtonText(t('cancel'))
                    .setClass('custom-cancel-button')
                    .onClick(() => this.close());
            });
    }

    /** 获取当前临时按钮对象 */
    getCurrentButton(): ButtonConfig {
        return this.tempButton;
    }

    /**
     * 校验并保存按钮，保存成功后关闭模态框。
     */
    async saveButton(): Promise<void> {
        let hasError = false;

        // 验证名称输入
        if (!this.nameInput?.getValue()?.trim()) {
            this.nameInput?.setError(t('please_complete_required_fields'));
            hasError = true;
        } else {
            this.nameInput?.clearError();
        }

        // 验证动作序列
        if (!this.actionSequence.validateAll()) {
            this.actionSequence.setAllErrors(t('please_complete_required_fields'));
            hasError = true;
        } else {
            this.actionSequence.clearAllErrors();
        }

        // 如果有错误，显示通知并返回
        if (hasError) {
            new Notice(t('please_complete_required_fields'));
            return;
        }

        // 更新临时按钮的动作
        this.tempButton.actions = this.actionSequence.toJSON();

        // 更新原始按钮
        Object.assign(this.button, this.tempButton);

        // 更新分类中的按钮
        const index = this.parentCategory.buttons.findIndex(
            (b: ButtonConfig) => b.id === this.button.id
        );
        if (index > -1) {
            this.parentCategory.buttons[index] = this.button;
        }

        await this.plugin.saveSettings();
        new Notice(t('button_update_success'));
        this.close();
        this.onSave?.();
    }
}
