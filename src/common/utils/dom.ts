// dom.ts
// DOM 操作相关工具函数。

/**
 * 安全地将SVG字符串插入到指定元素，只允许<svg>标签，移除所有事件属性和<script>标签。
 * @param el 目标元素
 * @param svgString SVG字符串
 */
export function safeSetSVG(el: HTMLElement, svgString: string) {
    if (!svgString || !svgString.trim().startsWith('<svg')) {
        el.empty();
        return;
    }
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, 'image/svg+xml');
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
        // 移除所有<script>标签
        svg.querySelectorAll('script').forEach((script) => script.remove());
        el.empty();
        el.appendChild(svg);
    } else {
        el.empty();
    }
}
