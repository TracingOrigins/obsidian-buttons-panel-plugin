import { type CollisionDetection } from '@dnd-kit/core';
import { parseCategorySortableId } from '@/utils/categoryDragItems';
import { buttonDragCollisionDetection } from '@/utils/buttonDragCollision';
import { categoryDragCollisionDetection } from '@/utils/categoryDragCollision';

/** 分类拖拽：指针悬停才换位；按钮拖拽：指针优先策略 */
export const panelDragCollisionDetection: CollisionDetection = (args) => {
    const activeId = String(args.active.id);
    if (parseCategorySortableId(activeId)) {
        return categoryDragCollisionDetection(args);
    }
    return buttonDragCollisionDetection(args);
};
