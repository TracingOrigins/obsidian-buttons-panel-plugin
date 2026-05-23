import type { PointerActivationConstraint } from '@dnd-kit/core';
import { getEventCoordinates, subtract } from '@dnd-kit/utilities';
import { shouldCancelActivationForScroll } from '@/utils/touchScrollActivation';

const defaultCoordinates = { x: 0, y: 0 };

type PointerDelta = { x: number; y: number };

export interface ScrollAwarePointerSensorInstance {
    activated: boolean;
    initialCoordinates?: PointerDelta;
    props: {
        onMove: (coordinates: PointerDelta) => void;
        options: {
            activationConstraint?: PointerActivationConstraint;
        };
    };
    handleStart(): void;
    handleCancel(): void;
    handlePending(constraint: PointerActivationConstraint, offset?: PointerDelta): void;
}

function isDelayConstraint(
    constraint: PointerActivationConstraint
): constraint is { delay: number; tolerance: number } {
    return 'delay' in constraint;
}

function isDistanceConstraint(
    constraint: PointerActivationConstraint
): constraint is { distance: number; tolerance?: number } {
    return 'distance' in constraint;
}

function hasExceededDistance(delta: PointerDelta, measurement: number): boolean {
    const dx = Math.abs(delta.x);
    const dy = Math.abs(delta.y);
    return Math.sqrt(dx * dx + dy * dy) > measurement;
}

/**
 * 在 dnd-kit AbstractPointerSensor.handleMove 基础上：
 * 长按未激活时，以「主方向滑动」取消激活，避免与面板/标签栏原生滚动冲突。
 */
export function scrollAwarePointerHandleMove(
    sensor: ScrollAwarePointerSensorInstance,
    event: Event
): void {
    const { activated, initialCoordinates, props } = sensor;
    const {
        onMove,
        options: { activationConstraint },
    } = props;

    if (!initialCoordinates) {
        return;
    }

    const coordinates = getEventCoordinates(event) ?? defaultCoordinates;
    const delta = subtract(initialCoordinates, coordinates);

    if (!activated && activationConstraint) {
        if (isDistanceConstraint(activationConstraint)) {
            if (
                activationConstraint.tolerance != null &&
                hasExceededDistance(delta, activationConstraint.tolerance)
            ) {
                sensor.handleCancel();
                return;
            }

            if (hasExceededDistance(delta, activationConstraint.distance)) {
                sensor.handleStart();
                return;
            }
        }

        if (isDelayConstraint(activationConstraint)) {
            if (shouldCancelActivationForScroll(delta)) {
                sensor.handleCancel();
                return;
            }
        }

        sensor.handlePending(activationConstraint, delta);
        return;
    }

    if (event.cancelable) {
        event.preventDefault();
    }

    onMove(coordinates);
}
