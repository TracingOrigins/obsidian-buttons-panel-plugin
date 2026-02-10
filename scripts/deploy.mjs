// scripts/deploy.mjs
// 统一的 Obsidian 插件部署脚本
//
// 用法：
//   node scripts/deploy.mjs dev   // 开发模式：在 Vault 中创建指向 dist 的软链接
//   node scripts/deploy.mjs build // 构建模式：将 dist 中的文件复制到 Vault 插件目录
//
// 约定：
// - 必须显式传入模式参数（"dev" 或 "build"），否则脚本会报错退出。
// - 需要在项目根目录提供 .env 文件，并设置：
//     VAULT_PATH=/你的/Obsidian/Vault/路径
// - 插件 ID 从 manifest.json 的 id 字段读取，最终部署到：
//     <VAULT_PATH>/.obsidian/plugins/<pluginId>/
//
// 典型流程：
// 1. 解析模式参数（dev/build）。
// 2. 解析 Vault 路径和插件 ID，并校验配置。
// 3. 准备 dist 目录（确保存在 .hotreload 标记）。
// 4. 在 dev 模式下创建/复用软链接，在 build 模式下复制构建产物。

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import dotenv from 'dotenv';

// ==================== 路径常量 ====================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../');
const envPath = path.join(projectRoot, '.env');
const distDir = path.join(projectRoot, 'dist');
const manifestPath = path.join(projectRoot, 'manifest.json');

// ==================== 通用工具函数 ====================

/**
 * 简单的日志工具，统一控制台输出格式并添加清晰的图标前缀。
 * 在本脚本中，建议优先使用该工具而不是直接使用 console.log/console.error。
 */
const log = {
	success: (msg) => console.log(`✅ ${msg}`),
	error: (msg) => console.error(`❌ ${msg}`),
	info: (msg) => console.log(`ℹ️  ${msg}`),
	warn: (msg) => console.warn(`⚠️  ${msg}`),
};

/**
 * 递归复制目录，将 src 目录完整复制到 dest（包含子目录和文件）。
 * 常用于将构建产物整体复制到插件目录。
 * @param src 源目录路径
 * @param dest 目标目录路径
 */
function copyDir(src, dest) {
	fs.mkdirSync(dest, { recursive: true });
	
	const entries = fs.readdirSync(src, { withFileTypes: true });
	for (const entry of entries) {
		const srcPath = path.join(src, entry.name);
		const destPath = path.join(dest, entry.name);
		
		if (entry.isDirectory()) {
			copyDir(srcPath, destPath);
		} else {
			fs.copyFileSync(srcPath, destPath);
		}
	}
}

/**
 * 创建可点击的路径链接（使用 OSC 8 转义序列，在部分终端中可直接点击文件路径）。
 * 主要用于在控制台输出中提供方便跳转的本地文件链接。
 * @param filePath 本地文件或目录路径
 * @param displayText 展示给用户看的文本（可选，默认显示原始路径）
 * @returns 带有终端点击跳转能力的字符串
 */
function createClickablePath(filePath, displayText) {
	const resolvedPath = path.resolve(filePath);
	let targetPathForUrl = resolvedPath;

	// 如果目标是目录，给 URL 结尾补上 "/"，部分终端/系统对目录打开更稳定
	try {
		if (fs.existsSync(resolvedPath) && fs.lstatSync(resolvedPath).isDirectory()) {
			targetPathForUrl = resolvedPath.endsWith(path.sep) ? resolvedPath : resolvedPath + path.sep;
		}
	} catch {
		// 忽略：只要能生成 URL 即可
	}

	// 使用标准 API 生成 file:// URL（自动处理 Windows 盘符与空格编码）
	const fileUrl = pathToFileURL(targetPathForUrl).href;
	const text = displayText ?? path.basename(resolvedPath);
	return `\x1b]8;;${fileUrl}\x1b\\${text}\x1b]8;;\x1b\\`;
}

// ==================== 参数与配置解析 ====================

/**
 * 解析命令行参数，返回当前模式字符串。
 * 支持两种模式：dev 和 build。
 * - 传入 "dev"  → dev 模式
 * - 传入 "build" → build 模式
 * - 未传参数或传入其他值 → 视为非法，直接报错退出
 * @param argv Node.js 的 process.argv 数组
 * @returns mode 字符串："dev" | "build"
 */
