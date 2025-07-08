import {App, Notice, TFile, normalizePath} from 'obsidian';
import {ButtonsPanelPlugin} from '../types/plugin';
import {t} from '../utils/i18n';

/**
 * 文件创建动作服务类，负责处理文件创建相关的动作
 */
export class CreateFileService {
	constructor(private app: App, private plugin?: ButtonsPanelPlugin) {}

	/**
	 * 创建新文件（支持模板），并自动打开
	 * @param filePath 文件路径
	 * @param params 可选参数，如模板名称
	 */
	async createFile(filePath: string, params?: Record<string, any>): Promise<void> {
		if (!filePath) {
			new Notice(t('file_path_empty', this.plugin));
			return;
		}
		
		try {
			filePath = this.resolveDateVariables(filePath);
			while (filePath.startsWith('/')) filePath = filePath.substring(1);
			if (!filePath.endsWith('.md')) filePath = filePath + '.md';
			
			const existingFile = this.app.vault.getAbstractFileByPath(filePath);
			if (existingFile) {
				// 如果文件已存在，直接打开
				await this.app.workspace.openLinkText(filePath, '', true);
				return;
			}
			
			let fileContent = '';
			const templateName = params?.templateName;
			if (templateName) {
				let templateFolder = this.plugin?.settings?.pathConfig?.templateFolderPath ?? '';
				templateFolder = templateFolder.replace(/^\/+|\/+$/g, '').replace(/^\/|\/$/g, '');
				let templatePath = templateFolder ? `${templateFolder}/${templateName}` : templateName;
				templatePath = normalizePath(templatePath);
				const templateFile = this.app.vault.getAbstractFileByPath(templatePath);
				if (templateFile && templateFile instanceof TFile) {
					fileContent = await this.app.vault.read(templateFile);
				} else {
					new Notice(t('template_file_not_found', this.plugin) + `: ${templatePath}`);
				}
			}
			
			const newFile = await this.app.vault.create(filePath, fileContent);
			if (newFile) {
				await this.app.workspace.openLinkText(filePath, '', true);
			}
		} catch (error) {
			console.error('创建文件时出错:', error);
			new Notice(t('file_creation_failed', this.plugin) + `: ${error.message}`);
		}
	}

	/**
	 * 解析路径中的日期变量（如{{DATE:YYYY-MM-DD}}）
	 * @param filePath 原始路径
	 * @returns 替换后的路径
	 */
	private resolveDateVariables(filePath: string): string {
		const moment = (window as any).moment;
		if (!moment) {
			new Notice(t('moment_not_available', this.plugin));
			return filePath;
		}
		return filePath.replace(/{{DATE:(.*?)}}/g, (match, format) => {
			return moment().format(format);
		});
	}
} 