import {Notice} from 'obsidian';
import {ButtonConfig} from '../types';
import {ButtonsPanelPlugin} from '../types/plugin';
import {t} from './i18n';

/**
 * 按钮表单校验结果接口
 */
export interface ButtonValidationResult {
	/** 是否有错误 */
	hasError: boolean;
	/** 错误消息列表 */
	errorMessages: string[];
	/** 需要添加错误样式的输入元素 */
	errorElements: HTMLInputElement[];
}

/**
 * 按钮表单校验参数接口
 */
export interface ButtonValidationParams {
	/** 按钮配置对象 */
	button: ButtonConfig;
	/** 插件实例 */
	plugin: ButtonsPanelPlugin;
	/** 名称输入框元素 */
	nameInputEl?: HTMLInputElement | null;
	/** 动作值输入框元素 */
	actionValueInputEl?: HTMLInputElement | null;
	/** 文件夹输入框元素 */
	folderInputEl?: HTMLInputElement | null;
	/** 文件名输入框元素 */
	fileNameInputEl?: HTMLInputElement | null;
}

/**
 * 校验按钮表单数据
 * @param params 校验参数
 * @returns 校验结果
 */
export function validateButtonForm(params: ButtonValidationParams): ButtonValidationResult {
	const {button, plugin, nameInputEl, actionValueInputEl, folderInputEl, fileNameInputEl} = params;

	const result: ButtonValidationResult = {
		hasError: false,
		errorMessages: [],
		errorElements: []
	};

	// 先移除所有错误样式
	if (nameInputEl) nameInputEl.classList.remove('input-error');
	if (actionValueInputEl) actionValueInputEl.classList.remove('input-error');
	if (folderInputEl) folderInputEl.classList.remove('input-error');
	if (fileNameInputEl) fileNameInputEl.classList.remove('input-error');

	// 校验按钮名称
	if (!button.name || button.name.trim() === '') {
		if (nameInputEl) {
			nameInputEl.classList.add('input-error');
			result.errorElements.push(nameInputEl);
		}
		result.errorMessages.push(t('button_name_empty', plugin));
		result.hasError = true;
	}

	// 根据动作类型进行不同校验
	if (button.action.type === 'create_file') {
		// 创建文件类型的特殊校验
		const folder = folderInputEl ? folderInputEl.value : '';
		const fileName = fileNameInputEl ? fileNameInputEl.value : '';

		if (!folder || folder.trim() === '') {
			if (folderInputEl) {
				folderInputEl.classList.add('input-error');
				result.errorElements.push(folderInputEl);
			}
			result.errorMessages.push(t('folder_empty', plugin));
			result.hasError = true;
		}

		if (!fileName || fileName.trim() === '') {
			if (fileNameInputEl) {
				fileNameInputEl.classList.add('input-error');
				result.errorElements.push(fileNameInputEl);
			}
			result.errorMessages.push(t('file_name_empty', plugin));
			result.hasError = true;
		}
	} else {
		// 其他动作类型的校验
		if (!button.action.value || button.action.value.trim() === '') {
			if (actionValueInputEl) {
				actionValueInputEl.classList.add('input-error');
				result.errorElements.push(actionValueInputEl);
			}

			// 根据动作类型显示不同的错误消息
			switch (button.action.type) {
				case 'file':
					result.errorMessages.push(t('file_path_empty', plugin));
					break;
				case 'command':
					result.errorMessages.push(t('command_id_empty', plugin));
					break;
				case 'url':
					result.errorMessages.push(t('url_empty', plugin));
					break;
				case 'script':
					result.errorMessages.push(t('script_file_empty', plugin));
					break;
				default:
					result.errorMessages.push(t('action_value_empty', plugin));
					break;
			}
			result.hasError = true;
		}
	}

	return result;
}

/**
 * 显示校验错误提示
 * @param result 校验结果
 */
export function showValidationErrors(result: ButtonValidationResult): void {
	if (result.hasError) {
		new Notice(result.errorMessages.join('\n'));
	}
}

/**
 * 清除所有输入框的错误样式
 * @param elements 输入框元素数组
 */
export function clearErrorStyles(elements: (HTMLInputElement | null)[]): void {
	elements.forEach(element => {
		if (element) {
			element.classList.remove('input-error');
		}
	});
}

/**
 * 安全地将SVG字符串插入到指定元素，只允许<svg>标签，移除所有事件属性和<script>标签。
 * @param el 目标元素
 * @param svgString SVG字符串
 */
export function safeSetSVG(el: HTMLElement, svgString: string) {
  if (!svgString || !svgString.trim().startsWith('<svg')) {
    el.empty();
    return;
  }
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, 'image/svg+xml');
  const svg = doc.querySelector('svg');
  if (svg) {
    // 移除所有事件属性（on*）
    const removeEventAttrs = (node: Element) => {
      Array.from(node.attributes).forEach(attr => {
        if (/^on/i.test(attr.name)) {
          node.removeAttribute(attr.name);
        }
      });
      Array.from(node.children).forEach(child => removeEventAttrs(child as Element));
    };
    removeEventAttrs(svg);
    // 移除所有<script>标签
    svg.querySelectorAll('script').forEach(script => script.remove());
    el.empty();
    el.appendChild(svg);
  } else {
    el.empty();
  }
}
