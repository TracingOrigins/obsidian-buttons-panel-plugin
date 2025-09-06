import { App, Notice, WorkspaceLeaf } from 'obsidian';
import { ButtonsPanelPlugin } from '@/common/types/plugin';
import { ButtonAction, FileActionParams } from '@/common/types/action';
import { t } from '@/common/utils/i18n';

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
        // 类型守卫：确保这是文件动作
        if (action.type !== 'file') {
            throw new Error('Invalid action type for file opening');
        }

        // 类型断言
        const fileParams = action.parameters as FileActionParams;
        const filePath = fileParams.filePath;

        // 检查文件是否存在
        const file = this.app.vault.getFileByPath(filePath);
        if (!file) {
            new Notice(t('file_not_found') + `: ${filePath}`);
            return;
        }

        // 查找已打开的 leaf，激活已打开的标签页
        const allLeaves = this.getAllLeaves();
        for (const leaf of allLeaves) {
            const view = (leaf as WorkspaceLeaf).view as any;
            if (view && view.file && view.file.path === filePath) {
                this.app.workspace.setActiveLeaf(leaf, { focus: true });
                return;
            }
        }

        // 没有已打开的 leaf，打开新标签页
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
