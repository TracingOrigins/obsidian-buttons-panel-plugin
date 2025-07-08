import { App, Modal, Setting, Notice } from 'obsidian';
import { ButtonsPanelPlugin } from '../../types/plugin';
import { CategoryConfig, ButtonConfig } from '../../types';
import { t, tWithParams } from '../../utils/i18n';

/**
 * 删除按钮确认模态框类。
 */
export class DeleteButtonModal extends Modal {
	plugin: ButtonsPanelPlugin;
	button: ButtonConfig;
	category: CategoryConfig;
	onDelete: () => void;

	constructor(app: App, plugin: ButtonsPanelPlugin, button: ButtonConfig, category: CategoryConfig, onDelete: () => void) {
		super(app);
		this.plugin = plugin;
		this.button = button;
		this.category = category;
		this.onDelete = onDelete;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.addClass('buttons-panel-plugin');
		contentEl.addClass('delete-button-modal');

		contentEl.createEl('h2', { text: t('delete_button', this.plugin) });
		contentEl.createEl('p', { text: tWithParams('confirm_delete_button', { buttonName: this.button.name }, this.plugin) });

		new Setting(contentEl)
			.addButton(btn => btn
				.setButtonText(t('delete', this.plugin))
				.setWarning()
				.setCta()
				.onClick(() => {
					this.onDelete();
					this.close();
				}))
			.addButton(btn => btn
				.setButtonText(t('cancel', this.plugin))
				.onClick(() => this.close()));
	}

	onClose() {
		this.contentEl.empty();
	}
} 