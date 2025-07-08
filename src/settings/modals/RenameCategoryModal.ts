import { App, Modal, Setting, Notice } from 'obsidian';
import { ButtonsPanelPlugin } from '../../types/plugin';
import { CategoryConfig } from '../../types';
import { t } from '../../utils/i18n';

/**
 * 重命名分类模态框类。
 * 用于输入新分类名称并保存，支持回车提交、空名校验。
 */
export class RenameCategoryModal extends Modal {
	/** 插件主类实例 */
	plugin: ButtonsPanelPlugin;
	/** 要重命名的分类ID */
	categoryId: string;
	/** 旧的分类名称 */
	oldCategoryName: string;
	/** 重命名后的回调函数 */
	onRename: () => void;
	/** 输入框当前的新分类名称 */
	newName: string;

	/**
	 * 构造函数，初始化模态框。
	 * @param app Obsidian应用实例
	 * @param plugin 插件主类实例
	 * @param category 要重命名的分类对象
	 * @param onRename 重命名后的回调
	 */
	constructor(app: App, plugin: ButtonsPanelPlugin, category: CategoryConfig, onRename: () => void) {
		super(app);
		this.plugin = plugin;
		this.categoryId = category.id;
		this.oldCategoryName = category.name;
		this.onRename = onRename;
		this.newName = category.name;
	}

	/**
	 * 打开模态框时自动调用，渲染界面。
	 */
	onOpen() {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.addClass('buttons-panel-plugin');
		contentEl.addClass('rename-category-modal');

		// 标题
		contentEl.createEl('h2', { text: t('rename_category', this.plugin) });

		// 分类名称输入框
		new Setting(contentEl)
			.setName(t('category_name', this.plugin))
			.addText(text => {
				text.setValue(this.oldCategoryName)
					.onChange((value) => {
						this.newName = value;
					});
				// 支持回车直接提交
				text.inputEl.addEventListener('keydown', (e) => {
					if (e.key === 'Enter') {
						this.handleSave();
					}
				});
			});

		// 底部操作按钮：保存/取消
		new Setting(contentEl)
			.addButton(button => button
				.setButtonText(t('save', this.plugin))
				.setCta()
				.onClick(() => this.handleSave()))
			.addButton(button => button
				.setButtonText(t('cancel', this.plugin))
				.onClick(() => this.close()));
	}

	/**
	 * 处理保存逻辑，校验输入并更新分类名称。
	 */
	handleSave() {
		if (!this.newName || this.newName.trim() === '') {
			new Notice(t('category_name_empty', this.plugin));
			return;
		}

		// 不再检测重名，允许同名分类

		// 根据ID查找并重命名分类
		const category = this.plugin.settings.categories.find(c => c.id === this.categoryId);
		if (category) {
			category.name = this.newName.trim();
			this.plugin.saveSettings();
			this.onRename();
			this.close();
		} else {
			new Notice(t('category_not_found', this.plugin));
		}
	}

	/**
	 * 关闭模态框时自动调用，清理内容。
	 */
	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
} 