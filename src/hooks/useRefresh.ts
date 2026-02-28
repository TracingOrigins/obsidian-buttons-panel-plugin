import { useCallback } from 'react';

/**
 * useRefresh Hook
 * 
 * 封装刷新逻辑，提供统一的刷新接口。
 * 触发 'buttons-panel-refresh' 事件来刷新按钮面板。
 * 
 * @returns 刷新函数
 */
export function useRefresh() {
    /**
     * 触发按钮面板刷新
     */
    const refresh = useCallback(() => {
        document.dispatchEvent(new CustomEvent('buttons-panel-refresh'));
    }, []);

    return {
        refresh,
    };
}

