/** 长按激活拖拽前的等待时间（毫秒） */
export const MOBILE_LONG_PRESS_DELAY_MS = 500;

/** 判定为滚动手势的最小位移（像素） */
export const SCROLL_CANCEL_DISTANCE_PX = 10;

/**
 * 在未进入拖拽前，若位移更像滚动（纵向或横向为主），则取消长按并交还给原生滚动。
 */
export function shouldCancelActivationForScroll(
    delta: { x: number; y: number },
    threshold = SCROLL_CANCEL_DISTANCE_PX
): boolean {
    const dx = Math.abs(delta.x);
    const dy = Math.abs(delta.y);

    if (dy > threshold && dy > dx) {
        return true;
    }

    if (dx > threshold && dx > dy) {
        return true;
    }

    return false;
}
