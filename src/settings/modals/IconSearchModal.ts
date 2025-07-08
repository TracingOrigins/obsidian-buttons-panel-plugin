import { App, Modal, TextComponent } from 'obsidian';
import { ButtonsPanelPlugin } from '../../types/plugin';
import icons from '../../assets/icons.json';
import { t } from '../../utils/i18n';
import { safeSetSVG } from '../../utils/validation';

/**
 * 图标搜索模态框类。
 * 用于搜索并选择内置SVG图标，支持分页、输入过滤、键盘导航、回车选择。
 */
export class IconSearchModal extends Modal {
  /** 插件主类实例 */
  plugin: ButtonsPanelPlugin;
  /** 选择图标后的回调函数，参数为图标对象{name, svg} */
  onSelect: (icon: { name: string; svg: string }) => void;

  /**
   * 构造函数，初始化模态框。
   * @param app Obsidian应用实例
   * @param plugin 插件主类实例
   * @param onSelect 选择图标后的回调
   */
  constructor(app: App, plugin: ButtonsPanelPlugin, onSelect: (icon: { name: string; svg: string }) => void) {
    super(app);
    this.plugin = plugin;
    this.onSelect = onSelect;
  }

  /**
   * 打开模态框时自动调用，渲染界面。
   */
  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass('buttons-panel-plugin');
    contentEl.addClass('icon-search-modal');

    // 居中搜索框区域
    const inputWrapper = contentEl.createDiv({cls: 'search-input-wrapper'});
    const input = new TextComponent(inputWrapper)
      .setPlaceholder(t('search_icons', this.plugin))
      .setValue('');
    input.inputEl.classList.add('search-input');

    // 图标列表容器
    const iconList = contentEl.createDiv({ cls: 'icon-list' });
    let filteredIcons: any[] = [];
    let selectedSuggestionIndex = 0;
    let page = 1;
    const PAGE_SIZE = 100;

    // 确保图标数据正确加载
    if (!icons || icons.length === 0) {
      console.warn(t('icons_data_empty', this.plugin));
      return;
    }

    /**
     * 滚动到当前选中的图标项。
     */
    const scrollToSelected = () => {
      const activeItem = iconList.querySelector('.icon-item.is-active') as HTMLElement;
      if (activeItem) {
        activeItem.scrollIntoView({ 
          block: 'nearest', 
          behavior: 'smooth' 
        });
      }
    };

    /**
     * 渲染图标列表，支持分页。
     * @param append 是否为追加模式（滚动加载更多）
     */
    const renderIcons = (append = false) => {
      if (!append) {
        iconList.empty();
      }
      const startIndex = append ? PAGE_SIZE * (page - 1) : 0;
      const endIndex = PAGE_SIZE * page;
      const toShow = filteredIcons.slice(startIndex, endIndex);
      if (toShow.length === 0 && !append) {
        iconList.createDiv({ text: t('no_icons_available', this.plugin), cls: 'suggestion-item' });
        return;
      }
      toShow.forEach((icon, idx) => {
        const item = iconList.createDiv({ 
          cls: 'icon-item' + (idx + startIndex === selectedSuggestionIndex ? ' is-active' : '') 
        });
        if (icon.svg) {
          // item.innerHTML = icon.svg;
          safeSetSVG(item, icon.svg);
        } else {
          item.textContent = icon.name || t('unknown_icon', this.plugin);
        }
        item.title = icon.name;
        item.onclick = () => {
          this.onSelect(icon);
          this.close();
        };
      });
      // 只在非追加模式下显示加载提示
      if (!append && toShow.length < filteredIcons.length) {
        const loadingDiv = iconList.createDiv({ text: t('scroll_load_more', this.plugin), cls: 'icon-loading-tip' });
      }
      if (selectedSuggestionIndex >= 0 && !append) {
        scrollToSelected();
      }
    };

    // 懒加载：滚动到底部自动加载更多
    iconList.addEventListener('scroll', () => {
      if (iconList.scrollTop + iconList.clientHeight >= iconList.scrollHeight - 10) {
        if (PAGE_SIZE * page < filteredIcons.length) {
          page++;
          renderIcons(true); // 追加模式
        }
      }
    });

    /**
     * 根据输入内容过滤图标列表。
     */
    const updateFilter = () => {
      const query = input.getValue().trim().toLowerCase();
      filteredIcons = icons.filter(icon => icon.name && icon.name.toLowerCase().includes(query));
      page = 1;
      selectedSuggestionIndex = 0;
      renderIcons(false); // 重置模式
    };

    // 输入时实时过滤
    input.inputEl.addEventListener('input', updateFilter);

    // 键盘导航与选择
    input.inputEl.addEventListener('keydown', (e: KeyboardEvent) => {
      const total = Math.min(icons.length, PAGE_SIZE * page);
      if (total === 0) return;
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          selectedSuggestionIndex = (selectedSuggestionIndex + 1) % total;
          renderIcons(false); // 重新渲染以更新选中状态
          break;
        case 'ArrowUp':
          e.preventDefault();
          selectedSuggestionIndex = (selectedSuggestionIndex - 1 + total) % total;
          renderIcons(false); // 重新渲染以更新选中状态
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedSuggestionIndex > -1) {
            const icon = icons[selectedSuggestionIndex];
            this.onSelect(icon);
            this.close();
          }
          break;
        case 'Escape':
          this.close();
          break;
      }
    });

    // 初始化显示
    filteredIcons = icons;
    renderIcons(false); // 初始加载
  }

  /**
   * 关闭模态框时自动调用，清理内容。
   */
  onClose(): void {
    const { contentEl } = this;
    contentEl.empty();
  }
} 