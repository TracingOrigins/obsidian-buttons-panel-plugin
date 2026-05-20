import React from 'react';
import type { CategoryConfig } from '@/types';
import { useConfigContext } from '@/contexts/ConfigContext';
import { ButtonDragProvider } from '@/contexts/ButtonDragContext';
import { TabsModeContent } from '@/components/buttons-panel/TabsModeContent';
import { ListModeContent } from '@/components/buttons-panel/ListModeContent';
import './PanelContent.css';

interface PanelContentProps {
    categories: CategoryConfig[];
    /** 顶部导航栏搜索关键字（用于本地过滤按钮） */
    searchQuery?: string;
}

/**
 * PanelContent
 * 统一的内容区域入口：
 * - 根据 panelConfig.panelViewType 在内部切换 TabsModeContent / ListModeContent；
 * - 两个子视图都按分类展示按钮；
 * - 如果传入 searchQuery，则在本组件内做一次本地过滤。
 */
export const PanelContent: React.FC<PanelContentProps> = ({
    categories,
    searchQuery,
}) => {
    const { panelConfig } = useConfigContext();
    const viewType = panelConfig.panelViewType ?? 'list';
    const displayStyle = panelConfig.displayStyle ?? 'default';
    const enableAnimation = panelConfig.enableAnimation ?? false;
    const enableEditMode = panelConfig.enableEditMode ?? false;
    const tabsWrap = panelConfig.tabsWrap ?? false;
    const autoCollapseListView = panelConfig.autoCollapseListView ?? false;

    const normalizedQuery = searchQuery?.trim().toLowerCase() ?? '';

    const filteredCategories = React.useMemo(() => {
        const sorted = [...categories].sort((a, b) => a.order - b.order);
        if (normalizedQuery.length === 0) {
            return sorted;
        }

        return sorted
            .map((category) => {
                const nameMatched = category.name.toLowerCase().includes(normalizedQuery);

                const filteredButtons = category.buttons.filter((button) => {
                    const buttonName = button.name ?? '';
                    return buttonName.toLowerCase().includes(normalizedQuery);
                });

                if (!nameMatched && filteredButtons.length === 0) {
                    return null;
                }

                return {
                    ...category,
                    buttons: nameMatched ? category.buttons : filteredButtons,
                };
            })
            .filter((c): c is CategoryConfig => c !== null);
    }, [categories, normalizedQuery]);

    const dragReorderEnabled = normalizedQuery.length === 0;

    const panelContent =
        viewType === 'tabs' ? (
            <TabsModeContent
                categories={filteredCategories}
                displayStyle={displayStyle}
                enableAnimation={enableAnimation}
                enableEditMode={enableEditMode}
                tabsWrap={tabsWrap}
                isSearchActive={normalizedQuery.length > 0}
            />
        ) : (
            <ListModeContent
                categories={filteredCategories}
                displayStyle={displayStyle}
                enableAnimation={enableAnimation}
                enableEditMode={enableEditMode}
                autoCollapseOnMount={autoCollapseListView}
                isSearchActive={normalizedQuery.length > 0}
            />
        );

    return (
        <ButtonDragProvider
            categories={filteredCategories}
            enabled={dragReorderEnabled}
            displayStyle={displayStyle}
            enableAnimation={enableAnimation}
            categoryDragOverlayVariant={viewType === 'tabs' ? 'tabs' : 'list'}
        >
            {panelContent}
        </ButtonDragProvider>
    );
};
