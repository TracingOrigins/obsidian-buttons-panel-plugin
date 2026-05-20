import { pointerWithin, type Collision, type CollisionDetection } from '@dnd-kit/core';
import { parseCategorySortableId } from '@/utils/categoryDragItems';

function pickCategoryCollision(collisions: Collision[]): Collision[] {
    const filtered = collisions.filter((c) => {
        const id = String(c.id);
        return parseCategorySortableId(id) !== null;
    });
    if (filtered.length === 0) return [];
    return [filtered[0]];
}

/** 仅当指针悬停在另一分类上时才命中，避免 closestCenter 在未悬停时换位 */
export const categoryDragCollisionDetection: CollisionDetection = (args) => {
    const activeId = String(args.active.id);
    if (!parseCategorySortableId(activeId)) return [];

    const pointerCollisions = pointerWithin(args);
    if (pointerCollisions.length === 0) return [];

    const withoutActive = pointerCollisions.filter((c) => c.id !== args.active?.id);
    return pickCategoryCollision(withoutActive);
};