function parseMode(argv) {
	const arg = argv[2];

	if (arg === 'dev') {
		return 'dev';
	}

	if (arg === 'build') {
		return 'build';
	}

	if (!arg) {
		log.error('缺少模式参数，请使用 "dev" 或 "build"。');
	} else {
		log.error(`不支持的模式参数: "${arg}"，请使用 "dev" 或 "build"。`);
	}
	process.exit(1);
}

/**
 * 解析并返回 Obsidian Vault 的绝对路径。
 * - 如果 .env 不存在，则静默退出（便于在 CI/CD 场景中跳过部署）。
 * - 如果 VAULT_PATH 未设置，则输出错误并退出。
 * @returns 解析后的 VAULT 绝对路径
 */
function getVaultPath() {
	// 如果没有 .env，静默退出（允许 CI/CD 场景）
	if (!fs.existsSync(envPath)) {
		log.warn('.env 文件不存在，跳过部署');
		process.exit(0);
	}

	dotenv.config({ path: envPath });
	const vaultPath = process.env.VAULT_PATH;

	if (!vaultPath) {
		log.error('未设置 VAULT_PATH，请在 .env 文件中设置 VAULT_PATH=你的vault路径');
		process.exit(1);
	}

	return path.resolve(vaultPath);
}

/**
 * 从 manifest.json 读取插件 ID，作为部署目标目录名。
 * - 当 manifest.json 不存在或无法解析时会直接退出。
 * @returns 插件 ID（通常与插件文件夹名相同）
 */
function getPluginId() {
	// 读取插件ID（统一从项目根目录读取 manifest.json）
	if (!fs.existsSync(manifestPath)) {
		log.error(`manifest.json 文件未找到，无法获取插件ID: ${manifestPath}`);
		process.exit(1);
	}

	try {
		const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
		const pluginId = manifest.id;
		if (!pluginId) throw new Error();
		return pluginId;
	} catch {
		log.error('无法从 manifest.json 获取插件ID。');
		process.exit(1);
	}
}

// ==================== 目录准备与校验 ====================

/**
 * 确保 dist 目录及热重载标记文件就绪。
 * - 如果 dist 目录不存在则自动创建。
 * - 如果 .hotreload 文件不存在则创建空文件，便于其他工具做热重载检测。
 */
function ensureDistReady() {
	// 检查 dist 目录
	if (!fs.existsSync(distDir)) {
		fs.mkdirSync(distDir, { recursive: true });
	}
	// 确保 .hotreload 文件存在
	const hotreloadPath = path.join(distDir, '.hotreload');
	if (!fs.existsSync(hotreloadPath)) {
		fs.writeFileSync(hotreloadPath, '');
	}
}

/**
 * 计算插件目录路径：基于 vault 根路径和插件 ID。
 * 如果插件目录与 dist 目录相同，则直接退出，避免递归复制或循环链接。
 * @param vaultPath Vault 根路径
 * @param pluginId 插件 ID
 * @returns 插件目录绝对路径
 */
function getPluginDir(vaultPath, pluginId) {
	const pluginDir = path.join(vaultPath, '.obsidian', 'plugins', pluginId);

	// 如果插件目录与 dist 目录相同，则直接退出，避免递归复制或循环链接
	if (path.resolve(pluginDir) === path.resolve(distDir)) {
		process.exit(0);
	}

	return pluginDir;
}

// ==================== 插件目录处理 ====================

/**
 * 备份已有插件目录中的 data.json。
 * - 仅当插件目录存在且为目录时生效。
 * - 如果目录下存在 data.json，则复制到 dist 目录内，避免重新部署时丢失用户配置。
 * @param vaultPath Vault 根路径
 * @param pluginId 插件 ID
 */
function backupDataJson(pluginDir) {
	// 不存在或不是文件夹则直接跳过
	if (!fs.existsSync(pluginDir)) return;
	const stats = fs.lstatSync(pluginDir);
	if (!stats.isDirectory()) return;

	// 仅在存在 data.json 时才进行复制
	const dataJsonPath = path.join(pluginDir, 'data.json');
	if (!fs.existsSync(dataJsonPath)) return;

	// 复制 data.json 到 dist 目录
	const distDataJsonPath = path.join(distDir, 'data.json');
	fs.copyFileSync(dataJsonPath, distDataJsonPath);
}

