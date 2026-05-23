import { PointerSensor, type SensorProps, type PointerSensorOptions } from '@dnd-kit/core';
import { patchScrollAwareHandleMove } from '@/sensors/patchScrollAwareHandleMove';

export type ScrollAwarePointerSensorProps = SensorProps<PointerSensorOptions>;

/**
 * 触屏/笔等 pointer 事件：与 ScrollAwareTouchSensor 相同的滚动/长按区分逻辑。
 */
export class ScrollAwarePointerSensor extends PointerSensor {
    constructor(props: ScrollAwarePointerSensorProps) {
        super(props);
        patchScrollAwareHandleMove(this, 'pointermove');
    }
}
