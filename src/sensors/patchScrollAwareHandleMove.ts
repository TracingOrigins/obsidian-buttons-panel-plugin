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
    const handleStart = () => sensor.handleStart();
    const handleCancel = () => sensor.handleCancel();
    const handleEnd = () => sensor.handleEnd();

    sensor.handleStart = () => {
        setPanelTouchDragLock(true);
        handleStart();
    };

    sensor.handleCancel = () => {
        setPanelTouchDragLock(false);
        handleCancel();
    };

    sensor.handleEnd = () => {
        setPanelTouchDragLock(false);
        handleEnd();
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
