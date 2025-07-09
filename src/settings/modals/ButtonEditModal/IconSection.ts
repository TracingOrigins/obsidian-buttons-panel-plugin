import { Setting, TextComponent, setIcon } from 'obsidian';
import { t } from '../../../utils/i18n';
import { IconSearchModal } from '../IconSearchModal';
import { safeSetSVG } from '../../../utils/validation';

export function createIconSection(container: HTMLElement, modalInstance: any) {
  const iconSetting = new Setting(container)
    .setName(t('button_icon', modalInstance.plugin))
    .setDesc(t('button_icon_desc', modalInstance.plugin));

  // 上传按钮
  iconSetting.addButton(btn => {
    btn.setButtonText('').setClass('custom-button')
      .setTooltip(t('upload_svg_icon_tooltip', modalInstance.plugin))
      .setIcon('plus')
      .onClick(() => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.svg';
        fileInput.onchange = async () => {
          const file = fileInput.files?.[0];
          if (file) {
            let svgText = await file.text();
            const match = svgText.match(/<svg[\s\S]*?<\/svg>/i);
            if (match) svgText = match[0];
            const currentButton = modalInstance.getCurrentButton();
            currentButton.icon = svgText;
            iconTextComponent.setValue(svgText);
            refreshIconUI();
          }
        };
        fileInput.click();
      });
    btn.buttonEl.classList.add('icon-upload-btn');
  });

  // 搜索按钮
  iconSetting.addButton(btn => {
    btn.setButtonText('').setClass('custom-button')
      .setTooltip(t('search_icons_tooltip', modalInstance.plugin))
      .setIcon('search')
      .onClick(() => {
        new IconSearchModal(modalInstance.app, modalInstance.plugin, (icon: {name: string, svg: string}) => {
          const currentButton = modalInstance.getCurrentButton();
          currentButton.icon = icon.svg;
          iconTextComponent.setValue(icon.svg);
          refreshIconUI();
        }).open();
      });
    btn.buttonEl.classList.add('icon-search-btn');
  });

  // 输入框
  let iconTextComponent: TextComponent;
  iconSetting.addText(text => {
    iconTextComponent = text;
    text.setPlaceholder(t('button_icon_placeholder', modalInstance.plugin))
      .setValue(modalInstance.getCurrentButton()?.icon || '')
      .onChange((value) => {
        const currentButton = modalInstance.getCurrentButton();
        currentButton.icon = value;
        refreshIconUI();
      });
  });
  const iconInputEl = iconSetting.controlEl.querySelector('input')!;

  // SVG预览和删除按钮
  let svgPreview: HTMLSpanElement | null = null;
  let deleteBtn: HTMLButtonElement | null = null;

  const refreshIconUI = () => {
    const val = iconInputEl.value;
    const HIDDEN_CLASS = 'is-hidden';
    if (val && val.trim() !== '') {
      // 隐藏上传和搜索按钮
      const uploadBtn = iconSetting.controlEl.querySelector('.icon-upload-btn') as HTMLButtonElement;
      const searchBtn = iconSetting.controlEl.querySelector('.icon-search-btn') as HTMLButtonElement;
      if (uploadBtn) uploadBtn.classList.add(HIDDEN_CLASS);
      if (searchBtn) searchBtn.classList.add(HIDDEN_CLASS);
      // SVG预览
      if (!svgPreview) {
        svgPreview = iconSetting.controlEl.createSpan();
        svgPreview.className = 'icon-svg-preview';
      }
      safeSetSVG(svgPreview, val);
      svgPreview.classList.remove(HIDDEN_CLASS);
      iconSetting.controlEl.insertBefore(svgPreview, iconInputEl);
      // 删除按钮
      if (!deleteBtn) {
        deleteBtn = iconSetting.controlEl.createEl('button', { cls: 'icon-delete-btn' });
        setIcon(deleteBtn, 'x'); // 使用Obsidian内置的“x”图标
        deleteBtn.onclick = () => {
          iconTextComponent.setValue('');
          const currentButton = modalInstance.getCurrentButton();
          currentButton.icon = '';
          refreshIconUI();
        };
        iconInputEl.parentElement!.classList.add('icon-input-container');
        iconInputEl.parentElement!.appendChild(deleteBtn);
      }
      deleteBtn!.classList.remove(HIDDEN_CLASS);
    } else {
      // 显示上传和搜索按钮
      const uploadBtn = iconSetting.controlEl.querySelector('.icon-upload-btn') as HTMLButtonElement;
      const searchBtn = iconSetting.controlEl.querySelector('.icon-search-btn') as HTMLButtonElement;
      if (uploadBtn) uploadBtn.classList.remove(HIDDEN_CLASS);
      if (searchBtn) searchBtn.classList.remove(HIDDEN_CLASS);
      if (svgPreview) svgPreview.classList.add(HIDDEN_CLASS);
      if (deleteBtn) deleteBtn.classList.add(HIDDEN_CLASS);
    }
  };
  iconInputEl.addEventListener('input', refreshIconUI);
  refreshIconUI();
} 