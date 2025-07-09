import { App, Modal, Setting, Notice } from 'obsidian';
import { ButtonsPanelPlugin } from '../../../types/plugin';
import { ButtonConfig, CategoryConfig } from '../../../types';
import type { ButtonAction } from '../../../types';
import { t } from '../../../utils/i18n';
import { validateButtonForm, showValidationErrors } from '../../../utils/validation';
import { createOpenFileSection } from './OpenFileSection';
import { createExcuteCommandSection } from './ExcuteCommandSection';
import { createRunScriptSection } from './RunScriptSection';
import { createOpenUrlSection } from './OpenUrlSection';
import { createCreateFileSection } from './CreateFileSection';
import { createIconSection } from './IconSection';
import { createNameSection } from './NameSection';

/**
 * 按钮编辑模态框类，用于创建和编辑按钮。
 * 支持按钮的基本信息、动作类型、动作参数等多种配置。
 */
export class ButtonEditModal extends Modal {
	/** 插件主类实例 */
	plugin: ButtonsPanelPlugin;
	/** 当前编辑的按钮对象，null表示新建 */
	button: ButtonConfig | null;
	/** 临时编辑状态，用于存储用户输入但未保存的修改 */
	private tempButton: ButtonConfig | null = null;
	/** 是否为新建按钮 */
	isNew: boolean;
	/** 动作参数输入区域的容器 */
	private actionValueContainer: HTMLElement;
	/** 按钮名称输入框元素 */
	private nameInputEl: HTMLInputElement | null = null;
	/** 动作参数输入框元素 */
	private actionValueInputEl: HTMLInputElement | null = null;
	/** 文件夹输入框元素（仅创建文件时用） */
	private folderInputEl: HTMLInputElement | null = null;
	/** 文件名输入框元素（仅创建文件时用） */
	private fileNameInputEl: HTMLInputElement | null = null;
	/** 按钮所属的分类对象 */
	private parentCategory?: CategoryConfig;
	/** 保存成功后的回调函数 */
	private onSave?: () => void;

	/**
	 * 构造函数，初始化模态框。
	 * @param app Obsidian应用实例
	 * @param plugin 插件主类实例
	 * @param button 当前编辑的按钮对象，null表示新建
	 * @param parentCategory 按钮所属分类
	 * @param onSave 保存成功后的回调
	 */
	constructor(app: App, plugin: ButtonsPanelPlugin, button: ButtonConfig | null, parentCategory?: CategoryConfig, onSave?: () => void) {
		super(app);
		this.plugin = plugin;
		this.button = button;
		// 创建临时编辑状态，深拷贝原始按钮数据
		this.tempButton = button ? JSON.parse(JSON.stringify(button)) : null;
		this.isNew = !button;
		this.parentCategory = parentCategory;
		this.onSave = onSave;
	}

	/**
	 * 打开模态框时自动调用，渲染编辑界面。
	 */
	onOpen(): void {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.addClass('buttons-panel-plugin');
		contentEl.addClass('button-edit-modal');

		// 创建模态框标题
		const title = contentEl.createEl('h2', { 
			text: this.isNew ? t('add_button', this.plugin) : t('edit', this.plugin) 
		});

		// 创建表单容器
		const formContainer = contentEl.createDiv('form-container');

		// 基本信息设置区域
		this.createBasicSettings(formContainer);

		// 动作设置区域
		this.createActionSettings(formContainer);

		// 底部保存和取消按钮
		this.createActionButtons(contentEl);
	}

	/**
	 * 关闭模态框时自动调用，清理内容。
	 */
	onClose(): void {
		const { contentEl } = this;
		contentEl.empty();
	}

	/**
	 * 渲染按钮的基本信息设置（名称、图标等）。
	 * @param container 父容器
	 */
	private createBasicSettings(container: HTMLElement): void {
		container.createEl('h3', { text: t('basic_info', this.plugin) });

		// 名称输入区（调用子组件）
		createNameSection(container, this);

		// 图标输入区（调用子组件）
		createIconSection(container, this);
	}

	/**
	 * 渲染按钮的动作类型及参数设置。
	 * @param container 父容器
	 */
	private createActionSettings(container: HTMLElement): void {
		container.createEl('h3', { text: t('action_settings', this.plugin) });

		// 动作类型下拉选择
		new Setting(container)
			.setName(t('action_type', this.plugin))
			.setDesc(t('action_type_desc', this.plugin))
			.addDropdown(dropdown => {
				dropdown
					.addOption('file', t('file', this.plugin))
					.addOption('command', t('command', this.plugin))
					.addOption('url', t('url', this.plugin))
					.addOption('create_file', t('create_file', this.plugin))
					.addOption('script', t('script', this.plugin))
					.setValue(this.getCurrentButton()?.action.type || 'file')
					.onChange((value) => {
						const currentButton = this.getCurrentButton();
						currentButton.action = { type: value as ButtonAction['type'], value: '' };
						this.updateActionValueInput();
					});
			});

		// 创建动作参数输入区域，带class
		this.actionValueContainer = container.createDiv({ cls: 'action-value-container' });
		this.updateActionValueInput();
	}

