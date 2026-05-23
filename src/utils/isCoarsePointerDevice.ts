/** 是否为触屏等粗指针设备（用于仅注册 Touch 传感器，避免与 Pointer 冲突） */
export function isCoarsePointerDevice(): boolean {
    if (typeof window === 'undefined') {
        return false;
    }
    return window.matchMedia('(pointer: coarse)').matches;
}
