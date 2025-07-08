import { App, Modal, Setting, Notice } from 'obsidian';
import { ButtonsPanelPlugin } from '../../types/plugin';
import { CategoryConfig } from '../../types';
import { t, tWithParams } from '../../utils/i18n';

/**
 * 删除分类确认模态框类。
 */
export class DeleteCategoryModal extends Modal {
	plugin: ButtonsPanelPlugin;
	category: CategoryConfig;
	onDelete: () => void;

	constructor(app: App, plugin: ButtonsPanelPlugin, category: CategoryConfig, onDelete: () => void) {
		super(app);
		this.plugin = plugin;
		this.category = category;
		this.onDelete = onDelete;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.addClass('buttons-panel-plugin');
		contentEl.addClass('delete-category-modal');

		const buttonCount = this.category.buttons.length;

		contentEl.createEl('h2', { text: t('delete_category', this.plugin) });

		// 警告消息
		contentEl.createEl('p', { 
			text: tWithParams('confirm_delete_category', { categoryName: this.category.name }, this.plugin),
			cls: 'delete-message'
		});

		if (buttonCount > 0) {
			contentEl.createEl('p', { 
				text: tWithParams('delete_category_warning', { buttonCount }, this.plugin),
				cls: 'warning-message'
			});
		}

		// 操作按钮
		new Setting(contentEl)
			.addButton(button => button
				.setButtonText(t('delete', this.plugin))
				.setWarning()
				.setCta()
				.onClick(() => this.handleDelete()))
			.addButton(button => button
				.setButtonText(t('cancel', this.plugin))
				.onClick(() => this.close()));
	}

	async handleDelete() {
		try {
			// 从分类数组中移除该分类
			const index = this.plugin.settings.categories.findIndex(c => c.id === this.category.id);
			if (index > -1) {
				this.plugin.settings.categories.splice(index, 1);
				
				// 重新计算剩余分类的order值
				this.plugin.settings.categories.forEach((cat, i) => {
					cat.order = i;
				});
				
				// 保存设置
				await this.plugin.saveSettings();
				
				// 显示成功消息
				const buttonCount = this.category.buttons.length;
				const message = buttonCount > 0 
					? tWithParams('delete_category_success', { categoryName: this.category.name, buttonCount }, this.plugin)
					: tWithParams('delete_category_success_empty', { categoryName: this.category.name }, this.plugin);
				new Notice(message);
				
				// 调用回调函数
				this.onDelete();
				this.close();
			}
		} catch (error) {
			console.error('删除分类时出错:', error);
			new Notice(t('delete_category_error', this.plugin));
		}
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
} 