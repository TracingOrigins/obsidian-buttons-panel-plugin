import { App } from 'obsidian';
import { ButtonsPanelPlugin } from '@/common/types/plugin';
import { ButtonAction, UrlActionParams } from '@/common/types/action';

/**
 * URL 动作服务类，负责处理外部链接打开。
 * 支持在新标签页打开外部链接。
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
        // 类型守卫：确保这是 URL 动作
        if (action.type !== 'url') {
            throw new Error('Invalid action type for URL opening');
        }

        // 类型断言
        const urlParams = action.parameters as UrlActionParams;
        const url = urlParams.url;

        // 在新标签页打开外部链接
        window.open(url, '_blank');
    }
}
