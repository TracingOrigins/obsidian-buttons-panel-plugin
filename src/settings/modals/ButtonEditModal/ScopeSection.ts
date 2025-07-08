import { ButtonsPanelPlugin } from '../../../types/plugin';
import { Setting } from 'obsidian';
import { t } from '../../../utils/i18n';

export function createScopeSection(container: HTMLElement, modalInstance: any) {
  new Setting(container)
    .setName(t('action_scope'))
    .setDesc(t('action_scope_desc'))
    .addDropdown(dropdown => {
      const scopeOptions = [
        { value: 'global', label: t('global', modalInstance.plugin) },
        { value: 'current-editor', label: t('current_editor', modalInstance.plugin) }
      ];
      scopeOptions.forEach(opt => dropdown.addOption(opt.value, opt.label));
      const current = modalInstance.getCurrentButton()?.action.parameters?.scope ?? 'global';
      dropdown.setValue(current);
      dropdown.onChange((value) => {
        const currentButton = modalInstance.getCurrentButton();
        if (!currentButton.action.parameters) currentButton.action.parameters = {};
        currentButton.action.parameters.scope = value;
      });
    });
} 