# 按钮拖动排序（dnd-kit）

## 行为

- **长按约 400ms** 开始拖动（短按仍执行按钮动作）。
- **拖动中**：`onDragOver` 更新临时顺序，列表内其它按钮让出插入位；拖动项由 `DragOverlay` 跟随指针。
- **松手后**：写入 `plugin.settings` 并 `saveSettings()`。
- **启用条件**：非编辑模式（`enableEditMode === false`）、无搜索过滤、未处于点击移动模式。
- **编辑模式**：不启用长按拖拽，仅右键菜单「移动」+ `MoveModeContext` 点击落位。

## 架构

- `ButtonDragProvider`（`PanelContent` 包裹）：`DndContext` + 多分类 `items` 状态。
- `CategoryButtonGrid` / `SortableButtonItem`：每分类 `SortableContext` + `container:{categoryId}` droppable。
- **列表视图**：悬停目标分类标题/区域时 `registerCategoryHover` 自动展开。
- **标签视图**：`TabDropTarget`（`tab:{categoryId}`）悬停时切换 `activeTabId`。

## 相关文件

- `src/contexts/ButtonDragContext.tsx`
- `src/utils/buttonDragItems.ts`
- `src/components/buttons-panel/CategoryButtonGrid.tsx`
- `src/components/button/SortableButtonItem.tsx`
- `src/components/buttons-panel/TabDropTarget.tsx`
- `src/components/buttons-panel/ButtonDrag.css`
