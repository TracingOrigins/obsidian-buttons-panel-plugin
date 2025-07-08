import {App, Notice, MarkdownView} from 'obsidian';
import {ButtonsPanelPlugin} from '../types/plugin';
import {t} from '../utils/i18n';

/**
 * 文件动作服务类，负责处理文件打开和创建相关的动作
 */
export class OpenFileService {
	constructor(private app: App, private plugin?: ButtonsPanelPlugin) {}

	/**
	 * 打开指定路径的文件
	 * @param filePath 文件路径
	 */
	async openFile(filePath: string): Promise<void> {
		const file = this.app.vault.getAbstractFileByPath(filePath);
		if (!file) {
			new Notice(t('file_not_found', this.plugin) + `: ${filePath}`);
			return;
		}
		
		// 查找已打开的 leaf
		const leaves = this.app.workspace.getLeavesOfType('markdown');
		for (const leaf of leaves) {
			const view = leaf.view as MarkdownView;
			if (view && view.file && view.file.path === filePath) {
				this.app.workspace.setActiveLeaf(leaf, {focus: true});
				return;
			}
		}
		
		// 没有已打开的 leaf，打开新标签页
		await this.app.workspace.openLinkText(filePath, '', true);
	}


} 