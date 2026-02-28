import type { App } from 'obsidian';
import { IButtonAction } from '@/actions/IButtonAction';
import { t } from '@/utils/i18n';
import { UrlInput } from '@/components/input';
import type { ButtonsPanelPlugin } from '@/types/plugin';

type ActionRenderContext = { app: App; plugin: ButtonsPanelPlugin };

/**
 * “打开链接”动作类，实现按钮动作表单的渲染、数据管理、校验和序列化。
 */
export class UrlAction implements IButtonAction {
    type = 'url';
    url: string;
    private urlInput: UrlInput | null = null;

    /**
     * 构造函数，初始化参数。
     */
    constructor(params: { url: string }) {
        this.url = params.url;
    }

    /**
     * 渲染表单控件，绑定数据双向同步。
     */
    render(container: HTMLElement, context: ActionRenderContext) {
        // 使用可复用的 URL 输入组件
        this.urlInput = new UrlInput(
            container,
            {
                name: t('url'),
                description: t('url_desc'),
                placeholder: t('url_placeholder'),
            },
            context,
            (value: string) => {
                this.url = value;
            }
        );

        // 设置初始值
        this.urlInput.setValue(this.url || '');
    }

    /**
     * 校验表单数据有效性。
     */
    validate() {
        return !!(this.url && this.url.trim());
    }

    /**
     * 序列化为 JSON 数据。
     */
    setError(message: string): void {
        this.urlInput?.setError(message);
    }

    /**
     * 序列化为 JSON 数据。
     */
    clearError(): void {
        this.urlInput?.clearError();
    }

    /**
     * 序列化为 JSON 数据。
     */
    toJSON() {
        return { type: this.type, parameters: { url: this.url } };
    }
}


