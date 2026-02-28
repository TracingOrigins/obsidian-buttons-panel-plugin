import { App, Modal, Setting, Notice } from 'obsidian';
import { ButtonsPanelPlugin } from '@/types/plugin';
import { CategoryConfig } from '@/types';
import { t, tWithParams } from '@/utils/i18n';

/**
 * CategoryDeleteModal 分类删除模态框类。
 * 用于弹出确认对话框，确认后删除指定分类及其下所有按钮。
 */
export class CategoryDeleteModal extends Modal {
    plugin: ButtonsPanelPlugin;
    category: CategoryConfig;
    onDelete: () => void;

    /**
     * 构造函数，初始化模态框。
     * @param app Obsidian应用实例
     * @param plugin 插件主类实例
     * @param category 待删除的分类对象
     * @param onDelete 删除后的回调
     */
    constructor(
        app: App,
        plugin: ButtonsPanelPlugin,
        category: CategoryConfig,
        onDelete: () => void
    ) {
        super(app);
        this.plugin = plugin;
        this.category = category;
        this.onDelete = onDelete;
    }

    /**
     * 打开模态框时自动调用，渲染确认界面。
     */
    onOpen() {
        const { contentEl } = this;
        contentEl.empty();
        contentEl.addClass('buttons-panel-plugin');
        contentEl.addClass('delete-category-modal');

        const buttonCount = this.category.buttons.length;

        contentEl.createEl('h2', { text: t('delete_category') });

        // 警告消息
        contentEl.createEl('p', {
            text: tWithParams('confirm_delete_category', { categoryName: this.category.name }),
            cls: 'delete-message',
        });

        if (buttonCount > 0) {
            contentEl.createEl('p', {
                text: tWithParams('delete_category_warning', { buttonCount }),
                cls: 'warning-message',
            });
        }

        // 操作按钮
        new Setting(contentEl)
            .addButton((button) =>
                button
                    .setButtonText(t('delete'))
                    .setWarning()
                    .setCta()
                    .onClick(() => this.handleDelete())
            )
            .addButton((button) => button.setButtonText(t('cancel')).onClick(() => this.close()));
    }

    /**
     * 处理删除分类的逻辑，包含分类移除、顺序重排、保存和通知。
     */
    async handleDelete() {
        try {
            // 从分类数组中移除该分类
            const index = this.plugin.settings.categories.findIndex(
                (c) => c.id === this.category.id
            );
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
                const message =
                    buttonCount > 0
                        ? tWithParams('delete_category_success', {
                              categoryName: this.category.name,
                              buttonCount,
                          })
                        : tWithParams('delete_category_success_empty', {
                              categoryName: this.category.name,
                          });
                new Notice(message);

                // 调用回调函数
                this.onDelete();
                this.close();
            }
        } catch (error) {
            console.error('删除分类时出错:', error);
            new Notice(t('delete_category_error'));
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
