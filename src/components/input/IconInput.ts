/**
 * IconInput - 图标输入组件
 * 样式文件: IconInput.css
 */
import type { App } from 'obsidian';
import { Setting, TextComponent, getIcon } from 'obsidian';
import { t } from '@/utils/i18n';
import { safeSetSVG } from '@/utils/dom';
import type { ButtonsPanelPlugin } from '@/types/plugin';
import { IconInputSuggest } from '@/components/suggest/IconInputSuggest';

/**
 * IconInput 组件用于在设置面板中创建图标输入框，支持 SVG 上传、图标搜索、预览和删除。
 */
export interface IconInputOptions {
    /** 输入框名称 */
    name?: string;
    /** 输入框描述 */
    description?: string;
    /** 输入框占位符 */
    placeholder?: string;
    /** 上传按钮提示 */
    uploadTooltip?: string;
    /** 搜索按钮提示 */
    searchTooltip?: string;
    /** 图标变更回调 */
    onIconChange?: (icon: string) => void;
}

/**
 * IconInput 类，封装图标输入、SVG 上传、搜索、预览与删除逻辑。
 */
export class IconInput {
    private input!: TextComponent;
    private setting!: Setting;
    private svgPreview: HTMLSpanElement | null = null;
    private value: string = '';
    private suggest: IconInputSuggest | null = null;

    /**
     * 构造函数
     * @param container 容器元素
     * @param options 组件配置项
     * @param context 上下文（含 app、plugin）
     * @param onValueChange 输入值变化回调
     */
    constructor(
        container: HTMLElement,
        options: IconInputOptions,
		context: { app: App; plugin: ButtonsPanelPlugin },
        onValueChange?: (value: string) => void
    ) {
        this.setting = new Setting(container)
            .setName(options.name ?? t('button_icon'))
            .setDesc(options.description ?? t('button_icon_desc'));

        // 上传按钮
        this.setting.addButton((btn) => {
            btn.setButtonText('')
                .setClass('icon-upload-btn')
                .setTooltip(options.uploadTooltip ?? t('upload_svg_icon_tooltip'))
                .setIcon('plus')
                .onClick(() => {
                    const fileInput = container.createEl('input');
                    fileInput.remove();
                    fileInput.type = 'file';
                    fileInput.accept = '.svg';
                    fileInput.onchange = async () => {
                        const file = fileInput.files?.[0];
                        if (file) {
                            let svgText = await file.text();
                            const match = svgText.match(/<svg[\s\S]*?<\/svg>/i);
                            if (match) svgText = match[0];
                            this.setValue(svgText);
                            onValueChange?.(svgText);
                            options.onIconChange?.(svgText);
                        }
                    };
                    fileInput.click();
                });
            btn.buttonEl.classList.add('icon-upload-btn');
        });

        // 输入框
        this.setting.addText((text) => {
            this.input = text;
            text.setPlaceholder(options.placeholder ?? t('button_icon_placeholder')).onChange(
                (value) => {
                    this.setValue(value);
                    onValueChange?.(value);
                    options.onIconChange?.(value);
                }
            );
        });

        const iconInputEl = this.setting.controlEl.querySelector('input')!;
        iconInputEl.addEventListener('input', () => this.refreshIconUI());

        // 为图标输入框附加基于 ID 的下拉建议
        this.suggest = new IconInputSuggest(context.app, iconInputEl);
        this.suggest.onSelect((iconId, _evt) => {
            // 将选中的图标 ID 转为 SVG 字符串，与原先 IconSearchModal 行为保持一致
            const svg = getIcon?.(iconId)?.outerHTML ?? iconId;
            this.setValue(svg);
            onValueChange?.(svg);
            options.onIconChange?.(svg);
            this.suggest?.close();
        });
    }

    /**
     * 刷新图标相关 UI（如预览、按钮显示/隐藏等）
     */
    private refreshIconUI() {
        const val = this.value;
        const HIDDEN_CLASS = 'is-hidden';
        const iconInputEl = this.setting.controlEl.querySelector('input')!;

        if (val && val.trim() !== '') {
            // 隐藏上传和搜索按钮
            const uploadBtn = this.setting.controlEl.querySelector(
                '.icon-upload-btn'
            ) as HTMLButtonElement;
            if (uploadBtn) uploadBtn.classList.add(HIDDEN_CLASS);

            // SVG预览
            if (!this.svgPreview) {
                this.svgPreview = this.setting.controlEl.createSpan();
                this.svgPreview.className = 'icon-svg-preview';
            }
            safeSetSVG(this.svgPreview, val);
            this.svgPreview.classList.remove(HIDDEN_CLASS);
            this.setting.controlEl.insertBefore(this.svgPreview, iconInputEl);
        } else {
            // 显示上传和搜索按钮
            const uploadBtn = this.setting.controlEl.querySelector(
                '.icon-upload-btn'
            ) as HTMLButtonElement;
            if (uploadBtn) uploadBtn.classList.remove(HIDDEN_CLASS);
            if (this.svgPreview) this.svgPreview.classList.add(HIDDEN_CLASS);
        }
    }

    /** 设置输入值，并刷新 UI */
    setValue(value: string) {
        this.value = value;
        this.input.setValue(value);
        this.refreshIconUI();
    }

    /** 获取输入值 */
    getValue(): string {
        return this.value;
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
