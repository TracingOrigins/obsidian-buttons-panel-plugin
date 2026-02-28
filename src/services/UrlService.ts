import { App, Notice } from 'obsidian';
import { ButtonsPanelPlugin } from '@/types/plugin';
import { ButtonAction, UrlActionParams } from '@/types/action';
import { t } from '@/utils/i18n';

/**
 * URL 动作服务类，负责处理外部链接打开。
 * 支持在新标签页打开外部链接，包含 URL 验证和错误处理。
 */
export class UrlService {
    /**
     * 构造函数，初始化 app 和插件实例。
     * @param app Obsidian 应用实例
     * @param plugin 插件主类实例（可选）
     */
    constructor(
        private app: App,
        private plugin?: ButtonsPanelPlugin
    ) {}

    /**
     * 在 Obsidian 中打开外部链接。
     * @param action 按钮动作配置对象，需包含 type: 'url' 及参数
     */
    async openUrl(action: ButtonAction): Promise<void> {
        const url = this.validateAndExtractUrl(action);
        if (!url) {
            return;
        }

        if (!this.validateUrl(url)) {
            new Notice(t('invalid_url') || `无效的 URL: ${url}`);
            return;
        }

        this.openUrlInNewTab(url);
    }

    /**
     * 验证动作类型并提取 URL
     * @param action 按钮动作配置对象
     * @returns URL 字符串，如果无效则返回空字符串
     */
    private validateAndExtractUrl(action: ButtonAction): string {
        if (action.type !== 'url') {
            throw new Error('Invalid action type for URL opening');
        }
        const urlParams: UrlActionParams = action.parameters;
        return urlParams.url?.trim() || '';
    }

    /**
     * 验证 URL 格式
     * @param url 要验证的 URL
     * @returns 如果 URL 格式有效则返回 true
     */
    private validateUrl(url: string): boolean {
        if (!url) {
            return false;
        }
        try {
            // 尝试创建 URL 对象来验证格式
            new URL(url);
            return true;
        } catch {
            // 如果 URL 对象创建失败，尝试添加协议前缀
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                try {
                    new URL(`https://${url}`);
                    return true;
                } catch {
                    return false;
                }
            }
            return false;
        }
    }

    /**
     * 在新标签页中打开 URL
     * @param url 要打开的 URL
     */
    private openUrlInNewTab(url: string): void {
        // 如果 URL 没有协议前缀，添加 https://
        const normalizedUrl = url.startsWith('http://') || url.startsWith('https://')
            ? url
            : `https://${url}`;

        const newWindow = window.open(normalizedUrl, '_blank');
        if (!newWindow) {
            // 如果浏览器阻止了弹窗，显示通知
            new Notice(t('popup_blocked') || '浏览器阻止了弹窗，请允许弹窗后重试');
        }
    }
}
