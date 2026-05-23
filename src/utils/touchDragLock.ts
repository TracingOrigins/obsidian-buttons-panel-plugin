/** 拖拽进行中：锁定触摸行为，避免 pan-y/pan-x 与 dnd-kit 纵向拖放冲突 */
export const PANEL_TOUCH_DRAG_LOCK_CLASS = 'buttons-panel-is-dragging';

export function setPanelTouchDragLock(locked: boolean): void {
    const targets = activeDocument.querySelectorAll(
        '.buttons-panel, .view-content.buttons-panel'
    );
    targets.forEach((el) => {
        el.classList.toggle(PANEL_TOUCH_DRAG_LOCK_CLASS, locked);
    });
}
