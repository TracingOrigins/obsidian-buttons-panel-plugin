import { App, Notice } from 'obsidian';
import { ButtonsPanelPlugin } from '@/types/plugin';
import { ButtonAction, UrlActionParams } from '@/types/action';
import { tWithParams } from '@/utils/i18n';

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

        const target = this.resolveOpenableUrl(url);
        if (!target) {
            new Notice(tWithParams('invalid_url', { url }));
            return;
        }

        window.open(target, '_blank');
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

    private static readonly allowedUrlProtocols = new Set(['http:', 'https:', 'obsidian:']);

    /**
     * 解析并校验为可打开的绝对 URL；失败返回 null。
     * 允许 obsidian://、http(s)://（须被 URL 解析器接受），以及可补全为 https:// 的裸主机。
     */
    private resolveOpenableUrl(url: string): string | null {
        if (!url) {
            return null;
        }

        if (url.toLowerCase().startsWith('obsidian://')) {
            try {
                new URL(url);
                return url;
            } catch {
                return null;
            }
        }

        try {
            const { protocol } = new URL(url);
            return UrlService.allowedUrlProtocols.has(protocol.toLowerCase()) ? url : null;
        } catch {
            if (url.includes('://')) {
                return null;
            }
            try {
                const withHttps = `https://${url}`;
                const { protocol } = new URL(withHttps);
                return protocol === 'https:' ? withHttps : null;
            } catch {
                return null;
            }
        }
    }
}
