import { arrayMove } from '@dnd-kit/sortable';
import type { CategoryConfig } from '@/types';

export const CATEGORY_SORT_PREFIX = 'cat-sort:';

export function categorySortableId(categoryId: string): string {
    return `${CATEGORY_SORT_PREFIX}${categoryId}`;
}

export function parseCategorySortableId(id: string): string | null {
    if (!id.startsWith(CATEGORY_SORT_PREFIX)) return null;
    return id.slice(CATEGORY_SORT_PREFIX.length);
}

export function buildCategoryDragIds(categories: CategoryConfig[]): string[] {
    return [...categories]
        .sort((a, b) => a.order - b.order)
        .map((c) => categorySortableId(c.id));
}

export function getOrderedCategoriesFromIds(
    categories: CategoryConfig[],
    ids: string[]
): CategoryConfig[] {
    const byId = new Map(categories.map((c) => [c.id, c]));
    const ordered: CategoryConfig[] = [];
    for (const sortId of ids) {
        const categoryId = parseCategorySortableId(sortId);
        if (!categoryId) continue;
        const cat = byId.get(categoryId);
        if (cat) ordered.push(cat);
    }
    for (const cat of categories) {
        if (!ordered.some((c) => c.id === cat.id)) {
            ordered.push(cat);
        }
    }
    return ordered;
}

export function applyCategoryDragOver(ids: string[], activeId: string, overId: string): string[] {
    const oldIndex = ids.indexOf(activeId);
    const newIndex = ids.indexOf(overId);
    if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
        return ids;
    }
    return arrayMove(ids, oldIndex, newIndex);
}

export function categoryIdsEqual(a: string[], b: string[]): boolean {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}
