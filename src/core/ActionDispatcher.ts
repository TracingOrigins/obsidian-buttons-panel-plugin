import { App, Notice } from 'obsidian';
import { ButtonAction } from '@/common/types';
import { ButtonsPanelPlugin } from '@/common/types/plugin';
import { t } from '@/common/utils/i18n';
import { FileService } from '@/services/FileService';
import { CreateFileService } from '@/services/CreateFileService';
import { CommandService } from '@/services/CommandService';
import { UrlService } from '@/services/UrlService';
import { ScriptService } from '@/services/ScriptService';

/**
 * 动作调度器类，负责统一调度和执行所有类型的按钮动作。
 * 通过依赖各 Service 层实现具体业务逻辑，解耦表单配置与实际执行。
 * 支持顺序/并行执行、错误中断、动作间延迟等功能。
 */
export class ActionDispatcher {
    private fileService: FileService;
    private createFileService: CreateFileService;
    private commandService: CommandService;
    private urlService: UrlService;
    private scriptService: ScriptService;

    /**
     * 构造函数，初始化各业务 Service 实例。
     * @param app Obsidian 应用实例
     * @param plugin 插件主类实例
     */
    constructor(
        private app: App,
        private plugin?: ButtonsPanelPlugin
    ) {
        this.fileService = new FileService(app, plugin);
        this.createFileService = new CreateFileService(app, plugin);
        this.commandService = new CommandService(app, plugin);
        this.urlService = new UrlService(app, plugin);
        this.scriptService = new ScriptService(app, plugin);
    }

    /**
     * 执行一组按钮动作（支持顺序或并行）。
     * @param actions 按钮动作数组
     * @param executionMode 执行模式（'sequential' 顺序，'parallel' 并行）
     * @param stopOnError 是否遇到错误时中断（仅顺序模式有效）
     * @param delayBetweenActions 动作间延迟（毫秒，仅顺序模式有效）
     */
    async executeActions(
        actions: ButtonAction[],
        executionMode: 'sequential' | 'parallel' = 'sequential',
        stopOnError: boolean = true,
        delayBetweenActions: number = 0
    ): Promise<void> {
        if (!actions || actions.length === 0) {
            new Notice(t('no_actions_in_sequence', this.plugin));
            return;
        }
        if (executionMode === 'parallel') {
            // 并行执行所有动作
            const promises = actions.map((action) => this.executeSingleAction(action));
            await Promise.all(promises);
        } else {
            // 顺序执行，每个动作可配置延迟，遇到错误可选择是否中断
            for (let i = 0; i < actions.length; i++) {
                try {
                    await this.executeSingleAction(actions[i]);
                    if (i < actions.length - 1 && delayBetweenActions) {
                        await new Promise((resolve) => setTimeout(resolve, delayBetweenActions));
                    }
                } catch (error) {
                    console.error(`执行动作序列中的第 ${i + 1} 个动作时出错:`, error);
                    if (stopOnError) {
                        new Notice(
                            t('sequence_stopped_on_error', this.plugin) + `: ${error.message}`
                        );
                        break;
                    } else {
                        new Notice(
                            t('action_in_sequence_failed', this.plugin) + `: ${error.message}`
                        );
                    }
                }
            }
        }
    }

    /**
     * 执行单个按钮动作，根据类型分发到对应 Service。
     * @param action 按钮动作对象
     */
    private async executeSingleAction(action: ButtonAction): Promise<void> {
        switch (action.type) {
            case 'file':
                await this.fileService.openFile(action);
                break;
            case 'command':
                await this.commandService.executeCommand(action);
                break;
            case 'url':
                await this.urlService.openUrl(action);
                break;
            case 'create_file':
                await this.createFileService.createFile(action);
                break;
            case 'script':
                await this.scriptService.runScript(action);
                break;
            default:
                // 理论上不会到这里，除非类型未注册
                return;
        }
    }
}
