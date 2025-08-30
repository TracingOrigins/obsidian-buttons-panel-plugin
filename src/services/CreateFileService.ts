import { App, Notice, TFile, normalizePath, moment } from 'obsidian';
import { ButtonsPanelPlugin } from '@/common/types/plugin';
import { t } from '@/common/utils/i18n';
import { FileService } from '@/services/FileService';
import { ButtonAction, CreateFileActionParams } from '@/common/types/action';

/**
 * 文件创建动作服务类，负责处理文件创建相关的动作。
 * 支持日期变量、模板内容、自动打开等功能。
 */
export class CreateFileService {
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
     * 创建新文件（支持模板），并自动打开。
     * @param action 按钮动作配置对象，需包含 type: 'create_file' 及参数
     */
    async createFile(action: ButtonAction): Promise<void> {
        // 类型守卫：确保这是创建文件动作
        if (action.type !== 'create_file') {
            throw new Error('Invalid action type for file creation');
        }

        // 类型断言
        const createParams = action.parameters as CreateFileActionParams;

        if (!createParams.fileName) {
            new Notice(t('file_name_empty'));
            return;
        }

        try {
            // 构建完整文件路径，支持日期变量
            let fileName = this.resolveDateVariables(createParams.fileName);
            if (!fileName.endsWith('.md')) fileName = fileName + '.md';

            let filePath = fileName;
            if (createParams.folderPath) {
                const folderPath = this.resolveDateVariables(createParams.folderPath);
                filePath = `${folderPath}/${fileName}`;
            }

            // 使用 normalizePath 清理路径
            filePath = normalizePath(filePath);

            // 检查文件是否已存在，已存在则直接打开
            const existingFile = this.app.vault.getAbstractFileByPath(filePath);
            const openFileService = new FileService(this.app, this.plugin);
            if (existingFile) {
                await openFileService.openFile({
                    type: 'file',
                    parameters: { filePath: filePath },
                });
                return;
            }

            // 读取模板内容（如有）
            let fileContent = '';
            const templateName = createParams.templateName;
            if (templateName) {
                let templateFolder = this.plugin?.settings?.pathConfig?.templateFolderPath ?? '';
                // 使用 normalizePath 清理模板文件夹路径
                templateFolder = normalizePath(templateFolder);
                let templatePath = templateFolder
                    ? `${templateFolder}/${templateName}`
                    : templateName;
                templatePath = normalizePath(templatePath);
                const templateFile = this.app.vault.getAbstractFileByPath(templatePath);
                if (templateFile && templateFile instanceof TFile) {
                    fileContent = await this.app.vault.read(templateFile);
                } else {
                    new Notice(t('template_file_not_found') + `: ${templatePath}`);
                }
            }

            // 创建新文件
            const newFile = await this.app.vault.create(filePath, fileContent);
            if (newFile) {
                await openFileService.openFile({
                    type: 'file',
                    parameters: { filePath: filePath },
                });
            }
        } catch (error) {
            console.error('创建文件时出错:', error);
            new Notice(t('file_creation_failed') + `: ${error.message}`);
        }
    }

    /**
     * 解析路径中的日期变量（如 {{DATE:YYYY-MM-DD}}）。
     * @param filePath 原始路径
     * @returns 替换后的路径
     */
    private resolveDateVariables(filePath: string): string {
        return filePath.replace(/{{DATE:(.*?)}}/g, (match, format) => {
            return moment().format(format);
        });
    }
}
