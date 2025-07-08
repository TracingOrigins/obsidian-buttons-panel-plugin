/**
 * 路径处理工具函数
 */

/**
 * 从路径中提取文件夹部分
 * @param path 路径字符串
 * @returns 文件夹路径
 */
export function getFolderFromPath(path: string): string {
	if (!path) return '';
	const lastSlashIndex = path.lastIndexOf('/');
	return lastSlashIndex > -1 ? path.substring(0, lastSlashIndex) : '/';
}

/**
 * 从路径中提取文件名（不含扩展名）
 * @param path 路径字符串
 * @returns 文件名
 */
export function getFileNameFromPath(path: string): string {
	const lastSlashIndex = path.lastIndexOf('/');
	const fileName = lastSlashIndex > -1 ? path.substring(lastSlashIndex + 1) : path;
	const dotIndex = fileName.lastIndexOf('.');
	return dotIndex > -1 ? fileName.substring(0, dotIndex) : fileName;
}

/**
 * 根据文件夹和文件名，生成完整的文件路径
 * @param folder 文件夹路径
 * @param fileName 文件名
 * @returns 完整的文件路径
 */
export function buildFilePath(folder: string, fileName: string): string {
	// 清理文件名，移除开头和结尾的斜杠
	fileName = fileName.replace(/^\/+|\/+$/g, '').replace(/^\/|\/$/g, '');

	// 确保文件名以 .md 结尾
	const finalFileName = fileName.endsWith('.md') ? fileName : `${fileName}.md`;

	let fullPath = '';
	if (folder && folder.trim() !== '' && folder !== '/') {
		// 清理文件夹路径，移除开头和结尾的斜杠
		folder = folder.replace(/^\/+|\/+$/g, '').replace(/^\/|\/$/g, '');
		fullPath = `${folder}/${finalFileName}`;
	} else {
		fullPath = finalFileName;
	}

	return fullPath;
} 
