import { Setting, TextComponent } from 'obsidian';
import { t } from '@/common/utils/i18n';

/**
 * UrlInput 组件用于在设置面板中创建 URL 输入框，支持回调和回车事件。
 */
export interface UrlInputOptions {
    /** 输入框名称 */
    name: string;
    /** 输入框描述 */
    description: string;
    /** 输入框占位符 */
    placeholder: string;
    /** URL 变更回调 */
    onUrlChange?: (url: string) => void;
    /** 回车键回调 */
    onEnterKey?: () => void;
}

/**
 * UrlInput 类，封装 URL 输入与回调逻辑。
 */
export class UrlInput {
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
        options: UrlInputOptions,
        context: any,
        onValueChange?: (value: string) => void
    ) {
        this.setting = new Setting(container).setName(options.name).setDesc(options.description);

        // 输入框
        this.input = new TextComponent(document.createElement('input')).setPlaceholder(
            options.placeholder || 'https://example.com'
        );
        this.setting.controlEl.appendChild(this.input.inputEl);

        // 输入变化回调
        this.input.onChange((value) => {
            onValueChange?.(value);
            options.onUrlChange?.(value);
        });

        // 添加回车键监听
        if (options.onEnterKey) {
            this.input.inputEl.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && options.onEnterKey) {
                    options.onEnterKey();
                }
            });
        }
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
