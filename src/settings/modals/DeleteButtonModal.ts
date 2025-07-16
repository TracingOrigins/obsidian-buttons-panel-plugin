import { App, Modal, Setting, Notice } from 'obsidian';
import { ButtonsPanelPlugin } from '@/types/plugin';
import { CategoryConfig, ButtonConfig } from '@/types';
import { t, tWithParams } from '@/utils/i18n';

/**
 * DeleteButtonModal 删除按钮确认模态框类。
 * 用于弹出确认对话框，确认后删除指定按钮。
 */
export class DeleteButtonModal extends Modal {
    plugin: ButtonsPanelPlugin;
    button: ButtonConfig;
    category: CategoryConfig;
    onDelete: () => void;

    /**
     * 构造函数，初始化模态框。
     * @param app Obsidian应用实例
     * @param plugin 插件主类实例
     * @param button 待删除的按钮对象
     * @param category 按钮所属分类
     * @param onDelete 删除后的回调
     */
    constructor(
        app: App,
        plugin: ButtonsPanelPlugin,
        button: ButtonConfig,
        category: CategoryConfig,
        onDelete: () => void
    ) {
        super(app);
        this.plugin = plugin;
        this.button = button;
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
        contentEl.addClass('delete-button-modal');

        contentEl.createEl('h2', { text: t('delete_button', this.plugin) });
        contentEl.createEl('p', {
            text: tWithParams(
                'confirm_delete_button',
                { buttonName: this.button.name },
                this.plugin
            ),
        });

        new Setting(contentEl)
            .addButton((btn) =>
                btn
                    .setButtonText(t('delete', this.plugin))
                    .setWarning()
                    .setCta()
                    .onClick(() => {
                        this.onDelete();
                        this.close();
                    })
            )
            .addButton((btn) =>
                btn.setButtonText(t('cancel', this.plugin)).onClick(() => this.close())
            );
    }

    /**
     * 关闭模态框时自动调用，清理内容。
     */
    onClose() {
        this.contentEl.empty();
    }
}
