import { Setting, TextComponent } from 'obsidian';
import { t } from '../../../utils/i18n';
import { createScopeSection } from './ScopeSection';
import { CommandSearchModal } from '../CommandSearchModal';

export function createExcuteCommandSection(container: HTMLElement, modalInstance: any) {
  const wrapper = container.createDiv({ cls: 'command-input-wrapper' });
  const input = new TextComponent(wrapper)
    .setPlaceholder(t('command_id_placeholder', modalInstance.plugin))
    .setValue(modalInstance.getCurrentButton()?.action.value || '');

  modalInstance.actionValueInputEl = input.inputEl;

  const onSelect = (commandId: string) => {
    input.setValue(commandId);
    const currentButton = modalInstance.getCurrentButton();
    currentButton.action.value = commandId;
    if (modalInstance.actionValueInputEl) {
      modalInstance.actionValueInputEl.classList.remove('input-error');
    }
  };

  const setting = new Setting(container)
    .setName(t('command_id', modalInstance.plugin))
    .setDesc(t('command_id_placeholder', modalInstance.plugin))
    .addButton(button => button
      .setButtonText('')
      .setClass('custom-button')
      .setTooltip(t('search_commands_tooltip', modalInstance.plugin))
      .setIcon('search')
      .onClick(() => {
        new CommandSearchModal(modalInstance.app, modalInstance.plugin, onSelect).open();
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