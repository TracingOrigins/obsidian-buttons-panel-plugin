import { Setting, TextComponent } from 'obsidian';
import { t } from '../../../utils/i18n';

export function createOpenUrlSection(container: HTMLElement, modalInstance: any) {
  const setting = new Setting(container)
    .setName(t('url_address', modalInstance.plugin))
    .setDesc(t('url_placeholder', modalInstance.plugin));

  const input = new TextComponent(setting.controlEl)
    .setPlaceholder('https://example.com')
    .setValue(modalInstance.getCurrentButton()?.action.value || '');

  modalInstance.actionValueInputEl = input.inputEl;

  input.onChange((value) => {
    const currentButton = modalInstance.getCurrentButton();
    currentButton.action.value = value;
    if (modalInstance.actionValueInputEl) {
      modalInstance.actionValueInputEl.classList.remove('input-error');
    }
  });

  input.inputEl.addEventListener('keydown', (e) => { if (e.key === 'Enter') { modalInstance.saveButton(); } });
} 