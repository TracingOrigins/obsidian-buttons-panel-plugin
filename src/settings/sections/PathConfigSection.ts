import { App, Setting, ButtonComponent, Notice, TextComponent } from 'obsidian';
import { ButtonsPanelPlugin } from '@/common/types/plugin';
import { t } from '@/common/utils/i18n';
import { FolderSearchModal } from '@/common/modals/FolderSearchModal';
import { safeSetSVG } from '@/common/utils/dom';

/**
 * createPathConfigSection 创建路径设置区域。
 * 用于在设置界面配置模板和脚本文件夹路径，并支持路径校验和一键创建。
 * @param containerEl 路径设置内容容器
 * @param plugin 插件实例
 * @param app Obsidian应用实例
 */
export function createPathConfigSection(
    containerEl: HTMLElement,
    plugin: ButtonsPanelPlugin,
    app: App
): void {
    // 创建卡片组
    const card = containerEl.createDiv('settings-card-group');

    // 模板文件夹路径设置
    const templateWrapper = containerEl.createDiv({ cls: 'path-input-wrapper' });
    const templateInput = new TextComponent(templateWrapper)
        .setPlaceholder(t('template_folder_placeholder', plugin))
        .setValue(plugin.settings.pathConfig.templateFolderPath ?? '');

    // 初始化时验证路径
    const initialTemplatePath = plugin.settings.pathConfig.templateFolderPath ?? '';
    const cleanInitialTemplatePath = cleanPath(initialTemplatePath);
    const templateFolder = cleanInitialTemplatePath
        ? app.vault.getAbstractFileByPath(String(cleanInitialTemplatePath))
        : null;
    if (cleanInitialTemplatePath && !templateFolder) {
        templateInput.inputEl.classList.add('input-error');
    }

    const templateSetting = new Setting(card)
        .setName(t('template_folder', plugin))
        .setDesc(t('template_folder_desc', plugin))
        .addButton((button) =>
            button
                .setButtonText('')
                .setClass('custom-button')
                .setTooltip(t('search_folders_tooltip', plugin))
                .setIcon('search')
                .onClick(() => {
                    new FolderSearchModal(app, plugin, (folderPath: string) => {
                        templateInput.setValue(folderPath);
                        plugin.settings.pathConfig.templateFolderPath = folderPath;
                        plugin.saveSettings();
                        // 实时验证
                        const folder = cleanPath(folderPath)
                            ? app.vault.getAbstractFileByPath(cleanPath(folderPath))
                            : null;
                        if (cleanPath(folderPath) && !folder) {
                            templateInput.inputEl.classList.add('input-error');
                        } else {
                            templateInput.inputEl.classList.remove('input-error');
                        }
                    }).open();
                })
        );
    templateSetting.controlEl.appendChild(templateWrapper);

    templateInput.onChange(async (value) => {
        // 只保存原始值，允许为空
        plugin.settings.pathConfig.templateFolderPath = value;
        await plugin.saveSettings();
        // 实时验证路径
        const folder = cleanPath(value)
            ? app.vault.getAbstractFileByPath(String(cleanPath(value)))
            : null;
        if (cleanPath(value) && !folder) {
            templateInput.inputEl.classList.add('input-error');
        } else {
            templateInput.inputEl.classList.remove('input-error');
        }
    });

    // 脚本文件夹路径设置
    const scriptWrapper = containerEl.createDiv({ cls: 'path-input-wrapper' });
    const scriptInput = new TextComponent(scriptWrapper)
        .setPlaceholder(t('script_folder_placeholder', plugin))
        .setValue(plugin.settings.pathConfig.scriptFolderPath ?? '');

    // 初始化时验证路径
    const initialScriptPath = plugin.settings.pathConfig.scriptFolderPath ?? '';
    const cleanInitialScriptPath = cleanPath(initialScriptPath);
    const scriptFolder = cleanInitialScriptPath
        ? app.vault.getAbstractFileByPath(String(cleanInitialScriptPath))
        : null;
    if (cleanInitialScriptPath && !scriptFolder) {
        scriptInput.inputEl.classList.add('input-error');
    }

    const scriptSetting = new Setting(card)
        .setName(t('script_folder', plugin))
        .setDesc(t('script_folder_desc', plugin))
        .addButton((button) =>
            button
                .setButtonText('')
                .setClass('custom-button')
                .setTooltip(t('search_folders_tooltip', plugin))
                .setIcon('search')
                .onClick(() => {
                    new FolderSearchModal(app, plugin, (folderPath: string) => {
                        scriptInput.setValue(folderPath);
                        plugin.settings.pathConfig.scriptFolderPath = folderPath;
                        plugin.saveSettings();
                        // 实时验证
                        const folder = cleanPath(folderPath)
                            ? app.vault.getAbstractFileByPath(cleanPath(folderPath))
                            : null;
                        if (cleanPath(folderPath) && !folder) {
                            scriptInput.inputEl.classList.add('input-error');
                        } else {
                            scriptInput.inputEl.classList.remove('input-error');
                        }
                    }).open();
                })
        );
    scriptSetting.controlEl.appendChild(scriptWrapper);

    scriptInput.onChange(async (value) => {
        // 只保存原始值，允许为空
        plugin.settings.pathConfig.scriptFolderPath = value;
        await plugin.saveSettings();
        // 实时验证路径
        const folder = cleanPath(value)
            ? app.vault.getAbstractFileByPath(String(cleanPath(value)))
            : null;
        if (cleanPath(value) && !folder) {
            scriptInput.inputEl.classList.add('input-error');
        } else {
            scriptInput.inputEl.classList.remove('input-error');
        }
    });

    // 路径验证和创建按钮
    new Setting(card)
        .setName(t('create_paths', plugin))
        .setDesc(t('create_paths_desc', plugin))
        .addButton((button) =>
            button
                .setButtonText(t('create_paths', plugin))
                .setClass('mod-warning')
                .onClick(async () => {
                    await createPathsOnly(plugin, app, templateInput, scriptInput);
                })
        );
}

