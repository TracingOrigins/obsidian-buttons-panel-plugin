import { Setting, TextComponent } from 'obsidian';
import { t } from '../../../utils/i18n';
import { createScopeSection } from './ScopeSection';
import { CommandSearchModal } from '../CommandSearchModal';
import { safeSetSVG } from '../../../utils/validation';

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