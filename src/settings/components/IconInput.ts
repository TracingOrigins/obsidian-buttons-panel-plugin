import { setIcon, Setting, TextComponent } from 'obsidian';
import { t } from '@/utils/i18n';
import { IconSearchModal } from '@/settings/modals/IconSearchModal';
import { safeSetSVG } from '@/utils/dom';

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
    private input: TextComponent;
    private setting: Setting;
    private svgPreview: HTMLSpanElement | null = null;
    private deleteBtn: HTMLButtonElement | null = null;
    private value: string = '';

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
        context: any,
        onValueChange?: (value: string) => void
    ) {
        this.setting = new Setting(container)
            .setName(options.name ?? t('button_icon', context.plugin))
            .setDesc(options.description ?? t('button_icon_desc', context.plugin));

        // 上传按钮
        this.setting.addButton((btn) => {
            btn.setButtonText('')
                .setClass('custom-button')
                .setTooltip(options.uploadTooltip ?? t('upload_svg_icon_tooltip', context.plugin))
                .setIcon('plus')
                .onClick(() => {
                    const fileInput = document.createElement('input');
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

        // 搜索按钮
        this.setting.addButton((btn) => {
            btn.setButtonText('')
                .setClass('custom-button')
                .setTooltip(options.searchTooltip ?? t('search_icons_tooltip', context.plugin))
                .setIcon('search')
                .onClick(() => {
                    new IconSearchModal(
                        context.app,
                        context.plugin,
                        (icon: { name: string; svg: string }) => {
                            this.setValue(icon.svg);
                            onValueChange?.(icon.svg);
                            options.onIconChange?.(icon.svg);
                        }
                    ).open();
                });
            btn.buttonEl.classList.add('icon-search-btn');
        });

        // 输入框
        this.setting.addText((text) => {
            this.input = text;
            text.setPlaceholder(
                options.placeholder ?? t('button_icon_placeholder', context.plugin)
            ).onChange((value) => {
                this.setValue(value);
                onValueChange?.(value);
                options.onIconChange?.(value);
            });
        });

        const iconInputEl = this.setting.controlEl.querySelector('input')!;
        iconInputEl.addEventListener('input', () => this.refreshIconUI());
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
            const searchBtn = this.setting.controlEl.querySelector(
                '.icon-search-btn'
            ) as HTMLButtonElement;
            if (uploadBtn) uploadBtn.classList.add(HIDDEN_CLASS);
            if (searchBtn) searchBtn.classList.add(HIDDEN_CLASS);

            // SVG预览
            if (!this.svgPreview) {
                this.svgPreview = this.setting.controlEl.createSpan();
                this.svgPreview.className = 'icon-svg-preview';
            }
            safeSetSVG(this.svgPreview, val);
            this.svgPreview.classList.remove(HIDDEN_CLASS);
            this.setting.controlEl.insertBefore(this.svgPreview, iconInputEl);

            // 删除按钮
            if (!this.deleteBtn) {
                this.deleteBtn = this.setting.controlEl.createEl('button', {
                    cls: 'icon-delete-btn',
                });
                setIcon(this.deleteBtn, 'x');
                this.deleteBtn.onclick = () => {
                    this.setValue('');
                };
                iconInputEl.parentElement!.classList.add('icon-input-container');
                iconInputEl.parentElement!.appendChild(this.deleteBtn);
            }
            this.deleteBtn.classList.remove(HIDDEN_CLASS);
        } else {
            // 显示上传和搜索按钮
            const uploadBtn = this.setting.controlEl.querySelector(
                '.icon-upload-btn'
            ) as HTMLButtonElement;
            const searchBtn = this.setting.controlEl.querySelector(
                '.icon-search-btn'
            ) as HTMLButtonElement;
            if (uploadBtn) uploadBtn.classList.remove(HIDDEN_CLASS);
            if (searchBtn) searchBtn.classList.remove(HIDDEN_CLASS);
            if (this.svgPreview) this.svgPreview.classList.add(HIDDEN_CLASS);
            if (this.deleteBtn) this.deleteBtn.classList.add(HIDDEN_CLASS);
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
