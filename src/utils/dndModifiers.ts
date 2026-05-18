import type { Modifier } from '@dnd-kit/core';
import { getEventCoordinates } from '@dnd-kit/utilities';

const IDENTITY_TRANSFORM = { x: 0, y: 0, scaleX: 1, scaleY: 1 };

/** 将拖拽预览中心对齐到指针（按下点），而非保持按下点在元素内的相对位置 */
export const snapCenterToCursor: Modifier = ({
    activatorEvent,
    draggingNodeRect,
    activeNodeRect,
    transform,
}) => {
    const base = transform ?? IDENTITY_TRANSFORM;
    const nodeRect = draggingNodeRect ?? activeNodeRect;

    if (!nodeRect || !activatorEvent) {
        return base;
    }

    const activatorCoordinates = getEventCoordinates(activatorEvent);
    if (!activatorCoordinates) {
        return base;
    }

    const offsetX = activatorCoordinates.x - nodeRect.left;
    const offsetY = activatorCoordinates.y - nodeRect.top;

    return {
        ...base,
        x: base.x + offsetX - nodeRect.width / 2,
        y: base.y + offsetY - nodeRect.height / 2,
    };
};
