import { IButtonAction } from './IButtonAction';
import { t } from '@/utils/i18n';
import { FileInput, FolderInput, FileNameInput } from '@/settings/components';

/**
 * “创建文件”动作类，实现按钮动作表单的渲染、数据管理、校验和序列化。
 */
export class CreateFileAction implements IButtonAction {
    type = 'create_file';
    folderPath: string = '';
    fileName: string = '';
    templateName: string = '';
    private fileNameInput: FileNameInput | null = null;
    private folderInput: FolderInput | null = null;

    /**
     * 构造函数，初始化参数。
     */
    constructor(params: { folderPath?: string; fileName?: string; templateName?: string }) {
        this.folderPath = params.folderPath || '';
        this.fileName = params.fileName || '';
        this.templateName = params.templateName || '';
    }

    /**
     * 渲染表单控件，绑定数据双向同步。
     */
    render(container: HTMLElement, context: any) {
        // 使用可复用的文件夹输入组件
        this.folderInput = new FolderInput(
            container,
            {
                name: t('folder', context.plugin),
                description: t('folder_placeholder', context.plugin),
                placeholder: t('folder_placeholder', context.plugin),
                searchTooltip: t('search_folders_tooltip', context.plugin),
            },
            { app: context.app, plugin: context.plugin },
            (value: string) => {
                this.folderPath = value;
            }
        );

        // 使用可复用的文件名输入组件
        this.fileNameInput = new FileNameInput(
            container,
            {
                name: t('file_name', context.plugin),
                description: t('file_name_desc', context.plugin),
                placeholder: t('file_name_placeholder', context.plugin),
                searchTooltip: t('search', context.plugin),
                suggestTooltip: t('search_date_variables_tooltip', context.plugin),
                onFileNameChange: (fileName: string) => {
                    this.fileName = fileName;
                },
            },
            { app: context.app, plugin: context.plugin },
            (value: string) => {
                this.fileName = value;
            }
        );

        // 使用可复用的文件输入组件作为模板选择
        const templateInput = new FileInput(
            container,
            {
                name: t('template_file', context.plugin),
                description: t('template_file_desc', context.plugin),
                placeholder: t('template_file_placeholder', context.plugin),
                searchTooltip: t('search_files_tooltip', context.plugin),
                rootFolder: context.plugin?.settings?.pathConfig?.templateFolderPath || '',
                fileExts: ['md'],
                showFileNameOnly: true,
            },
            { app: context.app, plugin: context.plugin },
            (value: string) => {
                this.templateName = value;
            }
        );

        // 设置初始值
        this.folderInput.setValue(this.folderPath || '');
        this.fileNameInput.setValue(this.fileName || '');
        templateInput.setValue(this.templateName || '');
    }

    /**
     * 校验表单数据有效性。
     */
    validate() {
        // 同时验证文件夹路径和文件名
        return !!(
            this.folderPath &&
            this.folderPath.trim() &&
            this.fileName &&
            this.fileName.trim()
        );
    }

    setError(message: string): void {
        // 如果验证失败，对文件夹路径和文件名输入框都设置错误状态
        if (!this.folderPath || !this.folderPath.trim()) {
            this.folderInput?.setError(message);
        }
        if (!this.fileName || !this.fileName.trim()) {
            this.fileNameInput?.setError(message);
        }
    }

    clearError(): void {
        // 清除所有输入框的错误状态
        this.fileNameInput?.clearError();
        this.folderInput?.clearError();
    }

    /**
     * 获取完整文件路径。
     */
    getFullPath(): string {
        if (!this.fileName) return '';
        if (!this.folderPath) return this.fileName;
        return `${this.folderPath}/${this.fileName}`;
    }

    /**
     * 序列化为 JSON 数据。
     */
    toJSON() {
        return {
            type: this.type,
            parameters: {
                folderPath: this.folderPath,
                fileName: this.fileName,
                templateName: this.templateName,
            },
        };
    }
}
