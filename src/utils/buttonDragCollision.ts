import { pointerWithin, closestCorners, type Collision, type CollisionDetection } from '@dnd-kit/core';
import { CONTAINER_PREFIX, TAB_PREFIX, TITLE_PREFIX } from '@/utils/buttonDragItems';
import { parseCategorySortableId } from '@/utils/categoryDragItems';

function isZoneDroppableId(id: string): boolean {
    return id.startsWith(CONTAINER_PREFIX) || id.startsWith(TAB_PREFIX) || id.startsWith(TITLE_PREFIX);
}

function isButtonSortableId(id: string): boolean {
    return !isZoneDroppableId(id) && parseCategorySortableId(id) === null;
}

/** 按钮 > 标题区 > 标签 > 容器；分类排序项不参与按钮拖拽碰撞 */
function pickPrimaryCollision(collisions: Collision[]): Collision[] {
    if (collisions.length === 0) return [];

    const overButtons = collisions.filter((c) => isButtonSortableId(String(c.id)));
    if (overButtons.length > 0) {
        return [overButtons[0]!];
    }

    const title = collisions.find((c) => String(c.id).startsWith(TITLE_PREFIX));
    if (title) return [title];

    const tab = collisions.find((c) => String(c.id).startsWith(TAB_PREFIX));
    if (tab) return [tab];

    const container = collisions.find((c) => String(c.id).startsWith(CONTAINER_PREFIX));
    if (container) return [container];

    return []; // 分类排序项不参与按钮拖拽
}

/** 指针悬停按钮时优先命中按钮；无命中时用 closestCorners 兜底，解决自动展开文件夹后拖放区检测不到的问题 */
export const buttonDragCollisionDetection: CollisionDetection = (args) => {
    const pointerCollisions = pointerWithin(args);

    if (pointerCollisions.length > 0) {
        const withoutActive = pointerCollisions.filter((c) => c.id !== args.active?.id);
        return pickPrimaryCollision(withoutActive);
    }

    // 兜底: pointerWithin 无命中时, 用 closestCorners 找最近的按钮。
    // 但若指针不在任何 detail 内(如磁贴区及其间隙)则不触发, 保持原位
    if (args.pointerCoordinates) {
        const { x, y } = args.pointerCoordinates;
        const elements = activeDocument.elementsFromPoint(x, y);

        // 手动检测标题区：不依赖 dnd-kit droppable 测量，直接查 DOM
        const headerEl = elements.find((el) => el.closest('.folder-detail-header'));
        if (headerEl) {
            const detailEl = headerEl.closest('.buttons-panel-folder-detail');
            const categoryId = detailEl?.getAttribute('data-category-id');
            if (categoryId) {
                return [{ id: `title:${categoryId}`, data: { value: 0 } }];
            }
        }

        const inDetail = elements.some((el) =>
            el.closest('.buttons-panel-folder-detail')
        );
        if (!inDetail) {
            return [];
        }
    }

    const cornerCollisions = closestCorners(args);
    if (cornerCollisions.length > 0) {
        const withoutActive = cornerCollisions.filter((c) => c.id !== args.active?.id);
        return pickPrimaryCollision(withoutActive);
    }

    return [];
};
