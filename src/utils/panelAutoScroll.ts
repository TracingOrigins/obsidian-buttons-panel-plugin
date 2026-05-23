import { AutoScrollActivator, type AutoScrollOptions } from '@dnd-kit/core';

/** 拖拽靠近面板边缘时自动滚动（列表纵滑 / 标签栏横滑） */
export const PANEL_AUTO_SCROLL_OPTIONS: AutoScrollOptions = {
    threshold: { x: 0.12, y: 0.12 },
    acceleration: 10,
    interval: 5,
    activator: AutoScrollActivator.Pointer,
    layoutShiftCompensation: { x: true, y: true },
};