	/**
	 * 根据当前动作类型，动态渲染参数输入区域。
	 */
	private updateActionValueInput(): void {
		// 先清空容器
		this.actionValueContainer.empty();
		// 再渲染对应类型的输入
		this.createActionValueInput(this.actionValueContainer);
	}

	/**
	 * 根据动作类型，渲染不同的参数输入控件。
	 * @param container 父容器
	 */
	private createActionValueInput(container: HTMLElement): void {
		const actionType = this.getCurrentButton()?.action.type || 'file';
		switch (actionType) {
			case 'file':
				createOpenFileSection(container, this);
				break;
			case 'command':
				createExcuteCommandSection(container, this);
				break;
			case 'url':
				createOpenUrlSection(container, this);
				break;
			case 'create_file':
				createCreateFileSection(container, this);
				break;
			case 'script':
				createRunScriptSection(container, this);
				break;
		}
	}

	/**
	 * 创建一个默认的按钮对象。
	 * @returns 新的按钮配置对象
	 */
	private createDefaultButton(): ButtonConfig {
		return {
			id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
			name: '',
			action: {
				type: 'file',
				value: ''
			},
			order: 0
		};
	}

	/**
	 * 获取当前编辑的按钮对象（优先使用临时状态）
	 * @returns 当前编辑的按钮对象
	 */
	private getCurrentButton(): ButtonConfig {
		if (!this.tempButton) {
			this.tempButton = this.createDefaultButton();
		}
		return this.tempButton;
	}

	/**
	 * 校验并保存按钮，保存到分类并持久化。
	 */
	private async saveButton(): Promise<void> {
		// 获取当前编辑的按钮对象
		const currentButton = this.getCurrentButton();
		
		// 保证action对象一定存在
		if (!currentButton.action) {
			currentButton.action = { type: 'file', value: '' };
		}

		// 获取输入框元素
		this.ensureInputElements();

		// 使用校验工具函数进行表单校验
		const validationResult = validateButtonForm({
			button: currentButton,
			plugin: this.plugin,
			nameInputEl: this.nameInputEl,
			actionValueInputEl: this.actionValueInputEl,
			folderInputEl: this.folderInputEl,
			fileNameInputEl: this.fileNameInputEl
		});

		// 如果有校验错误，显示错误信息并返回
		if (validationResult.hasError) {
			showValidationErrors(validationResult);
			return;
		}

		console.log('[ButtonEditModal] 校验通过，准备保存');
		
		// 将临时编辑状态应用到原始按钮对象
		if (this.isNew) {
			// 新建按钮：使用临时状态创建新按钮
			const newButton = JSON.parse(JSON.stringify(currentButton));
			newButton.order = this.parentCategory!.buttons.length;
			this.parentCategory!.buttons.push(newButton);
		} else {
			// 编辑现有按钮：将临时状态应用到原始按钮
			Object.assign(this.button!, currentButton);
			
			// 更新分类中的按钮
			const index = this.parentCategory!.buttons.findIndex((b: ButtonConfig) => b.id === this.button!.id);
			if (index > -1) {
				this.parentCategory!.buttons[index] = this.button!;
			} else {
				// 如果按钮不在当前分类中，添加到当前分类
				this.button!.order = this.parentCategory!.buttons.length;
				this.parentCategory!.buttons.push(this.button!);
			}
		}

		await this.plugin.saveSettings();
		new Notice(this.isNew ? t('button_create_success', this.plugin) : t('button_update_success', this.plugin));
		this.close();
		this.onSave?.();
	}

	/**
	 * 确保所有输入框元素都已获取
	 */
	private ensureInputElements(): void {
		const contentEl = this.contentEl;
		
		if (!this.nameInputEl) {
			this.nameInputEl = contentEl.querySelector('input[placeholder="' + t('name_placeholder', this.plugin) + '"]') as HTMLInputElement;
		}
		if (!this.actionValueInputEl) {
			this.actionValueInputEl = contentEl.querySelector('input[placeholder="' + t('file_path_placeholder', this.plugin) + '"]') as HTMLInputElement
				|| contentEl.querySelector('input[placeholder="' + t('command_id_placeholder', this.plugin) + '"]') as HTMLInputElement
				|| contentEl.querySelector('input[placeholder="https://example.com"]') as HTMLInputElement
				|| contentEl.querySelector('input[placeholder="' + t('script_file_placeholder', this.plugin) + '"]') as HTMLInputElement;
		}
		if (!this.folderInputEl) {
			this.folderInputEl = contentEl.querySelector('input[placeholder="' + t('folder_placeholder', this.plugin) + '"]') as HTMLInputElement;
		}
		if (!this.fileNameInputEl) {
			this.fileNameInputEl = contentEl.querySelector('input[placeholder="' + t('file_name_placeholder', this.plugin) + '"]') as HTMLInputElement;
		}
	}

	/**
	 * 创建保存和取消按钮。
	 * @param container 容器元素
	 */
	private createActionButtons(container: HTMLElement): void {
		new Setting(container)
			.addButton((btn) => {
				btn
					.setButtonText(t('save', this.plugin))
					.setCta()
					.setClass('custom-save-button')
					.onClick(() => this.saveButton());
			})
			.addButton((btn) => {
				btn
					.setButtonText(t('cancel', this.plugin))
					.setClass('custom-cancel-button')
					.onClick(() => this.close());
			});
	}
} 