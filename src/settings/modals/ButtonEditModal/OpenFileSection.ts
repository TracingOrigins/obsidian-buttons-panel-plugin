import { Setting, TextComponent } from 'obsidian';
import { t } from '../../../utils/i18n';
import { FileSearchModal } from '../FileSearchModal';
import { safeSetSVG } from '../../../utils/validation';

export function createOpenFileSection(container: HTMLElement, modalInstance: any) {
  const wrapper = container.createDiv({ cls: 'file-input-wrapper' });
  const input = new TextComponent(wrapper)
    .setPlaceholder(t('file_path_placeholder', modalInstance.plugin))
    .setValue(modalInstance.getCurrentButton()?.action.value || '');

  modalInstance.actionValueInputEl = input.inputEl;

  const onSelect = (file: any) => {
    if (!file || !file.path) return;
    input.setValue(file.path);
    const currentButton = modalInstance.getCurrentButton();
    currentButton.action.value = file.path;
    if (modalInstance.actionValueInputEl) {
      modalInstance.actionValueInputEl.classList.remove('input-error');
    }
  };

  const setting = new Setting(container)
    .setName(t('file_path', modalInstance.plugin))
    .setDesc(t('file_path_placeholder', modalInstance.plugin))
    .addButton(button => button
      .setButtonText('')
      .setClass('custom-button')
      .setTooltip(t('search_files_tooltip', modalInstance.plugin))
      .setIcon('search')
      .onClick(() => {
        new FileSearchModal(modalInstance.app, modalInstance.plugin, onSelect).open();
      })
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
} 