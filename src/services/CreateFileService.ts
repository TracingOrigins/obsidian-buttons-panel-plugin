import { App, Notice, normalizePath, moment } from 'obsidian';
import { ButtonsPanelPlugin } from '@/types/plugin';
import { t } from '@/utils/i18n';
import { FileService } from '@/services/FileService';
import { ButtonAction, CreateFileActionParams } from '@/types/action';

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

        // 在 ButtonAction 类型中，parameters 在 type === 'create_file' 时已经是 CreateFileActionParams
        const createParams: CreateFileActionParams = action.parameters;

        if (!createParams.fileName) {
            new Notice(t('file_name_empty'));
            return;
        }

        try {
            // 构建目标文件路径
            const filePath = this.buildTargetFilePath(createParams);

            // 检查文件是否已存在，已存在则直接打开
            const existingFile = this.app.vault.getFileByPath(filePath);
            if (existingFile) {
                await this.ensureFileCreatedAndOpened(filePath);
                return;
            }

            // 读取模板内容（如有）
            const fileContent = await this.readTemplateContent(createParams.templateName);

            // 创建新文件并打开
            await this.ensureFileCreatedAndOpened(filePath, fileContent);
        } catch (error) {
            console.error('创建文件时出错:', error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            new Notice(t('file_creation_failed') + `: ${errorMessage}`);
        }
    }

    /**
     * 构建目标文件路径，支持日期变量
     * @param params 创建文件参数
     * @returns 规范化后的文件路径
     */
    private buildTargetFilePath(params: CreateFileActionParams): string {
        // 构建完整文件路径，支持日期变量
        let fileName = this.resolveDateVariables(params.fileName);
        if (!fileName.endsWith('.md')) fileName = fileName + '.md';

        let filePath = fileName;
        if (params.folderPath) {
            const folderPath = this.resolveDateVariables(params.folderPath);
            filePath = `${folderPath}/${fileName}`;
        }

        // 使用 normalizePath 清理路径
        return normalizePath(filePath);
    }

    /**
     * 读取模板文件内容
     * @param templateName 模板文件名（可选）
     * @returns 模板内容字符串，如果未指定模板或模板不存在则返回空字符串
     */
    private async readTemplateContent(templateName?: string): Promise<string> {
        if (!templateName) {
            return '';
        }

        let templateFolder = this.plugin?.settings?.pathConfig?.templateFolderPath ?? '';
        // 使用 normalizePath 清理模板文件夹路径
        templateFolder = normalizePath(templateFolder);
        let templatePath = templateFolder ? `${templateFolder}/${templateName}` : templateName;
        templatePath = normalizePath(templatePath);

        const templateFile = this.app.vault.getFileByPath(templatePath);
        if (templateFile) {
            return await this.app.vault.read(templateFile);
        } else {
            new Notice(t('template_file_not_found') + `: ${templatePath}`);
            return '';
        }
    }

    /**
     * 确保文件已创建并打开
     * @param filePath 文件路径
     * @param fileContent 文件内容（可选，如果文件已存在则忽略）
     */
    private async ensureFileCreatedAndOpened(
        filePath: string,
        fileContent: string = ''
    ): Promise<void> {
        const existingFile = this.app.vault.getFileByPath(filePath);
        const openFileService = new FileService(this.app, this.plugin);

        if (!existingFile) {
            // 文件不存在，创建新文件
            await this.app.vault.create(filePath, fileContent);
        }

        // 打开文件
        await openFileService.openFile({
            type: 'file',
            parameters: { filePath: filePath },
        });
    }

    /**
     * 解析路径中的日期变量（如 {{DATE:YYYY-MM-DD}}）。
     * @param filePath 原始路径
     * @returns 替换后的路径
     */
    private resolveDateVariables(filePath: string): string {
        return filePath.replace(/{{DATE:(.*?)}}/g, (_match: string, format: string) => {
            return moment().format(format);
        });
    }
}
