import { Modal, Notice, Setting } from 'obsidian';
import { ButtonConfig, CategoryConfig } from '@/common/types';
import { t } from '@/common/utils/i18n';
import { ActionSequence } from '@/common/actions/ActionSequence';
import { NameInput, IconInput } from '@/common/components';

/**
 * ButtonCreateModal 按钮创建模态框类。
 * 用于在指定分类下创建新按钮，支持基本信息填写、动作配置、保存校验等。
 */
export class ButtonCreateModal extends Modal {
    // 插件主类实例
    plugin: any;
    // 按钮所属分类
    parentCategory: CategoryConfig;
    // 保存成功回调
    onSave?: () => void;
    // 临时按钮对象
    tempButton: ButtonConfig;
    // 动作序列对象
    actionSequence: ActionSequence;
    // 名称输入组件
    nameInput: NameInput | null = null;
    // 图标输入组件
    iconInput: IconInput | null = null;

    /**
     * 构造函数，初始化模态框和临时按钮对象。
     * @param app Obsidian应用实例
     * @param plugin 插件主类实例
     * @param parentCategory 按钮所属分类
     * @param onSave 保存成功回调
     */
    constructor(app: any, plugin: any, parentCategory: CategoryConfig, onSave?: () => void) {
        super(app);
        this.plugin = plugin;
        this.parentCategory = parentCategory;
        this.onSave = onSave;
        this.tempButton = {
            id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
            name: '',
            icon: '',
            actions: [],
            order: 0,
            executionMode: 'sequential',
            stopOnError: true,
            delayBetweenActions: 0,
        };
        this.actionSequence = new ActionSequence(this.tempButton.actions);
        // 新建时如果没有动作，自动添加一个默认动作
        if (this.tempButton.actions.length === 0) {
            this.actionSequence.addDefaultAction();
        }
    }

    /**
     * 打开模态框时自动调用，渲染表单界面。
     */
    onOpen(): void {
        const { contentEl } = this;
        contentEl.empty();
        contentEl.addClass('buttons-panel-plugin');
        contentEl.addClass('button-edit-modal');
        contentEl.createEl('h2', { text: t('add_button') });
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
            stopSetting.setDesc(t('only_sequential_effective'));
        }
        // 动作间延迟
        const delaySetting = new Setting(basicActionSettings)
            .setName(t('delay_between_actions'))
            .setDesc(t('delay_between_actions_desc'))
            .addText((text) => {
                text.inputEl.type = 'number';
                text.setValue(String(this.tempButton.delayBetweenActions ?? 0));
                text.onChange((value) => {
                    this.tempButton.delayBetweenActions = Number(value) || 0;
                });
                if (isParallel) text.setDisabled(true);
            });
        if (isParallel) {
            delaySetting.settingEl.addClass('is-disabled');
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

        // 保存按钮
        this.tempButton.actions = this.actionSequence.toJSON();
        this.tempButton.order = this.parentCategory.buttons.length;
        this.parentCategory.buttons.push({ ...this.tempButton });
        await this.plugin.saveSettings();
        new Notice(t('button_create_success'));
        this.close();
        this.onSave?.();
    }
}
