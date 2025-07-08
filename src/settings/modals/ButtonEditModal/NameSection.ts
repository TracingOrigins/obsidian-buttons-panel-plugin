import { Setting, TextComponent } from 'obsidian';
import { t } from '../../../utils/i18n';

export function createNameSection(container: HTMLElement, modalInstance: any) {
  const nameSetting = new Setting(container)
    .setName(t('button_name', modalInstance.plugin))
    .setDesc(t('button_name_desc', modalInstance.plugin))
    .addText(text => text
      .setPlaceholder(t('button_name_placeholder', modalInstance.plugin))
      .setValue(modalInstance.getCurrentButton()?.name || '')
      .onChange((value) => {
        const currentButton = modalInstance.getCurrentButton();
        currentButton.name = value;
        if (modalInstance.nameInputEl) {
          modalInstance.nameInputEl.classList.remove('input-error');
        }
      }));
  modalInstance.nameInputEl = nameSetting.controlEl.querySelector('input');
} 