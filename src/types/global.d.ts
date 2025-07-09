import moment from "moment";
declare global {
  interface Window {
    moment: typeof moment;
    __BUTTON_PANEL_SUPPRESS_CATEGORY_MENU?: boolean;
  }
} 