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
    const originalStart = sensor.handleStart.bind(sensor);
    const originalCancel = sensor.handleCancel.bind(sensor);
    const originalEnd = sensor.handleEnd.bind(sensor);

    sensor.handleStart = () => {
        setPanelTouchDragLock(true);
        originalStart();
    };

    sensor.handleCancel = () => {
        setPanelTouchDragLock(false);
        originalCancel();
    };

    sensor.handleEnd = () => {
        setPanelTouchDragLock(false);
        originalEnd();
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
