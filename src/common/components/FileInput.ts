import type { App, TFile } from 'obsidian';
import { Setting, TextComponent } from 'obsidian';
import { FileInputSuggest } from '@/common/suggest/FileInputSuggest';
import type { ButtonsPanelPlugin } from '@/common/types/plugin';

/**
 * FileInput 组件用于在设置面板中创建文件选择输入框，支持文件搜索和回调。
 * 可配置只显示文件名或完整路径。
 */
export interface FileInputOptions {
    /** 输入框名称 */
    name: string;
    /** 输入框描述 */
    description: string;
    /** 输入框占位符 */
    placeholder: string;
    /** 搜索按钮提示 */
    searchTooltip: string;
    /** 限定根文件夹 */
    rootFolder?: string;
    /** 允许的文件扩展名 */
    fileExts?: string[];
    /** 是否只显示文件名 */
    showFileNameOnly?: boolean;
}

/**
 * FileInput 类，封装文件输入与选择逻辑。
 */
export class FileInput {
    private input: TextComponent;
    private setting: Setting;
    private suggest: FileInputSuggest | null = null;

    /**
     * 构造函数
     * @param container 容器元素
     * @param options 组件配置项
     * @param context 上下文（含 app、plugin）
     * @param onValueChange 输入值变化回调
     */
    constructor(
        container: HTMLElement,
        options: FileInputOptions,
		context: { app: App; plugin: ButtonsPanelPlugin },
        onValueChange?: (value: string) => void
    ) {
        this.setting = new Setting(container).setName(options.name).setDesc(options.description);

        // 输入框
        this.input = new TextComponent(document.createElement('input')).setPlaceholder(
            options.placeholder
        );

        this.setting.controlEl.appendChild(this.input.inputEl);

        // 附加基于 AbstractInputSuggest 的文件下拉建议
        this.suggest = new FileInputSuggest(context.app, this.input.inputEl, {
            rootFolder: options.rootFolder || '',
            fileExts: options.fileExts || ['md'],
        });
        this.suggest.onSelect((file: TFile, _evt) => {
            const valueToSet = options.showFileNameOnly ? file.name : file.path;
            this.input.setValue(valueToSet);
            onValueChange?.(valueToSet);
            this.suggest?.close();
        });

        // 聚焦时打开建议框，方便直接选择
        this.input.inputEl.addEventListener('focus', () => {
            this.suggest?.open();
        });

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
