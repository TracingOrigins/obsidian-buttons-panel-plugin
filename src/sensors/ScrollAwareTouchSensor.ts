import { TouchSensor, type SensorProps, type TouchSensorOptions } from '@dnd-kit/core';
import { patchScrollAwareHandleMove } from '@/sensors/patchScrollAwareHandleMove';

export type ScrollAwareTouchSensorProps = SensorProps<TouchSensorOptions>;

/**
 * 移动端触摸传感器：长按后才拖拽；滑动意图（纵/横向为主）时取消长按，保留原生滚动。
 */
export class ScrollAwareTouchSensor extends TouchSensor {
    constructor(props: ScrollAwareTouchSensorProps) {
        super(props);
        patchScrollAwareHandleMove(this, 'touchmove');
    }
}
