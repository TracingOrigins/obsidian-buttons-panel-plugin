import { pointerWithin, type Collision, type CollisionDetection } from '@dnd-kit/core';
import { CONTAINER_PREFIX, TAB_PREFIX } from '@/utils/buttonDragItems';

function isZoneDroppableId(id: string): boolean {
    return id.startsWith(CONTAINER_PREFIX) || id.startsWith(TAB_PREFIX);
}

/** 只保留一个碰撞目标，避免多目标交替触发换位闪烁 */
function pickPrimaryCollision(collisions: Collision[]): Collision[] {
    if (collisions.length === 0) return [];

    const overButtons = collisions.filter((c) => !isZoneDroppableId(String(c.id)));
    if (overButtons.length > 0) {
        return [overButtons[0]];
    }

    const tab = collisions.find((c) => String(c.id).startsWith(TAB_PREFIX));
    if (tab) return [tab];

    const container = collisions.find((c) => String(c.id).startsWith(CONTAINER_PREFIX));
    if (container) return [container];

    return [collisions[0]];
}

/** 指针悬停按钮时优先命中该按钮；无按钮命中时不回退 closestCenter，避免误触容器区 */
export const buttonDragCollisionDetection: CollisionDetection = (args) => {
    const pointerCollisions = pointerWithin(args);

    if (pointerCollisions.length > 0) {
        const withoutActive = pointerCollisions.filter((c) => c.id !== args.active?.id);
        return pickPrimaryCollision(withoutActive);
    }

    return [];
};
