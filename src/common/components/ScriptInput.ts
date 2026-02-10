import type { App, TFile } from 'obsidian';
import { Setting, TextComponent } from 'obsidian';
import { FileSearchModal } from '@/common/modals/FileSearchModal';
import type { ButtonsPanelPlugin } from '@/common/types/plugin';

/**
 * ScriptInput 组件用于在设置面板中创建脚本文件选择输入框，支持 js 文件搜索和回调。
 */
export interface ScriptInputOptions {
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
    /** 脚本变更回调 */
    onScriptChange?: (scriptName: string) => void;
    /** 回车键回调 */
    onEnterKey?: () => void;
}

/**
 * ScriptInput 类，封装脚本文件输入与选择逻辑。
 */
export class ScriptInput {
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
        options: ScriptInputOptions,
		context: { app: App; plugin: ButtonsPanelPlugin },
        onValueChange?: (value: string) => void
    ) {
        this.setting = new Setting(container).setName(options.name).setDesc(options.description);

        // 搜索按钮
        this.setting.addButton((btn) => {
            btn.setButtonText('')
                .setClass('custom-button')
                .setTooltip(options.searchTooltip)
                .setIcon('search')
                .onClick(() => {
                    new FileSearchModal(
						context.app,
						context.plugin,
						(file: TFile | string) => {
							const fileName = typeof file === 'string' ? file : file?.name ?? '';
                            if (!fileName.endsWith('.js')) return;
                            this.input.setValue(fileName);
                            onValueChange?.(fileName);
                            options.onScriptChange?.(fileName);
                        },
                        {
                            rootFolder: options.rootFolder || '',
                            fileExts: ['js'],
                            showFileNameOnly: true,
                        }
                    ).open();
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
            options.onScriptChange?.(value);
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
