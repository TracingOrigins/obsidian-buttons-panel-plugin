import { App, Modal, Setting, Notice, TextComponent } from 'obsidian';
import { ButtonsPanelPlugin } from '@/common/types/plugin';
import { t } from '@/common/utils/i18n';

/**
 * CategoryCreateModal 分类创建模态框。
 * 用于弹出对话框让用户输入新分类名称，并回调创建逻辑。
 */
export class CategoryCreateModal extends Modal {
    /** 插件主类实例 */
    plugin: ButtonsPanelPlugin;
    /** 创建分类后的回调函数，参数为新分类名称 */
    onCreate: (categoryName: string) => void;
    /** 输入框当前的分类名称 */
    newName: string;
    /** 输入框组件引用（Obsidian Setting 的 text 控件） */
    private nameInput: TextComponent | null = null;

    /**
     * 构造函数，初始化模态框。
     * @param app Obsidian应用实例
     * @param plugin 插件主类实例
     * @param onCreate 创建分类的回调函数
     */
    constructor(app: App, plugin: ButtonsPanelPlugin, onCreate: (categoryName: string) => void) {
        super(app);
        this.plugin = plugin;
        this.onCreate = onCreate;
        this.newName = '';
    }

    /**
     * 打开模态框时自动调用，渲染输入界面。
     */
    onOpen() {
        const { contentEl } = this;
        contentEl.empty();
        contentEl.addClass('buttons-panel-plugin');
        contentEl.addClass('create-category-modal');
        // 标题
        contentEl.createEl('h2', { text: t('create_new_category') });

        // 分类名称输入框
        const nameSetting = new Setting(contentEl).setName(t('category_name'));

        nameSetting.addText((text) => {
            this.nameInput = text;
            text.setValue(this.newName).onChange((value) => {
                this.newName = value;
                // 清除错误状态
                this.nameInput?.inputEl.classList.remove('input-error');
            });
            // 支持回车直接提交
            text.inputEl.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.handleCreate();
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
                    .onClick(() => this.handleCreate())
            )
            .addButton((button) =>
                button
                    .setButtonText(t('cancel'))
                    .setClass('custom-cancel-button')
                    .onClick(() => this.close())
            );
    }

    /**
     * 处理创建分类的逻辑，校验输入并回调。
     */
    handleCreate() {
        // 校验分类名称不能为空
        if (!this.newName || this.newName.trim() === '') {
            this.nameInput?.inputEl.classList.add('input-error');
            new Notice(t('category_name_empty'));
            return;
        }

        // 清除错误状态
        this.nameInput?.inputEl.classList.remove('input-error');

        // 回调创建逻辑
        this.onCreate(this.newName.trim());
        this.close();
    }

    /**
     * 关闭模态框时自动调用，清理内容。
     */
    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}
