import {App, Notice} from 'obsidian';
import {ButtonsPanelPlugin} from '../types/plugin';
import {t} from '../utils/i18n';

/**
 * URL动作服务类，负责处理外部链接打开
 */
export class OpenUrlService {
	constructor(private app: App, private plugin?: ButtonsPanelPlugin) {}

	/**
	 * 在Obsidian中打开外部链接
	 * @param url 链接地址
	 */
	async openUrl(url: string): Promise<void> {
		// 确保URL有协议
		if (!url.startsWith('http://') && !url.startsWith('https://')) {
			url = 'https://' + url;
		}
		
		// 在Obsidian中打开外部链接
		window.open(url, '_blank');
	}
} 