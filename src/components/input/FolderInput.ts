import type { App } from 'obsidian';
import { Setting, TextComponent } from 'obsidian';
import { FolderInputSuggest } from '@/components/suggest/FolderInputSuggest';
import type { ButtonsPanelPlugin } from '@/types/plugin';

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
    private suggest: FolderInputSuggest | null = null;

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
		context: { app: App; plugin: ButtonsPanelPlugin },
        onValueChange?: (value: string) => void
    ) {
        this.setting = new Setting(container).setName(options.name).setDesc(options.description);

        // 输入框
        this.input = new TextComponent(activeDocument.createElement('input')).setPlaceholder(
            options.placeholder
        );

        this.setting.controlEl.appendChild(this.input.inputEl);

        // 附加文件夹路径下拉建议
        this.suggest = new FolderInputSuggest(context.app, this.input.inputEl);
        this.suggest.onSelect((folderPath, _evt) => {
            this.input.setValue(folderPath);
            onValueChange?.(folderPath);
            this.suggest?.close();
        });

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
