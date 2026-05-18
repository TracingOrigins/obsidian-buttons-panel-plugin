import React from 'react';
import type { CategoryConfig } from '@/types';
import { useConfigContext } from '@/contexts/ConfigContext';
import { useMoveModeContext } from '@/contexts/MoveModeContext';
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
    const moveMode = useMoveModeContext();
    const viewType = panelConfig.panelViewType ?? 'list';
    const displayStyle = panelConfig.displayStyle ?? 'default';
    const enableAnimation = panelConfig.enableAnimation ?? false;
    const enableEditMode = panelConfig.enableEditMode ?? false;
    const tabsWrap = panelConfig.tabsWrap ?? false;
    const autoCollapseListView = panelConfig.autoCollapseListView ?? false;

    // 顶部导航栏搜索：在内存中按按钮 / 分类名称做一次过滤
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

                // 分类名和按钮名的匹配策略：
                // - 如果分类名命中：保留该分类，并显示该分类下的全部按钮（便于“按分类名查找并使用”）
                // - 如果分类名未命中，但有按钮命中：仅保留命中的按钮
                // - 两者都未命中：丢弃该分类
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

    // 长按拖拽仅非编辑模式；编辑模式沿用右键菜单「移动」的点击式移动
    const buttonDragEnabled =
        !enableEditMode &&
        normalizedQuery.length === 0 &&
        moveMode.state.type === 'none';

    // 按钮移动模式下，统一使用列表视图样式，并按照分类分隔显示
    if (moveMode.state.type === 'button') {
        return (
            <ButtonDragProvider
                categories={filteredCategories}
                enabled={false}
                displayStyle={displayStyle}
                enableAnimation={enableAnimation}
            >
                <ListModeContent
                    categories={filteredCategories}
                    displayStyle={displayStyle}
                    enableAnimation={enableAnimation}
                    enableEditMode={enableEditMode}
                    autoCollapseOnMount={false}
                />
            </ButtonDragProvider>
        );
    }

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
            enabled={buttonDragEnabled}
            displayStyle={displayStyle}
            enableAnimation={enableAnimation}
        >
            {panelContent}
        </ButtonDragProvider>
    );
};

