import type { App } from 'obsidian';
import { WorkspaceLeaf } from 'obsidian';
import type { ButtonsPanelPlugin } from '@/types/plugin';

// obsidian.ts
// Obsidian 相关工具函数（仅保留当前仍在使用的部分）。

/**
 * 获取最后激活的内容标签页（排除指定 viewType，如按钮面板，且仅返回 markdown leaf）。
 * 用于在执行命令/脚本等动作前，把焦点切回正文区域，避免动作在面板 leaf 上执行异常。
 *
 * @param app Obsidian 应用实例
 * @param excludeViewType 要排除的 viewType（如 'buttons-panel-view'）
 * @param lastActiveLeaf 当前记录的 leaf（可选，优先使用）
 */
export function getLastActiveContentLeaf(
    app: App,
    excludeViewType: string,
    lastActiveLeaf?: WorkspaceLeaf | null
): WorkspaceLeaf | null {
    // 优先使用传入的 lastActiveLeaf（必须是 markdown 且非排除 viewType）
    if (
        lastActiveLeaf &&
        lastActiveLeaf.view &&
        typeof lastActiveLeaf.view.getViewType === 'function' &&
        lastActiveLeaf.view.getViewType() !== excludeViewType &&
        lastActiveLeaf.view.getViewType() === 'markdown'
    ) {
        return lastActiveLeaf;
    }

    // 兜底：遍历 workspace 的所有 leaf，返回第一个 markdown 且非 excludeViewType 的 leaf
    const workspaceAny = app.workspace as unknown as {
        getLeavesOfType?: (type: string) => WorkspaceLeaf[];
        getLeavesOfTypeEmpty?: (type: string) => WorkspaceLeaf[];
        getLeavesOfTypeAll?: (type: string) => WorkspaceLeaf[];
    };

    const allLeaves = workspaceAny.getLeavesOfType?.('') ?? [];
    if (Array.isArray(allLeaves)) {
        for (const leaf of allLeaves) {
            if (
                leaf &&
                leaf.view &&
                typeof leaf.view.getViewType === 'function' &&
                leaf.view.getViewType() !== excludeViewType &&
                leaf.view.getViewType() === 'markdown'
            ) {
                return leaf;
            }
        }
    }

    return null;
}

/**
 * 获取安全的最后激活内容叶子节点（排除按钮面板）
 * 这是一个便捷函数，封装了从插件实例获取 lastActiveContentLeaf 的逻辑
 *
 * @param app Obsidian 应用实例
 * @param plugin 插件主类实例（可选）
 * @returns WorkspaceLeaf | null
 */
export function getSafeLastContentLeaf(
    app: App,
    plugin?: ButtonsPanelPlugin
): WorkspaceLeaf | null {
    const safeLastLeaf =
        plugin?.lastActiveContentLeaf instanceof WorkspaceLeaf
            ? plugin.lastActiveContentLeaf
            : null;
    return getLastActiveContentLeaf(app, 'buttons-panel-view', safeLastLeaf);
}


