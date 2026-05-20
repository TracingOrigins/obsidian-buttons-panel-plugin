import { useCallback } from 'react';
import { useButtonActions } from './useButtonActions';
import type { ButtonConfig } from '@/types';

/**
 * useButtonClickHandler Hook
 *
 * 封装按钮点击处理逻辑。
 */
export function useButtonClickHandler(button: ButtonConfig) {
    const { executeButtonActions } = useButtonActions();

    const handleButtonClick = useCallback(() => {
        void executeButtonActions(button);
    }, [button, executeButtonActions]);

    return handleButtonClick;
}
