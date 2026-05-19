import { arrayMove } from '@dnd-kit/sortable';
import type { ButtonConfig, CategoryConfig } from '@/types';

export type ButtonDragItems = Record<string, string[]>;

export const CONTAINER_PREFIX = 'container:';
export const TAB_PREFIX = 'tab:';

export function containerDroppableId(categoryId: string): string {
    return `${CONTAINER_PREFIX}${categoryId}`;
}

export function tabDroppableId(categoryId: string): string {
    return `${TAB_PREFIX}${categoryId}`;
}

export function isContainerZoneOverId(overId: string | number): boolean {
    return String(overId).startsWith(CONTAINER_PREFIX);
}

export function isTabZoneOverId(overId: string | number): boolean {
    return String(overId).startsWith(TAB_PREFIX);
}

/** 拖放到分类区域末尾（容器 / 标签） */
export function isAppendToCategoryEndOverId(overId: string | number): boolean {
    return isContainerZoneOverId(overId) || isTabZoneOverId(overId);
}

export function buildButtonDragItems(categories: CategoryConfig[]): ButtonDragItems {
    const items: ButtonDragItems = {};
    for (const category of categories) {
        const sorted = [...category.buttons].sort((a, b) => a.order - b.order);
        items[category.id] = sorted.map((b) => b.id);
    }
    return items;
}

export function findContainerForButtonId(
    buttonId: string,
    items: ButtonDragItems
): string | undefined {
    return Object.keys(items).find((categoryId) => items[categoryId].includes(buttonId));
}

export function resolveOverContainerId(
    overId: string | number,
    items: ButtonDragItems
): string | null {
    const id = String(overId);
    if (id.startsWith(CONTAINER_PREFIX)) {
        return id.slice(CONTAINER_PREFIX.length);
    }
    if (id.startsWith(TAB_PREFIX)) {
        return id.slice(TAB_PREFIX.length);
    }
    return findContainerForButtonId(id, items) ?? null;
}

export function getOrderedButtonsFromAllCategories(
    category: CategoryConfig,
    categories: CategoryConfig[],
    items: ButtonDragItems
): ButtonConfig[] {
    const ids = items[category.id] ?? [];
    const allButtons = new Map<string, ButtonConfig>();
    for (const cat of categories) {
        for (const button of cat.buttons) {
            allButtons.set(button.id, button);
        }
    }
    return ids
        .map((id) => allButtons.get(id))
        .filter((b): b is ButtonConfig => b !== undefined);
}

function arraysEqual(a: string[], b: string[]): boolean {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

function withContainerItems(
    prev: ButtonDragItems,
    containerId: string,
    nextItems: string[]
): ButtonDragItems {
    if (arraysEqual(prev[containerId] ?? [], nextItems)) {
        return prev;
    }
    const next = { ...prev, [containerId]: nextItems };
    return itemsShallowEqual(prev, next) ? prev : next;
}

/**
 * 根据 dragOver 计算下一 items；若无变化则返回 prev（同一引用），避免 React #185 无限更新。
 */
export function applyDragOverToItems(
    prev: ButtonDragItems,
    activeId: string,
    overId: string
): ButtonDragItems {
    const activeContainer = findContainerForButtonId(activeId, prev);
    const overContainer = resolveOverContainerId(overId, prev);

    if (!activeContainer || !overContainer) return prev;

    const activeItems = prev[activeContainer];
    const overItems = prev[overContainer];
    const activeIndex = activeItems.indexOf(activeId);
    if (activeIndex === -1) return prev;

    if (activeContainer === overContainer) {
        // 同分类内：网格 container 铺满按钮区，指针穿透占位符会误命中 container 导致与「末尾」来回跳
        if (isContainerZoneOverId(overId)) {
            return prev;
        }
        if (isTabZoneOverId(overId)) {
            const lastIndex = overItems.length - 1;
            if (activeIndex === lastIndex) return prev;
            return withContainerItems(
                prev,
                overContainer,
                arrayMove([...overItems], activeIndex, lastIndex)
            );
        }
        const overIndex = overItems.indexOf(overId);
        if (overIndex === -1 || activeIndex === overIndex) return prev;
        return withContainerItems(
            prev,
            overContainer,
            arrayMove([...overItems], activeIndex, overIndex)
        );
    }

    const filteredOverItems = overItems.filter((id) => id !== activeId);

    let overIndex: number;
    if (isAppendToCategoryEndOverId(overId)) {
        overIndex = filteredOverItems.length;
    } else {
        const overIdx = filteredOverItems.indexOf(overId);
        overIndex = overIdx >= 0 ? overIdx : filteredOverItems.length;
    }

    const nextOverItems = [
        ...filteredOverItems.slice(0, overIndex),
        activeId,
        ...filteredOverItems.slice(overIndex),
    ];
    const nextActiveItems = activeItems.filter((id) => id !== activeId);

    const next: ButtonDragItems = {
        ...prev,
        [activeContainer]: nextActiveItems,
        [overContainer]: nextOverItems,
    };

    return itemsShallowEqual(prev, next) ? prev : next;
}

export function itemsShallowEqual(a: ButtonDragItems, b: ButtonDragItems): boolean {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    for (const key of keysA) {
        const arrA = a[key];
        const arrB = b[key];
        if (!arrB || arrA.length !== arrB.length) return false;
        for (let i = 0; i < arrA.length; i++) {
            if (arrA[i] !== arrB[i]) return false;
        }
    }
    return true;
}
