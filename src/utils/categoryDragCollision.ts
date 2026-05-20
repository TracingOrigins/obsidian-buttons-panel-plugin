import {
    pointerWithin,
    type ClientRect,
    type Collision,
    type CollisionDetection,
    type DroppableContainer,
} from '@dnd-kit/core';
import { parseCategorySortableId } from '@/utils/categoryDragItems';

function getRect(container: DroppableContainer): ClientRect | null {
    return container.rect.current;
}

function sortCategoryContainers(containers: DroppableContainer[]): DroppableContainer[] {
    return [...containers].sort((a, b) => {
        const ra = getRect(a);
        const rb = getRect(b);
        if (!ra || !rb) return 0;
        const rowDelta = ra.top - rb.top;
        if (Math.abs(rowDelta) > 4) return rowDelta;
        return ra.left - rb.left;
    });
}

function isSameRow(a: ClientRect, b: ClientRect): boolean {
    const threshold = Math.min(a.height, b.height) * 0.5;
    return Math.abs(a.top - b.top) <= threshold;
}

/** 水平方向：需越过目标标签中线才触发换位（与从左拖入长标签一致） */
function passesHorizontalMidpoint(
    activeIndex: number,
    overIndex: number,
    pointerX: number,
    overMidX: number
): boolean {
    if (activeIndex < overIndex) {
        return pointerX >= overMidX;
    }
    if (activeIndex > overIndex) {
        return pointerX <= overMidX;
    }
    return false;
}

/** 垂直方向（多行换行时跨行）：需越过目标中线才触发 */
function passesVerticalMidpoint(
    activeIndex: number,
    overIndex: number,
    pointerY: number,
    overMidY: number
): boolean {
    if (activeIndex < overIndex) {
        return pointerY >= overMidY;
    }
    if (activeIndex > overIndex) {
        return pointerY <= overMidY;
    }
    return false;
}

function resolveMidpointCategoryCollision(
    args: Parameters<CollisionDetection>[0],
    axis: 'horizontal' | 'grid'
): Collision[] {
    const activeId = String(args.active.id);
    if (!parseCategorySortableId(activeId)) return [];

    const pointer = args.pointerCoordinates;
    if (!pointer) return [];

    const hits = pointerWithin(args).filter(
        (c) => parseCategorySortableId(String(c.id)) && c.id !== args.active?.id
    );
    if (hits.length === 0) return [];

    const sortableContainers = sortCategoryContainers(
        args.droppableContainers.filter((c) => parseCategorySortableId(String(c.id)))
    );

    const activeContainer = sortableContainers.find((c) => c.id === args.active.id);
    const overContainer = args.droppableContainers.find((c) => c.id === hits[0].id);
    if (!activeContainer || !overContainer) return [];

    const activeIndex = sortableContainers.findIndex((c) => c.id === activeContainer.id);
    const overIndex = sortableContainers.findIndex((c) => c.id === overContainer.id);
    if (activeIndex === -1 || overIndex === -1 || activeIndex === overIndex) return [];

    const overRect = getRect(overContainer);
    const activeRect = getRect(activeContainer);
    if (!overRect) return [];

    const useHorizontal =
        axis === 'horizontal' || (axis === 'grid' && activeRect && isSameRow(activeRect, overRect));

    if (useHorizontal) {
        const overMidX = overRect.left + overRect.width / 2;
        if (!passesHorizontalMidpoint(activeIndex, overIndex, pointer.x, overMidX)) {
            return [];
        }
    } else {
        const overMidY = overRect.top + overRect.height / 2;
        if (!passesVerticalMidpoint(activeIndex, overIndex, pointer.y, overMidY)) {
            return [];
        }
    }

    return [hits[0]];
}

function pickCategoryCollision(collisions: Collision[]): Collision[] {
    const filtered = collisions.filter((c) => {
        const id = String(c.id);
        return parseCategorySortableId(id) !== null;
    });
    if (filtered.length === 0) return [];
    return [filtered[0]];
}

/** 列表视图：指针进入分类区域即命中 */
export const categoryDragCollisionDetection: CollisionDetection = (args) => {
    const activeId = String(args.active.id);
    if (!parseCategorySortableId(activeId)) return [];

    const pointerCollisions = pointerWithin(args);
    if (pointerCollisions.length === 0) return [];

    const withoutActive = pointerCollisions.filter((c) => c.id !== args.active?.id);
    return pickCategoryCollision(withoutActive);
};

/** 单行标签栏：水平中线换位 */
export const categoryHorizontalTabDragCollision: CollisionDetection = (args) =>
    resolveMidpointCategoryCollision(args, 'horizontal');

/** 多行换行标签栏：同行用水平中线，跨行用垂直中线 */
export const categoryGridTabDragCollision: CollisionDetection = (args) =>
    resolveMidpointCategoryCollision(args, 'grid');
