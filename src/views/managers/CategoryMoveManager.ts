// CategoryMoveManager.ts
// 分类移动管理器，负责处理分类的移动逻辑。
import { ButtonsPanelPlugin } from '@/types/plugin';
import { CategoryConfig } from '@/types';
import { ViewStateManager } from './ViewStateManager';
import { refreshAllSettingsViews } from '@/utils/obsidian';

/**
 * CategoryMoveManager 分类移动管理器。
 * 负责处理分类的移动、顺序调整、事件监听等逻辑。
 * 遵循单一职责原则，只负责分类移动功能。
 */
export class CategoryMoveManager {
    private plugin: ButtonsPanelPlugin;
    private stateManager: ViewStateManager;

    /**
     * 构造函数，初始化插件和状态管理器。
     * @param plugin 插件主类实例
     * @param stateManager 视图状态管理器
     */
    constructor(plugin: ButtonsPanelPlugin, stateManager: ViewStateManager) {
        this.plugin = plugin;
        this.stateManager = stateManager;
    }

    /**
     * 开始分类移动模式，设置移动状态。
     * @param category 当前移动的分类对象
     */
    startCategoryMoveMode(category: CategoryConfig): void {
        const moveCategoryState = this.stateManager.getMoveCategoryState();
        moveCategoryState.isMoving = true;
        moveCategoryState.movingCategory = category;
        this.stateManager.setMoveCategoryState(moveCategoryState);
    }

    /**
     * 结束分类移动模式，重置状态并触发视图刷新。
     */
    endCategoryMoveMode(): void {
        this.stateManager.resetMoveCategoryState();
        // 触发视图刷新
        document.dispatchEvent(new CustomEvent('buttons-panel-refresh'));
    }

    /**
     * 移动分类到目标位置，调整顺序并保存。
     * @param category 当前移动的分类对象
     * @param targetCategoryId 目标分类ID
     */
    moveCategoryTo(category: CategoryConfig, targetCategoryId: string): void {
        const categories = this.plugin.settings.categories;
        const fromIdx = categories.findIndex((cat) => cat.id === category.id);
        const toIdx = categories.findIndex((cat) => cat.id === targetCategoryId);

        if (fromIdx === -1 || toIdx === -1 || fromIdx === toIdx) return;

        // 移动分类
        categories.splice(fromIdx, 1);
        categories.splice(toIdx, 0, category);

        // 更新 order
        categories.forEach((cat, idx) => (cat.order = idx));

        this.plugin.saveSettings();

        // 移动后刷新所有设置页面
        refreshAllSettingsViews(this.plugin.app);
    }

    /**
     * 处理分类移动点击事件。
     * @param category 当前移动的分类对象
     * @param targetCategory 目标分类对象
     */
    handleCategoryMoveClick(category: CategoryConfig, targetCategory: CategoryConfig): void {
        if (category.id === targetCategory.id) {
            // 点击自己，直接退出移动模式
            this.endCategoryMoveMode();
            // 触发视图刷新
            document.dispatchEvent(new CustomEvent('buttons-panel-refresh'));
            return;
        }

        this.moveCategoryTo(category, targetCategory.id);
        this.endCategoryMoveMode();
        // 触发视图刷新
        document.dispatchEvent(new CustomEvent('buttons-panel-refresh'));
    }
}