/**
 * 只创建不存在的路径，全部存在则提示。
 */
async function createPathsOnly(
    plugin: ButtonsPanelPlugin,
    app: App,
    templateInput: TextComponent,
    scriptInput: TextComponent
): Promise<void> {
    const templatePath = plugin.settings.pathConfig.templateFolderPath;
    const scriptPath = plugin.settings.pathConfig.scriptFolderPath;
    let createdFolders: string[] = [];
    let allExist = true;
    // 模板
    const cleanTemplatePath = cleanPath(templatePath);
    if (cleanTemplatePath) {
        const templateFolder = app.vault.getAbstractFileByPath(String(cleanTemplatePath));
        if (!templateFolder) {
            try {
                await app.vault.createFolder(String(cleanTemplatePath));
                createdFolders.push(cleanTemplatePath);
                allExist = false;
            } catch (error) {
                new Notice(
                    t('create_folder_failed', plugin) + `: ${cleanTemplatePath} - ${error.message}`
                );
                return;
            }
        }
    }
    // 脚本
    const cleanScriptPath = cleanPath(scriptPath);
    if (cleanScriptPath) {
        const scriptFolder = app.vault.getAbstractFileByPath(String(cleanScriptPath));
        if (!scriptFolder) {
            try {
                await app.vault.createFolder(String(cleanScriptPath));
                createdFolders.push(cleanScriptPath);
                allExist = false;
            } catch (error) {
                new Notice(
                    t('create_folder_failed', plugin) + `: ${cleanScriptPath} - ${error.message}`
                );
                return;
            }
        }
    }
    if (createdFolders.length > 0) {
        new Notice(t('folders_created_success', plugin) + `: ${createdFolders.join(', ')}`);
    } else {
        new Notice(t('all_paths_exist', plugin));
    }
    // 创建成功后刷新输入框状态
    const templateValue = plugin.settings.pathConfig.templateFolderPath;
    const scriptValue = plugin.settings.pathConfig.scriptFolderPath;
    if (templateInput && templateInput.inputEl) {
        const folder = cleanPath(templateValue)
            ? app.vault.getAbstractFileByPath(cleanPath(templateValue))
            : null;
        if (cleanPath(templateValue) && !folder) {
            templateInput.inputEl.classList.add('input-error');
        } else {
            templateInput.inputEl.classList.remove('input-error');
        }
    }
    if (scriptInput && scriptInput.inputEl) {
        const folder = cleanPath(scriptValue)
            ? app.vault.getAbstractFileByPath(cleanPath(scriptValue))
            : null;
        if (cleanPath(scriptValue) && !folder) {
            scriptInput.inputEl.classList.add('input-error');
        } else {
            scriptInput.inputEl.classList.remove('input-error');
        }
    }
}

/**
 * 清理路径，确保符合 Obsidian 的要求。
 * @param path 原始路径
 * @returns 清理后的路径
 */
function cleanPath(path: string | undefined): string {
    if (!path) return '';
    let cleanPath = String(path).replace(/^\/+|\/+$/g, '');
    if (cleanPath.startsWith('.')) {
        cleanPath = cleanPath.substring(1);
    }
    return cleanPath;
}
