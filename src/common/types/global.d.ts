// global.d.ts
// 全局类型声明文件，用于扩展 window 对象。

import moment from 'moment';
declare global {
    /**
     * 扩展 window 对象，增加 moment 和插件相关全局变量。
     */
    interface Window {
        /** moment.js 日期库实例 */
        moment: typeof moment;
        /** 按钮面板插件：是否抑制分类菜单（可选） */
        __BUTTON_PANEL_SUPPRESS_CATEGORY_MENU?: boolean;
    }
}
