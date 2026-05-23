import { pointerWithin, type Collision, type CollisionDetection } from '@dnd-kit/core';
import { CONTAINER_PREFIX, TAB_PREFIX } from '@/utils/buttonDragItems';
import { parseCategorySortableId } from '@/utils/categoryDragItems';

function isZoneDroppableId(id: string): boolean {
    return id.startsWith(CONTAINER_PREFIX) || id.startsWith(TAB_PREFIX);
}

function isButtonSortableId(id: string): boolean {
    return !isZoneDroppableId(id) && parseCategorySortableId(id) === null;
}

/** 按钮 > 标签 > 容器；排除分类排序项，避免与按钮争抢命中 */
function pickPrimaryCollision(collisions: Collision[]): Collision[] {
    if (collisions.length === 0) return [];

    const overButtons = collisions.filter((c) => isButtonSortableId(String(c.id)));
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
