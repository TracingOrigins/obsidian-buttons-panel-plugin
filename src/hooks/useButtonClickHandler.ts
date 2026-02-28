import { useCallback } from 'react';
import { useMoveModeContext } from '@/contexts/MoveModeContext';
import { useButtonActions } from './useButtonActions';
import type { ButtonConfig, CategoryConfig } from '@/types';

/**
 * useButtonClickHandler Hook
 * 
 * 封装按钮点击处理逻辑，统一处理移动模式和正常点击模式。
 * 
 * @param button 按钮配置对象
 * @param category 按钮所属的分类
 * @param index 按钮在分类中的索引
 * @returns 按钮点击处理函数
 */
export function useButtonClickHandler(
    button: ButtonConfig,
    category: CategoryConfig,
    index: number
) {
    const moveMode = useMoveModeContext();
    const { executeButtonActions } = useButtonActions();

    const handleButtonClick = useCallback(() => {
        const isButtonMoveMode = moveMode.state.type === 'button';
        const movingButtonId =
            moveMode.state.type === 'button' ? moveMode.state.button.id : null;

        if (isButtonMoveMode) {
            if (!movingButtonId) return;
            // 点击自身 => 退出移动模式，不调整顺序
            if (movingButtonId === button.id) {
                moveMode.exitMoveMode();
                return;
            }
            void moveMode.moveButtonTo(category.id, index);
            return;
        }
        void executeButtonActions(button);
    }, [button, category, index, moveMode, executeButtonActions]);

    return handleButtonClick;
}