/**
 * 判断现有路径是否为指向 dist 的软链接（支持相对路径解析）。
 * @param pluginDir 现有插件目录路径（可能为软链接）
 * @returns 是否为指向 dist 目录的软链接
 */
function isExistingSymlinkToDist(pluginDir) {
	const linkTarget = fs.readlinkSync(pluginDir);
	const resolvedLinkTarget = path.resolve(path.dirname(pluginDir), linkTarget);
	return resolvedLinkTarget === path.resolve(distDir);
}

/**
 * 删除指定路径（文件或目录），失败时打印错误并退出。
 * @param targetPath 需要删除的文件或目录路径
 */
function removePath(targetPath) {
	try {
		fs.rmSync(targetPath, { recursive: true, force: true });
	} catch (err) {
		log.error(`处理目标路径时出错: ${err.message}`);
		process.exit(1);
	}
}

// ==================== 部署实现 ====================

/**
 * dev 模式：创建从 dist 到插件目录的符号链接（Windows 使用 junction）。
 * - 如果插件目录已存在且是指向 dist 的软链接，会直接复用并返回。
 * - 否则在创建链接前会清理旧目录并确保父目录存在。
 * @param context 部署上下文（包含 mode、vaultPath、pluginId、pluginDir 等）
 */
function deployDev(context) {
	const { pluginDir, pluginId } = context;
	const linkType = process.platform === 'win32' ? 'junction' : 'dir';

	// 如果目标目录已存在，优先尝试复用已有的软链接
	if (fs.existsSync(pluginDir)) {
		const stats = fs.lstatSync(pluginDir);

		// 已存在且是软链接，且指向 dist：直接复用并返回
		if (stats.isSymbolicLink() && isExistingSymlinkToDist(pluginDir)) {
			log.info(`链接成功：${createClickablePath(distDir, 'dist')} → ${createClickablePath(pluginDir, pluginId)}`);
			return;
		}

		// 否则删除旧目录/文件，为重新创建链接做准备
		removePath(pluginDir);
	}

	// 确保父目录存在
	fs.mkdirSync(path.dirname(pluginDir), { recursive: true });
	
	fs.symlinkSync(distDir, pluginDir, linkType);
	log.info(`链接成功：${createClickablePath(distDir, 'dist')} → ${createClickablePath(pluginDir, pluginId)}`);
}

/**
 * build 模式：将 dist 内的构建产物完整复制到插件目录。
 * 会先确保插件目录存在，然后将 dist 下的所有文件/子目录复制过去。
 * @param context 部署上下文（包含 mode、vaultPath、pluginId、pluginDir 等）
 */
function deployBuild(context) {
	const { pluginDir, pluginId } = context;

	// 如果目标目录已存在，先删除旧目录，避免残留文件影响结果
	if (fs.existsSync(pluginDir)) {
		removePath(pluginDir);
	}

	fs.mkdirSync(pluginDir, { recursive: true });
	copyDir(distDir, pluginDir);
	// 统计复制后的文件数量，用于日志输出
	const fileNames = fs.readdirSync(pluginDir).sort();
	log.info(`复制成功：${createClickablePath(distDir, 'dist')} → ${createClickablePath(pluginDir, pluginId)}`);
}

// ==================== 主流程入口 ====================

/**
 * 部署脚本主入口：
 * 1. 解析运行模式（dev/build）。
 * 2. 解析 Vault 路径和插件 ID。
 * 3. 准备 dist 目录并处理已有插件目录（备份配置 / 复用链接）。
 * 4. 根据模式执行软链接或复制部署。
 */
function main() {
	const mode = parseMode(process.argv);

	const vaultPath = getVaultPath();
	const pluginId = getPluginId();
	const pluginDir = getPluginDir(vaultPath, pluginId);
	backupDataJson(pluginDir);
	ensureDistReady();

	log.info(`开始部署：${mode} 模式`);
	
	// 构造部署上下文
	const context = { mode, vaultPath, pluginId, pluginDir };

	// 执行部署操作
	try {
		switch (mode) {
			case 'dev':
				deployDev(context);
				break;
			case 'build':
				deployBuild(context);
				break;
			default:
				log.error(`不支持的模式: ${mode}`);
				process.exit(1);
		}

		log.success(`部署完成！`);
	} catch (err) {
		log.error(`${mode === 'dev' ? '创建软链接' : '复制'}失败: ${err.message}`);
		process.exit(1);
	}
}

main();

