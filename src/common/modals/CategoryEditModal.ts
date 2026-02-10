import { App, Modal, Setting, Notice, TextComponent } from 'obsidian';
import { ButtonsPanelPlugin } from '@/common/types/plugin';
import { CategoryConfig } from '@/common/types';
import { t } from '@/common/utils/i18n';

/**
 * CategoryEditModal 分类编辑模态框类（目前仅支持重命名）。
 * 用于输入新分类名称并保存，支持回车提交、空名校验。
 */
export class CategoryEditModal extends Modal {
    // 插件主类实例
    plugin: ButtonsPanelPlugin;
    // 要重命名的分类ID
    categoryId: string;
    // 旧的分类名称
    oldCategoryName: string;
    // 重命名后的回调函数
    onRename: () => void;
    // 输入框当前的新分类名称
    newName: string;
    // 输入框组件引用（Obsidian Setting 的 text 控件）
    private nameInput: TextComponent | null = null;

    /**
     * 构造函数，初始化模态框。
     * @param app Obsidian应用实例
     * @param plugin 插件主类实例
     * @param category 要重命名的分类对象
     * @param onRename 重命名后的回调
     */
    constructor(
        app: App,
        plugin: ButtonsPanelPlugin,
        category: CategoryConfig,
        onRename: () => void
    ) {
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
        contentEl.createEl('h2', { text: t('edit_category') });

        // 分类名称输入框
        const nameSetting = new Setting(contentEl).setName(t('category_name'));

        nameSetting.addText((text) => {
            this.nameInput = text;
            text.setValue(this.oldCategoryName).onChange((value) => {
                this.newName = value;
                // 清除错误状态
                this.nameInput?.inputEl.classList.remove('input-error');
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
            .addButton((button) =>
                button
                    .setButtonText(t('save'))
                    .setCta()
                    .setClass('custom-save-button')
                    .onClick(() => this.handleSave())
            )
            .addButton((button) =>
                button
                    .setButtonText(t('cancel'))
                    .setClass('custom-cancel-button')
                    .onClick(() => this.close())
            );
    }

    /**
     * 处理保存逻辑，校验输入并更新分类名称。
     */
    handleSave() {
        if (!this.newName || this.newName.trim() === '') {
            this.nameInput?.inputEl.classList.add('input-error');
            new Notice(t('category_name_empty'));
            return;
        }

        // 清除错误状态
        this.nameInput?.inputEl.classList.remove('input-error');

        // 不再检测重名，允许同名分类

        // 根据ID查找并重命名分类
        const category = this.plugin.settings.categories.find((c) => c.id === this.categoryId);
        if (category) {
            category.name = this.newName.trim();
            void this.plugin.saveSettings();
            this.onRename();
            this.close();
        } else {
            new Notice(t('category_not_found'));
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
