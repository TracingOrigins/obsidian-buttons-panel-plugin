import { App, Setting, Notice, TextComponent, normalizePath } from 'obsidian';
import { ButtonsPanelPlugin } from '@/types/plugin';
import { t } from '@/utils/i18n';
import { FolderInputSuggest } from '@/components/suggest/FolderInputSuggest';

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
    const path = containerEl.createDiv('settings-path');

    // 路径验证函数
    const validatePath = (path: string): boolean => {
        const normalizedPath = normalizePath(path);
        return normalizedPath ? !!app.vault.getFolderByPath(normalizedPath) : true;
    };

    // 更新输入框错误状态
    const updateInputErrorState = (input: TextComponent, path: string) => {
        const normalizedPath = normalizePath(path);
        if (normalizedPath && !validatePath(path)) {
            input.inputEl.classList.add('input-error');
        } else {
            input.inputEl.classList.remove('input-error');
        }
    };

    // 创建路径输入设置
    const createPathInput = (
        name: string,
        desc: string,
        placeholder: string,
        getValue: () => string,
        setValue: (value: string) => void
    ) => {
        const wrapper = containerEl.createDiv({ cls: 'path-input-wrapper' });
        const input = new TextComponent(wrapper)
            .setPlaceholder(placeholder)
            .setValue(getValue());

        // 初始化时验证路径
        updateInputErrorState(input, getValue());

        const setting = new Setting(path).setName(name).setDesc(desc);
        setting.controlEl.appendChild(wrapper);

        // 附加文件夹路径下拉建议
        const suggest = new FolderInputSuggest(app, input.inputEl);
        suggest.onSelect((folderPath, _evt) => {
            input.setValue(folderPath);
            setValue(folderPath);
            void plugin.saveSettings();
            updateInputErrorState(input, folderPath);
            suggest.close();
        });

        input.onChange(async (value) => {
            setValue(value);
            await plugin.saveSettings();
            updateInputErrorState(input, value);
        });

        return input;
    };

    // 模板文件夹路径设置
    const templateInput = createPathInput(
        t('template_folder'),
        t('template_folder_desc'),
        t('template_folder_placeholder'),
        () => plugin.settings.pathConfig.templateFolderPath ?? '',
        (value) => {
            plugin.settings.pathConfig.templateFolderPath = value;
        }
    );

    // 脚本文件夹路径设置
    const scriptInput = createPathInput(
        t('script_folder'),
        t('script_folder_desc'),
        t('script_folder_placeholder'),
        () => plugin.settings.pathConfig.scriptFolderPath ?? '',
        (value) => {
            plugin.settings.pathConfig.scriptFolderPath = value;
        }
    );

    // 路径验证和创建按钮
    new Setting(path)
        .setName(t('create_paths'))
        .setDesc(t('create_paths_desc'))
        .addButton((button) => {
            button
                .setButtonText(t('create_paths'))
                .setClass('mod-warning')
                .onClick(() => {
                    void createPathsOnly(plugin, app, templateInput, scriptInput);
                });

            return button;
        });
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
    const paths = [
        { path: plugin.settings.pathConfig.templateFolderPath, input: templateInput },
        { path: plugin.settings.pathConfig.scriptFolderPath, input: scriptInput }
    ];

    const createdFolders: string[] = [];

    // 创建文件夹
    for (const { path } of paths) {
        const normalizedPath = normalizePath(path || '');
        if (normalizedPath) {
            const folder = app.vault.getFolderByPath(normalizedPath);
            if (!folder) {
                try {
                    await app.vault.createFolder(normalizedPath);
                    createdFolders.push(normalizedPath);
                } catch (error) {
                    const errorMessage =
                        error instanceof Error ? error.message : String(error);
                    new Notice(
                        t('create_folder_failed') +
                            `: ${normalizedPath} - ${errorMessage}`
                    );
                    return;
                }
            }
        }
    }

    // 显示结果通知
    if (createdFolders.length > 0) {
        new Notice(t('folders_created_success') + `: ${createdFolders.join(', ')}`);
    } else {
        new Notice(t('all_paths_exist'));
    }

    // 刷新输入框状态
    for (const { path, input } of paths) {
        if (!input?.inputEl) continue;
        const normalizedPath = normalizePath(path || '');
        const folder = normalizedPath ? app.vault.getFolderByPath(normalizedPath) : null;
        if (normalizedPath && !folder) {
            input.inputEl.classList.add('input-error');
        } else {
            input.inputEl.classList.remove('input-error');
        }
    }
}


