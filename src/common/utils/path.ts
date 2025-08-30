// path.ts
// 路径处理相关工具函数。
import { normalizePath } from 'obsidian';

/**
 * 从路径中提取文件夹部分。
 * @param path 路径字符串
 * @returns 文件夹路径
 */
export function getFolderFromPath(path: string): string {
    if (!path) return '';
    const lastSlashIndex = path.lastIndexOf('/');
    return lastSlashIndex > -1 ? path.substring(0, lastSlashIndex) : '/';
}

/**
 * 从路径中提取文件名（不含扩展名）。
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
 * 根据文件夹和文件名，生成完整的文件路径。
 * @param folder 文件夹路径
 * @param fileName 文件名
 * @returns 完整的文件路径
 */
export function buildFilePath(folder: string, fileName: string): string {
    // 使用 normalizePath 清理路径
    fileName = normalizePath(fileName);

    // 确保文件名以 .md 结尾
    const finalFileName = fileName.endsWith('.md') ? fileName : `${fileName}.md`;

    let fullPath = '';
    if (folder && folder.trim() !== '' && folder !== '/') {
        // 使用 normalizePath 清理文件夹路径
        folder = normalizePath(folder);
        fullPath = `${folder}/${finalFileName}`;
    } else {
        fullPath = finalFileName;
    }

    return fullPath;
}
