import { App, Notice, WorkspaceLeaf } from 'obsidian';
import { ButtonsPanelPlugin } from '@/types/plugin';
import { ButtonAction, FileActionParams } from '@/types/action';
import { t } from '@/utils/i18n';

/**
 * 文件动作服务类，负责处理文件打开和相关的动作。
 * 支持唯一标签页激活、文件存在性检查等功能。
 */
export class FileService {
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
     * 打开指定路径的文件。
     * 如果文件已在某个标签页打开，则激活该标签页，否则新建标签页打开。
     * @param action 按钮动作配置对象，需包含 type: 'file' 及参数
     */
    async openFile(action: ButtonAction): Promise<void> {
        const filePath = this.validateAndExtractFilePath(action);
        const file = this.getFileByPath(filePath);
        if (!file) {
            return;
        }

        const existingLeaf = this.findOpenLeafForFile(filePath);
        if (existingLeaf) {
            this.activateLeaf(existingLeaf);
            return;
        }

        await this.openFileInNewLeaf(filePath);
    }

    /**
     * 验证动作类型并提取文件路径
     * @param action 按钮动作配置对象
     * @returns 文件路径
     * @throws 如果动作类型不是 'file'
     */
    private validateAndExtractFilePath(action: ButtonAction): string {
        if (action.type !== 'file') {
            throw new Error('Invalid action type for file opening');
        }
        const fileParams: FileActionParams = action.parameters;
        return fileParams.filePath;
    }

    /**
     * 根据路径获取文件，如果不存在则显示通知
     * @param filePath 文件路径
     * @returns 文件对象，如果不存在则返回 null
     */
    private getFileByPath(filePath: string) {
        const file = this.app.vault.getFileByPath(filePath);
        if (!file) {
            new Notice(t('file_not_found') + `: ${filePath}`);
            return null;
        }
        return file;
    }

    /**
     * 查找已打开指定文件的 leaf
     * @param filePath 文件路径
     * @returns 已打开的 leaf，如果不存在则返回 null
     */
    private findOpenLeafForFile(filePath: string): WorkspaceLeaf | null {
        const allLeaves = this.getAllLeaves();
        for (const leaf of allLeaves) {
            const view = leaf.view as unknown;
            const fileFromView =
                view && typeof view === 'object'
                    ? (view as { file?: { path?: string } }).file
                    : undefined;
            if (fileFromView?.path === filePath) {
                return leaf;
            }
        }
        return null;
    }

    /**
     * 激活指定的 leaf
     * @param leaf 要激活的 leaf
     */
    private activateLeaf(leaf: WorkspaceLeaf): void {
        this.app.workspace.setActiveLeaf(leaf, { focus: true });
    }

    /**
     * 在新标签页中打开文件
     * @param filePath 文件路径
     */
    private async openFileInNewLeaf(filePath: string): Promise<void> {
        await this.app.workspace.openLinkText(filePath, '', true);
    }

    /**
     * 获取所有 WorkspaceLeaf。
     * 使用 Obsidian API 的 iterateAllLeaves 方法，包括主区域、浮动和侧边栏的所有叶子。
     */
    private getAllLeaves(): WorkspaceLeaf[] {
        const leaves: WorkspaceLeaf[] = [];
        this.app.workspace.iterateAllLeaves((leaf) => {
            leaves.push(leaf);
        });
        return leaves;
    }
}
