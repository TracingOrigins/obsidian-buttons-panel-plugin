import { Setting, TextComponent } from 'obsidian';
import { t } from '@/utils/i18n';
import { FolderSearchModal } from '@/settings/modals/FolderSearchModal';

/**
 * FolderInput 组件用于在设置面板中创建文件夹选择输入框，支持文件夹搜索和回调。
 */
export interface FolderInputOptions {
    /** 输入框名称 */
    name: string;
    /** 输入框描述 */
    description: string;
    /** 输入框占位符 */
    placeholder: string;
    /** 搜索按钮提示 */
    searchTooltip: string;
}

/**
 * FolderInput 类，封装文件夹输入与选择逻辑。
 */
export class FolderInput {
    private input: TextComponent;
    private setting: Setting;

    /**
     * 构造函数
     * @param container 容器元素
     * @param options 组件配置项
     * @param context 上下文（含 app、plugin）
     * @param onValueChange 输入值变化回调
     */
    constructor(
        container: HTMLElement,
        options: FolderInputOptions,
        context: any,
        onValueChange?: (value: string) => void
    ) {
        this.setting = new Setting(container).setName(options.name).setDesc(options.description);

        // 搜索按钮
        this.setting.addButton((btn) => {
            btn.setButtonText('')
                .setClass('custom-button')
                .setTooltip(options.searchTooltip)
                .setIcon('folder')
                .onClick(() => {
                    new FolderSearchModal(context.app, context.plugin, (folder: any) => {
                        let folderName = folder?.name || (typeof folder === 'string' ? folder : '');
                        this.input.setValue(folderName);
                        onValueChange?.(folderName);
                    }).open();
                });
        });

        // 输入框
        this.input = new TextComponent(document.createElement('input')).setPlaceholder(
            options.placeholder
        );

        this.setting.controlEl.appendChild(this.input.inputEl);

        // 输入变化回调
        this.input.onChange((value) => {
            onValueChange?.(value);
        });
    }

    /** 设置输入值 */
    setValue(value: string) {
        this.input.setValue(value);
    }

    /** 获取输入值 */
    getValue(): string {
        return this.input.getValue();
    }

    /** 获取原生 input 元素 */
    getInputElement(): HTMLInputElement {
        return this.input.inputEl;
    }

    /** 设置错误提示 */
    setError(message: string): void {
        this.input.inputEl.classList.add('input-error');
        this.input.inputEl.setAttribute('title', message);
    }

    /** 清除错误提示 */
    clearError(): void {
        this.input.inputEl.classList.remove('input-error');
        this.input.inputEl.removeAttribute('title');
    }
}
