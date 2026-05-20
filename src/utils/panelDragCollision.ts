import { type CollisionDetection } from '@dnd-kit/core';
import { parseCategorySortableId } from '@/utils/categoryDragItems';
import { buttonDragCollisionDetection } from '@/utils/buttonDragCollision';
import {
    categoryDragCollisionDetection,
    categoryGridTabDragCollision,
    categoryHorizontalTabDragCollision,
} from '@/utils/categoryDragCollision';

export type CategoryDragLayout = 'vertical' | 'horizontal' | 'grid';

export function createPanelDragCollisionDetection(
    categoryLayout: CategoryDragLayout
): CollisionDetection {
    return (args) => {
        const activeId = String(args.active.id);
        if (parseCategorySortableId(activeId)) {
            switch (categoryLayout) {
                case 'horizontal':
                    return categoryHorizontalTabDragCollision(args);
                case 'grid':
                    return categoryGridTabDragCollision(args);
                default:
                    return categoryDragCollisionDetection(args);
            }
        }
        return buttonDragCollisionDetection(args);
    };
}

/** @deprecated 使用 createPanelDragCollisionDetection */
export const panelDragCollisionDetection: CollisionDetection =
    createPanelDragCollisionDetection('vertical');
