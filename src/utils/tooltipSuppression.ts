/**
 * Obsidian 原生 tooltip（给元素挂 aria-label 后由 body 上的委托监听显示）。
 * 它只在 pointerout / pointerup 时隐藏，而拖拽期间这两个事件不会落到已移除
 * aria-label 的按钮上，所以拖拽开始时已经弹出的 tooltip 会一直留着。
 * 这里直接清掉 body 上的 div.tooltip：Obsidian 内部持有的是同一个节点，
 * 下次显示时会因为 parentNode 为空而重新 append，不影响后续使用。
 */
const OBSIDIAN_TOOLTIP_SELECTOR = '.tooltip';

function removeVisibleTooltips(doc: Document): void {
    doc.body
        .querySelectorAll(OBSIDIAN_TOOLTIP_SELECTOR)
        .forEach((el) => el.remove());
}

/**
 * 在拖拽期间抑制 Obsidian tooltip：先清掉已弹出的，再拦截期间新插入的。
 * @returns 取消抑制的清理函数
 */
export function suppressObsidianTooltips(doc: Document = activeDocument): () => void {
    removeVisibleTooltips(doc);

    const observer = new MutationObserver((records) => {
        for (const record of records) {
            record.addedNodes.forEach((node) => {
                if (
                    node.instanceOf(HTMLElement) &&
                    node.matches(OBSIDIAN_TOOLTIP_SELECTOR)
                ) {
                    node.remove();
                }
            });
        }
    });
    observer.observe(doc.body, { childList: true });

    return () => observer.disconnect();
}
