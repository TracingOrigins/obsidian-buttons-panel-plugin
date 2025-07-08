import { Setting, TextComponent } from 'obsidian';
import { t } from '../../../utils/i18n';
import { createScopeSection } from './ScopeSection';
import { FileSearchModal } from '../FileSearchModal';

export function createRunScriptSection(container: HTMLElement, modalInstance: any) {
  const wrapper = container.createDiv({ cls: 'script-input-wrapper' });
  const input = new TextComponent(wrapper)
    .setPlaceholder(t('script_file_placeholder', modalInstance.plugin))
    .setValue(modalInstance.getCurrentButton()?.action.value || '');

  modalInstance.actionValueInputEl = input.inputEl;

  // 统一：先定义onSelect
  const onSelect = (file: any) => {
    let fileName = file?.name || (typeof file === 'string' ? file : '');
    if (!fileName.endsWith('.js')) return;
    input.setValue(fileName);
    const currentButton = modalInstance.getCurrentButton();
    currentButton.action.value = fileName;
    if (modalInstance.actionValueInputEl) {
      modalInstance.actionValueInputEl.classList.remove('input-error');
    }
  };

  const scriptFolder = modalInstance.plugin?.settings?.pathSettings?.scriptFolderPath ?? '';

  const setting = new Setting(container)
    .setName(t('script_file', modalInstance.plugin))
    .setDesc(t('script_file_desc', modalInstance.plugin))
    .addButton(button => button
      .setButtonText('')
      .setClass('custom-button')
      .setTooltip(t('search_files_tooltip', modalInstance.plugin))
      .setIcon('search')
      .onClick(() => {
        new FileSearchModal(modalInstance.app, modalInstance.plugin, onSelect, {
          rootFolder: scriptFolder,
          fileExts: ['js'],
          showFileNameOnly: true
        }).open();
      })
      .buttonEl.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>'
    );

  setting.controlEl.appendChild(wrapper);

  input.onChange((value) => {
    const currentButton = modalInstance.getCurrentButton();
    currentButton.action.value = value;
    if (modalInstance.actionValueInputEl) {
      modalInstance.actionValueInputEl.classList.remove('input-error');
    }
  });

  input.inputEl.addEventListener('keydown', (e) => { if (e.key === 'Enter') { modalInstance.saveButton(); } });

  // 作用域参数下拉框
  createScopeSection(container, modalInstance);
} 