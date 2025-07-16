// ViewStateManager.ts
// 视图状态管理器，负责管理面板的各种运行时状态。
import { ButtonsPanelPlugin } from '@/common/types/plugin';
import { ButtonConfig, CategoryConfig } from '@/common/types';

/**
 * ViewStateManager 视图状态管理器。
 * 负责管理面板的渲染状态、按钮移动状态、分类移动状态、标签页状态等。
 * 遵循单一职责原则，只负责视图状态管理。
 */
export class ViewStateManager {
    private plugin: ButtonsPanelPlugin;
    // 渲染状态
    private renderTimeout: number | null = null;
    private isRendering = false;
    // 按钮移动状态
    private moveState = {
        isMoving: false,
        movingButton: null as ButtonConfig | null,
        movingElement: null as HTMLElement | null,
        moveIndicator: null as HTMLElement | null,
    };
    // 分类移动状态
    private moveCategoryState = {
        isMoving: false,
        movingCategory: null as CategoryConfig | null,
    };
    // 标签页状态
    private activeTabId: string | null = null;

    /**
     * 构造函数，初始化状态管理器。
     * @param plugin 插件主类实例
     */
    constructor(plugin: ButtonsPanelPlugin) {
        this.plugin = plugin;
    }

    // 渲染状态管理
    /** 获取是否正在渲染 */
    getIsRendering(): boolean {
        return this.isRendering;
    }
    /** 设置渲染状态 */
    setIsRendering(rendering: boolean): void {
        this.isRendering = rendering;
    }
    /** 获取渲染防抖定时器 */
    getRenderTimeout(): number | null {
        return this.renderTimeout;
    }
    /** 设置渲染防抖定时器 */
    setRenderTimeout(timeout: number | null): void {
        this.renderTimeout = timeout;
    }

    // 按钮移动状态管理
    /** 获取按钮移动状态对象 */
    getMoveState() {
        return this.moveState;
    }
    /** 设置按钮移动状态对象 */
    setMoveState(state: typeof this.moveState): void {
        this.moveState = { ...state };
    }

    // 分类移动状态管理
    /** 获取分类移动状态对象 */
    getMoveCategoryState() {
        return this.moveCategoryState;
    }
    /** 设置分类移动状态对象 */
    setMoveCategoryState(state: typeof this.moveCategoryState): void {
        this.moveCategoryState = { ...state };
    }

    // 标签页状态管理
    /** 获取当前激活的标签ID */
    getActiveTabId(): string | null {
        return this.activeTabId;
    }
    /** 设置当前激活的标签ID */
    setActiveTabId(tabId: string | null): void {
        this.activeTabId = tabId;
    }

    // 状态重置
    /** 重置按钮移动状态 */
    resetMoveState(): void {
        this.moveState = {
            isMoving: false,
            movingButton: null,
            movingElement: null,
            moveIndicator: null,
        };
    }
    /** 重置分类移动状态 */
    resetMoveCategoryState(): void {
        this.moveCategoryState = {
            isMoving: false,
            movingCategory: null,
        };
    }

    // 状态检查
    /** 是否处于按钮移动模式 */
    isInMoveMode(): boolean {
        return this.moveState.isMoving;
    }
    /** 是否处于分类移动模式 */
    isInCategoryMoveMode(): boolean {
        return this.moveCategoryState.isMoving;
    }
    /** 是否处于任意移动模式 */
    isInAnyMoveMode(): boolean {
        return this.isInMoveMode() || this.isInCategoryMoveMode();
    }
}
