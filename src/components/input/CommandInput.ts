import type { App } from 'obsidian';
import { Setting, TextComponent } from 'obsidian';
import { CommandInputSuggest } from '@/components/suggest/CommandInputSuggest';
import type { ButtonsPanelPlugin } from '@/types/plugin';

/**
 * CommandInput 组件用于在设置面板中创建命令选择输入框，支持命令搜索和回调。
 * 提供命令输入、搜索按钮、回调处理等功能。
 */
export interface CommandInputOptions {
    /** 输入框名称 */
    name: string;
    /** 输入框描述 */
    description: string;
    /** 输入框占位符 */
    placeholder: string;
    /** 搜索按钮提示 */
    searchTooltip: string;
    /** 命令变更回调 */
    onCommandChange?: (commandId: string) => void;
    /** 回车键回调 */
    onEnterKey?: () => void;
}

/**
 * CommandInput 类，封装命令输入与选择逻辑。
 */
export class CommandInput {
    private input: TextComponent;
    private setting: Setting;
    private suggest: CommandInputSuggest | null = null;

    /**
     * 构造函数
     * @param container 容器元素
     * @param options 组件配置项
	 * @param context 上下文（含 app、plugin）
     * @param onValueChange 输入值变化回调
     */
    constructor(
        container: HTMLElement,
        options: CommandInputOptions,
		context: { app: App; plugin: ButtonsPanelPlugin },
        onValueChange?: (value: string) => void
    ) {
        this.setting = new Setting(container).setName(options.name).setDesc(options.description);

        // 输入框
        this.input = new TextComponent(container.createEl('input')).setPlaceholder(
            options.placeholder
        );

        // 将输入框添加到设置控件中
        this.setting.controlEl.appendChild(this.input.inputEl);

        // 附加 Obsidian 原生的输入框下拉建议
        this.suggest = new CommandInputSuggest(context.app, this.input.inputEl);
        this.suggest.onSelect((cmd, _evt) => {
            const commandId = cmd.id;
            this.input.setValue(commandId);
            onValueChange?.(commandId);
            options.onCommandChange?.(commandId);
            // 选中后关闭悬浮建议框
            this.suggest?.close();
        });

        // 聚焦时主动打开建议框（显示全部命令），提升可发现性
        this.input.inputEl.addEventListener('focus', () => {
            this.suggest?.open();
        });

        // 输入变化回调
        this.input.onChange((value) => {
            onValueChange?.(value);
            options.onCommandChange?.(value);
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
