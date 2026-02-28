import { Setting, TextComponent } from 'obsidian';
import { t } from '@/utils/i18n';

/**
 * NameInput 组件用于在设置面板中创建名称输入框，支持校验、错误提示、禁用、聚焦等功能。
 */
export interface NameInputOptions {
    /** 输入框名称 */
    name?: string;
    /** 输入框描述 */
    description?: string;
    /** 输入框占位符 */
    placeholder?: string;
    /** 默认值 */
    value?: string;
    /** 输入值变化回调 */
    onValueChange?: (value: string) => void;
    /** 回车键回调 */
    onEnter?: () => void;
    /** 校验错误回调 */
    onValidationError?: (error: string) => void;
    /** 是否显示错误 */
    showError?: boolean;
    /** 错误信息 */
    errorMessage?: string;
    /** 是否禁用输入 */
    disabled?: boolean;
}

/**
 * NameInput 类，封装名称输入、校验、错误提示、禁用、聚焦等逻辑。
 */
export class NameInput {
    private container: HTMLElement;
    private setting: Setting;
    private textComponent: TextComponent;
    private options: NameInputOptions;
    private inputEl: HTMLInputElement;

    /**
     * 构造函数
     * @param container 容器元素
     * @param options 组件配置项
     */
    constructor(container: HTMLElement, options: NameInputOptions = {}) {
        this.container = container;
        this.options = {
            placeholder: t('button_name_placeholder'),
            value: '',
            ...options,
        };
        this.render();
    }

    /** 渲染输入框及相关 UI */
    private render(): void {
        // 创建 Setting 实例
        this.setting = new Setting(this.container);

        // 设置名称和描述
        if (this.options.name) {
            this.setting.setName(this.options.name);
        }
        if (this.options.description) {
            this.setting.setDesc(this.options.description);
        }

        // 创建输入框
        this.textComponent = new TextComponent(this.setting.controlEl);
        this.inputEl = this.textComponent.inputEl;

        // 设置属性
        this.textComponent
            .setPlaceholder(this.options.placeholder || '')
            .setValue(this.options.value || '')
            .onChange((value) => {
                this.handleValueChange(value);
            });

        // 监听回车事件
        this.inputEl.addEventListener('keydown', (evt) => {
            if (evt.key === 'Enter') {
                evt.preventDefault();
                this.handleEnter();
            }
        });

        // 设置禁用状态
        if (this.options.disabled) {
            this.textComponent.setDisabled(true);
        }

        // 设置错误状态
        this.updateErrorState();
    }

    /** 处理输入值变化，校验并回调 */
    private handleValueChange(value: string): void {
        // 验证输入
        const validationError = this.validateInput(value);

        if (validationError) {
            this.setErrorInternal(validationError);
            this.options.onValidationError?.(validationError);
        } else {
            this.clearErrorInternal();
        }

        // 调用回调
        this.options.onValueChange?.(value);
    }

    /** 处理回车事件 */
    private handleEnter(): void {
        this.options.onEnter?.();
    }

    /** 校验输入值，返回错误信息或 null */
    private validateInput(value: string): string | null {
        if (!value || value.trim() === '') {
            return t('button_name_required');
        }

        if (value.length > 50) {
            return t('button_name_too_long');
        }

        // 检查特殊字符
        const invalidChars = /[<>:"/\\|?*]/;
        if (invalidChars.test(value)) {
            return t('button_name_invalid_chars');
        }

        return null;
    }

    /** 设置错误状态（内部方法） */
    private setErrorInternal(message: string): void {
        this.inputEl.classList.add('input-error');
        this.inputEl.setAttribute('title', message);
    }

    /** 清除错误状态（内部方法） */
    private clearErrorInternal(): void {
        this.inputEl.classList.remove('input-error');
        this.inputEl.removeAttribute('title');
    }

    /** 根据 options 更新错误状态 */
    private updateErrorState(): void {
        if (this.options.showError && this.options.errorMessage) {
            this.setErrorInternal(this.options.errorMessage);
        } else {
            this.clearErrorInternal();
        }
    }

    // 公开方法
    /** 获取输入值 */
    public getValue(): string {
        return this.textComponent.getValue();
    }

    /** 设置输入值 */
    public setValue(value: string): void {
        this.textComponent.setValue(value);
    }

    /** 设置禁用状态 */
    public setDisabled(disabled: boolean): void {
        this.textComponent.setDisabled(disabled);
    }

    /** 设置错误提示 */
    public setError(message: string): void {
        this.options.showError = true;
        this.options.errorMessage = message;
        this.updateErrorState();
    }

    /** 清除错误提示 */
    public clearError(): void {
        this.options.showError = false;
        this.options.errorMessage = '';
        this.updateErrorState();
    }

    /** 聚焦输入框 */
    public focus(): void {
        this.inputEl.focus();
    }

    /** 失焦输入框 */
    public blur(): void {
        this.inputEl.blur();
    }

    /** 销毁组件，清空容器 */
    public destroy(): void {
        this.container.empty();
    }

    // 链式调用方法
    /** 设置名称 */
    public setName(name: string): this {
        this.setting.setName(name);
        return this;
    }

    /** 设置描述 */
    public setDesc(description: string): this {
        this.setting.setDesc(description);
        return this;
    }
}
