import { Setting, TextComponent } from 'obsidian';
import { buildFilePath, getFileNameFromPath, getFolderFromPath } from '../../../utils/path';
import { t } from '../../../utils/i18n';
import { FolderSearchModal } from '../FolderSearchModal';
import { FileNameSuggestModal } from '../FileNameSuggestModal';
import { FileSearchModal } from '../FileSearchModal';

export function createCreateFileSection(container: HTMLElement, modalInstance: any) {
  // 1. 文件夹输入
  const folderSetting = new Setting(container)
    .setName(t('folder', modalInstance.plugin))
    .setDesc(t('folder_placeholder', modalInstance.plugin));
  folderSetting.addButton(button => {
    button
      .setButtonText('')
      .setClass('custom-button')
      .setTooltip(t('search_folders_tooltip', modalInstance.plugin))
      .setIcon('search')
      .onClick(() => {
        new FolderSearchModal(modalInstance.app, modalInstance.plugin, (folderPath: string) => {
          folderInput.setValue(folderPath);
          const currentButton = modalInstance.getCurrentButton();
          currentButton.action.value = buildFilePath(folderPath, fileNameInput.getValue());
          if (modalInstance.folderInputEl) {
            modalInstance.folderInputEl.classList.remove('input-error');
          }
        }).open();
      });
    button.buttonEl.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>';
  });
  const folderInput = new TextComponent(folderSetting.controlEl)
    .setPlaceholder(t('folder_placeholder', modalInstance.plugin))
    .setValue(getFolderFromPath(modalInstance.getCurrentButton()?.action.value || ''));
  modalInstance.folderInputEl = folderInput.inputEl;
  folderInput.onChange((value) => {
    const currentButton = modalInstance.getCurrentButton();
    currentButton.action.value = buildFilePath(value, fileNameInput.getValue());
    if (modalInstance.folderInputEl) {
      modalInstance.folderInputEl.classList.remove('input-error');
    }
  });

  // 2. 文件名输入
  const fileNameSetting = new Setting(container)
    .setName(t('file_name', modalInstance.plugin))
    .setDesc(t('file_name_desc', modalInstance.plugin));
  fileNameSetting.addButton(button => {
    button
      .setButtonText(t('search', modalInstance.plugin))
      .setClass('custom-button')
      .setTooltip(t('search_date_variables_tooltip', modalInstance.plugin))
      .setIcon('search')
      .onClick(() => {
        new FileNameSuggestModal(modalInstance.app, modalInstance.plugin, (val: string) => {
          fileNameInput.setValue(val);
          const currentButton = modalInstance.getCurrentButton();
          currentButton.action.value = buildFilePath(folderInput.getValue(), val);
          if (modalInstance.fileNameInputEl) {
            modalInstance.fileNameInputEl.classList.remove('input-error');
          }
        }).open();
      });
    button.buttonEl.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>';
  });
  const fileNameInput = new TextComponent(fileNameSetting.controlEl)
    .setPlaceholder(t('file_name_placeholder', modalInstance.plugin))
    .setValue(getFileNameFromPath(modalInstance.getCurrentButton()?.action.value || ''));
  modalInstance.fileNameInputEl = fileNameInput.inputEl;
  fileNameInput.onChange((value) => {
    const currentButton = modalInstance.getCurrentButton();
    currentButton.action.value = buildFilePath(folderInput.getValue(), value);
    if (modalInstance.fileNameInputEl) {
      modalInstance.fileNameInputEl.classList.remove('input-error');
    }
  });
  fileNameInput.inputEl.addEventListener('keydown', (e) => { if (e.key === 'Enter') { modalInstance.saveButton(); } });

  // 3. 模板输入
  const templateSetting = new Setting(container)
    .setName(t('template_file', modalInstance.plugin))
    .setDesc(t('template_file_desc', modalInstance.plugin));
  const templateFolder = modalInstance.plugin?.settings?.pathSettings?.templateFolderPath ?? '';
  templateSetting.addButton(button => {
    button
      .setButtonText('')
      .setClass('custom-button')
      .setTooltip(t('search_files_tooltip', modalInstance.plugin))
      .setIcon('search')
      .onClick(() => {
        new FileSearchModal(modalInstance.app, modalInstance.plugin, (file: any) => {
          let fileName = file?.name || (typeof file === 'string' ? file : '');
          if (!fileName.endsWith('.md')) return;
          templateInput.setValue(fileName);
          const currentButton = modalInstance.getCurrentButton();
          if (!currentButton.action.parameters) currentButton.action.parameters = {};
          currentButton.action.parameters.templateName = fileName;
        }, {
          rootFolder: templateFolder,
          fileExts: ['md'],
          showFileNameOnly: true
        }).open();
      });
    button.buttonEl.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>';
  });
  const templateInput = new TextComponent(templateSetting.controlEl)
    .setPlaceholder(t('template_file_placeholder', modalInstance.plugin))
    .setValue(modalInstance.getCurrentButton()?.action.parameters?.templateName || '');
  templateInput.onChange((value) => {
    const currentButton = modalInstance.getCurrentButton();
    if (!currentButton.action.parameters) currentButton.action.parameters = {};
    currentButton.action.parameters.templateName = value;
  });
} 