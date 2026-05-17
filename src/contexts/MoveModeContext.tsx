import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ButtonConfig, CategoryConfig } from '@/types';
import type { ButtonsPanelPlugin } from '@/types/plugin';

export type MoveModeState =
    | { type: 'none' }
    | { type: 'button'; button: ButtonConfig }
    | { type: 'category'; category: CategoryConfig };

export interface MoveModeContextValue {
    state: MoveModeState;
    enterButtonMoveMode: (button: ButtonConfig) => void;
    enterCategoryMoveMode: (category: CategoryConfig) => void;
    exitMoveMode: () => void;
    isMovingButton: (buttonId: string) => boolean;
    isMovingCategory: (categoryId: string) => boolean;
    moveButtonTo: (targetCategoryId: string, targetIndex: number) => Promise<void>;
    moveCategoryTo: (targetCategoryId: string) => Promise<void>;
}

const MoveModeContext = createContext<MoveModeContextValue | null>(null);

interface MoveModeProviderProps {
    plugin: ButtonsPanelPlugin;
}

export const MoveModeProvider: React.FC<React.PropsWithChildren<MoveModeProviderProps>> = ({
    plugin,
    children,
}) => {
    const [state, setState] = useState<MoveModeState>({ type: 'none' });

    const enterButtonMoveMode = useCallback((button: ButtonConfig) => {
        setState({ type: 'button', button });
    }, []);

    const enterCategoryMoveMode = useCallback((category: CategoryConfig) => {
        setState({ type: 'category', category });
    }, []);

    const exitMoveMode = useCallback(() => {
        setState({ type: 'none' });
    }, []);

    const isMovingButton = useCallback(
        (buttonId: string) => state.type === 'button' && state.button.id === buttonId,
        [state]
    );

    const isMovingCategory = useCallback(
        (categoryId: string) => state.type === 'category' && state.category.id === categoryId,
        [state]
    );

    /**
     * 将正在移动的按钮移动到目标分类的指定位置
     */
    const moveButtonTo = useCallback(
        async (targetCategoryId: string, targetIndex: number) => {
            if (state.type !== 'button') return;
            const movingButton = state.button;

            try {
                const categories = plugin.settings.categories;
                const sourceCategory = categories.find((cat) =>
                    cat.buttons.some((b) => b.id === movingButton.id)
                );
                const targetCategory = categories.find((cat) => cat.id === targetCategoryId);

                if (!sourceCategory || !targetCategory) {
                    console.warn('找不到源分类或目标分类');
                    return;
                }

                // 1. 从源分类中移除按钮
                const sourceIndex = sourceCategory.buttons.findIndex(
                    (b) => b.id === movingButton.id
                );
                if (sourceIndex === -1) return;
                const [buttonToMove] = sourceCategory.buttons.splice(sourceIndex, 1);

                // 2. 插入到目标分类指定位置（越界则追加到末尾）
                if (targetIndex < 0 || targetIndex > targetCategory.buttons.length) {
                    targetCategory.buttons.push(buttonToMove);
                } else {
                    targetCategory.buttons.splice(targetIndex, 0, buttonToMove);
                }

                // 3. 重新排序两个分类的 order
                [sourceCategory, targetCategory].forEach((category) => {
                    category.buttons.forEach((btn, idx) => {
                        btn.order = idx;
                    });
                });

                plugin.activeTabCategoryId = targetCategoryId;
                await plugin.saveSettings();
                // 通知所有视图刷新
                activeDocument.dispatchEvent(new CustomEvent('buttons-panel-refresh'));
            } catch (error) {
                console.error('更新按钮位置时出错:', error);
            } finally {
                exitMoveMode();
            }
        },
        [state, plugin, exitMoveMode]
    );

    /**
     * 将正在移动的分类移动到目标分类之前
     */
    const moveCategoryTo = useCallback(
        async (targetCategoryId: string) => {
            if (state.type !== 'category') return;
            const movingCategory = state.category;

            try {
                const categories = plugin.settings.categories;
                const fromIdx = categories.findIndex((cat) => cat.id === movingCategory.id);
                const toIdx = categories.findIndex((cat) => cat.id === targetCategoryId);

                if (fromIdx === -1 || toIdx === -1) {
                    console.warn('找不到源分类或目标分类（分类移动）');
                    exitMoveMode();
                    return;
                }

                // 点击自身 => 只退出移动模式，不调整顺序
                if (fromIdx === toIdx) {
                    exitMoveMode();
                    // 仍然刷新一下视图，保持和老实现一致
                    activeDocument.dispatchEvent(new CustomEvent('buttons-panel-refresh'));
                    return;
                }

                const [category] = categories.splice(fromIdx, 1);
                categories.splice(toIdx, 0, category);

                // 更新 order
                categories.forEach((cat, idx) => {
                    cat.order = idx;
                });

                await plugin.saveSettings();
                activeDocument.dispatchEvent(new CustomEvent('buttons-panel-refresh'));
            } catch (error) {
                console.error('更新分类位置时出错:', error);
            } finally {
                exitMoveMode();
            }
        },
        [state, plugin, exitMoveMode]
    );

    /**
     * 监听 ESC 键，退出移动模式
     */
    useEffect(() => {
        if (state.type === 'none') return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                e.stopPropagation();
                exitMoveMode();
            }
        };

        // 使用捕获阶段，尽量优先于其他监听
        activeDocument.addEventListener('keydown', handleKeyDown, true);
        return () => {
            activeDocument.removeEventListener('keydown', handleKeyDown, true);
        };
    }, [state.type, exitMoveMode]);

    return (
        <MoveModeContext.Provider
            value={{
                state,
                enterButtonMoveMode,
                enterCategoryMoveMode,
                exitMoveMode,
                isMovingButton,
                isMovingCategory,
                moveButtonTo,
                moveCategoryTo,
            }}
        >
            {children}
        </MoveModeContext.Provider>
    );
};

export function useMoveModeContext(): MoveModeContextValue {
    const ctx = useContext(MoveModeContext);
    if (!ctx) {
        throw new Error('useMoveModeContext must be used within MoveModeProvider');
    }
    return ctx;
}


