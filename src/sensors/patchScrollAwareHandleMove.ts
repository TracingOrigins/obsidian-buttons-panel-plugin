import {
    scrollAwarePointerHandleMove,
    type ScrollAwarePointerSensorInstance,
} from '@/sensors/scrollAwarePointerHandleMove';
import { setPanelTouchDragLock } from '@/utils/touchDragLock';

type ListenerEntry = [
    string,
    EventListener,
    AddEventListenerOptions | boolean | undefined,
];

interface SensorListeners {
    target: EventTarget;
    listeners: ListenerEntry[];
}

interface SensorLifecycle {
    handleStart(): void;
    handleCancel(): void;
    handleEnd(): void;
}

function patchSensorLifecycle(sensor: SensorLifecycle): void {
    // 必须直接复制方法引用；闭包捕获会读到被替换后的 wrapper 导致无限递归
    // eslint-disable-next-line @typescript-eslint/unbound-method -- patching dnd-kit sensor requires saving original method reference
    const originalStart = sensor.handleStart;
    // eslint-disable-next-line @typescript-eslint/unbound-method -- patching dnd-kit sensor requires saving original method reference
    const originalCancel = sensor.handleCancel;
    // eslint-disable-next-line @typescript-eslint/unbound-method -- patching dnd-kit sensor requires saving original method reference
    const originalEnd = sensor.handleEnd;

    sensor.handleStart = () => {
        setPanelTouchDragLock(true);
        originalStart.call(sensor);
    };

    sensor.handleCancel = () => {
        setPanelTouchDragLock(false);
        originalCancel.call(sensor);
    };

    sensor.handleEnd = () => {
        setPanelTouchDragLock(false);
        originalEnd.call(sensor);
    };
}

/**
 * 替换 dnd-kit 传感器已注册的 move 监听，注入滚动/长按区分逻辑。
 */
export function patchScrollAwareHandleMove(
    sensor: unknown,
    moveEventName: 'touchmove' | 'pointermove'
): void {
    patchSensorLifecycle(sensor as SensorLifecycle);

    const internal = sensor as {
        listeners: SensorListeners;
    };
    const entries = internal.listeners.listeners;
    const index = entries.findIndex(([name]) => name === moveEventName);
    if (index < 0) {
        return;
    }

    const [name, oldHandler, options] = entries[index] as ListenerEntry;
    internal.listeners.target.removeEventListener(name, oldHandler, options);

    const newHandler: EventListener = (event) => {
        scrollAwarePointerHandleMove(
            sensor as ScrollAwarePointerSensorInstance,
            event
        );
    };

    internal.listeners.target.addEventListener(name, newHandler, options);
    entries[index] = [name, newHandler, options] as ListenerEntry;

    // 保存传感器监听目标，供 hover-expand nudge 使用
    window.__dndSensorTarget = internal.listeners.target;
}
