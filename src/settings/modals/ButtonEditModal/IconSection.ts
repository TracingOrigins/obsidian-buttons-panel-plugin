import { Setting, TextComponent } from 'obsidian';
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
    btn.buttonEl.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>';
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
    btn.buttonEl.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>';
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
    if (val && val.trim() !== '') {
      // 隐藏上传和搜索按钮
      const uploadBtn = iconSetting.controlEl.querySelector('.icon-upload-btn') as HTMLButtonElement;
      const searchBtn = iconSetting.controlEl.querySelector('.icon-search-btn') as HTMLButtonElement;
      if (uploadBtn) uploadBtn.style.display = 'none';
      if (searchBtn) searchBtn.style.display = 'none';
      
      // SVG预览
      if (!svgPreview) {
        svgPreview = iconSetting.controlEl.createSpan();
        svgPreview.className = 'icon-svg-preview';
      }
      // svgPreview.innerHTML = val.startsWith('<svg') ? val : '';
      safeSetSVG(svgPreview, val);
      svgPreview.style.display = '';
      iconSetting.controlEl.insertBefore(svgPreview, iconInputEl);
      
      // 删除按钮
      if (!deleteBtn) {
        deleteBtn = iconSetting.controlEl.createEl('button', { cls: 'icon-delete-btn' });
        deleteBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
        deleteBtn.onclick = () => {
          iconTextComponent.setValue('');
          const currentButton = modalInstance.getCurrentButton();
          currentButton.icon = '';
          refreshIconUI();
        };
        iconInputEl.parentElement!.classList.add('icon-input-container');
        iconInputEl.parentElement!.appendChild(deleteBtn);
      }
      deleteBtn!.style.display = '';
    } else {
      // 显示上传和搜索按钮
      const uploadBtn = iconSetting.controlEl.querySelector('.icon-upload-btn') as HTMLButtonElement;
      const searchBtn = iconSetting.controlEl.querySelector('.icon-search-btn') as HTMLButtonElement;
      if (uploadBtn) uploadBtn.style.display = '';
      if (searchBtn) searchBtn.style.display = '';
      if (svgPreview) svgPreview.style.display = 'none';
      if (deleteBtn) deleteBtn.style.display = 'none';
    }
  };
  iconInputEl.addEventListener('input', refreshIconUI);
  refreshIconUI();
} 