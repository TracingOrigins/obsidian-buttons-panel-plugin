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
    /* eslint-disable @typescript-eslint/unbound-method -- 需要保留原方法引用并用 .call(sensor) 调用以保持 dnd-kit 传感器上下文 */
    const originalStart = sensor.handleStart;
    const originalCancel = sensor.handleCancel;
    const originalEnd = sensor.handleEnd;
    /* eslint-enable @typescript-eslint/unbound-method */

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

    const [name, oldHandler, options] = entries[index];
    internal.listeners.target.removeEventListener(name, oldHandler, options);

    const newHandler: EventListener = (event) => {
        scrollAwarePointerHandleMove(
            sensor as ScrollAwarePointerSensorInstance,
            event
        );
    };

    internal.listeners.target.addEventListener(name, newHandler, options);
    entries[index] = [name, newHandler, options];
}
