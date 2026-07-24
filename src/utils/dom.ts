// dom.ts
// DOM 操作相关工具函数。

const SCRIPT_LOCAL = 'script';

/**
 * 从原始 SVG 字符串中剥离内联 `<script>...</script>`，避免 DOMParser 在内存中实例化可执行脚本节点。
 * 与解析后遍历移除配合，形成纵深防御。
 */
function stripSvgScriptMarkup(svgMarkup: string): string {
    return svgMarkup.replace(/<script\b[\s\S]*?<\/script>/gi, '');
}

/**
 * 移除已解析 DOM 子树中所有 `script` 元素（含 SVG 内嵌 HTML 等变体），不依赖 `querySelectorAll('script')`。
 */
function removeScriptElementsFromSubtree(root: Element): void {
    const candidates = root.querySelectorAll('*');
    for (let i = candidates.length - 1; i >= 0; i--) {
        const el = candidates[i]!;
        if (el.localName?.toLowerCase() === SCRIPT_LOCAL) {
            el.remove();
        }
    }
}

/**
 * 安全地将SVG字符串插入到指定元素，只允许<svg>标签，移除所有事件属性和可执行脚本内容。
 * @param el 目标元素
 * @param svgString SVG字符串
 */
export function safeSetSVG(el: HTMLElement, svgString: string) {
    if (!svgString || !svgString.trim().startsWith('<svg')) {
        el.empty();
        return;
    }
    const sanitized = stripSvgScriptMarkup(svgString);
    const parser = new DOMParser();
    const doc = parser.parseFromString(sanitized, 'image/svg+xml');
    const svg = doc.querySelector('svg');
    if (svg) {
        // 移除所有事件属性（on*）
        const removeEventAttrs = (node: Element) => {
            Array.from(node.attributes).forEach((attr) => {
                if (/^on/i.test(attr.name)) {
                    node.removeAttribute(attr.name);
                }
            });
            Array.from(node.children).forEach((child) => removeEventAttrs(child));
        };
        removeEventAttrs(svg);
        removeScriptElementsFromSubtree(svg);
        el.empty();
        el.appendChild(svg);
    } else {
        el.empty();
    }
}
