import {App, Notice, WorkspaceLeaf} from 'obsidian';
import {ButtonsPanelPlugin} from '../types/plugin';
import {t} from '../utils/i18n';

/**
 * 文件动作服务类，负责处理文件打开和创建相关的动作
 */
export class OpenFileService {
	constructor(private app: App, private plugin?: ButtonsPanelPlugin) {}

	/**
	 * 打开指定路径的文件
	 * 
	 * 无论什么类型的文件，都会递归查找所有已打开的标签页（leaf），
	 * 只要有同路径的文件已打开就会激活它，不会重复打开多个标签页。
	 * 这样所有文件类型都能实现“唯一标签页”效果
	 * 
	 * @param filePath 文件路径
	 */
	async openFile(filePath: string): Promise<void> {
		const file = this.app.vault.getAbstractFileByPath(filePath);
		if (!file) {
			new Notice(t('file_not_found', this.plugin) + `: ${filePath}`);
			return;
		}

		// 遍历所有 leaf，查找已打开的同路径文件
		const allLeaves = this.getAllLeaves();
		for (const leaf of allLeaves) {
			const view = (leaf as WorkspaceLeaf).view as any;
			if (view && view.file && view.file.path === filePath) {
				this.app.workspace.setActiveLeaf(leaf, {focus: true});
				return;
			}
		}

		// 没有已打开的 leaf，打开新标签页
		await this.app.workspace.openLinkText(filePath, '', true);
	}

	/**
	 * 获取所有 WorkspaceLeaf（递归）
	 */
	private getAllLeaves(): WorkspaceLeaf[] {
		const leaves: WorkspaceLeaf[] = [];
		function traverse(node: any) {
			if (node.children) {
				for (const child of node.children) {
					traverse(child);
				}
			} else if (node instanceof WorkspaceLeaf) {
				leaves.push(node);
			}
		}
		traverse((this.app.workspace as any).rootSplit);
		return leaves;
	}
} 