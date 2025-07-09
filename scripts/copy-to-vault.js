// scripts/copy-to-vaults.js
// 使用 dotenv 方式，直接通过 process.env.VAULT_PATH 获取目标路径，含中英文日志
const fs = require('fs');
const path = require('path');
// 修改为加载项目根目录下的 .env 文件
require('dotenv').config({ path: path.resolve(__dirname, '../.env') }); // 加载根目录 .env

const filesToCopy = [
  'main.js',
  'styles.css',
  'manifest.json'
];

const projectRoot = path.resolve(__dirname, '../');
const manifestPath = path.join(projectRoot, 'manifest.json');

const VAULT_PATH = process.env.VAULT_PATH;
if (!VAULT_PATH) {
  console.warn('未设置 VAULT_PATH，跳过复制。(VAULT_PATH not set in .env, skip copying.)');
  process.exit(0);
}
const absVaultPath = path.resolve(VAULT_PATH);

// 读取 manifest.json 获取插件ID
if (!fs.existsSync(manifestPath)) {
  console.error('manifest.json 文件未找到，无法获取插件ID。(manifest.json not found, cannot get plugin id.)');
  process.exit(1);
}
let pluginId = '';
try {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  pluginId = manifest.id;
  if (!pluginId) throw new Error();
} catch {
  console.error('无法从 manifest.json 获取插件ID。(Cannot get plugin id from manifest.json)');
  process.exit(1);
}

// 拼接目标插件目录
const pluginDir = path.join(absVaultPath, '.obsidian', 'plugins', pluginId);
if (pluginDir === projectRoot) {
  console.warn(`目标目录就是项目根目录(${pluginDir})，跳过复制。(Target directory is the project root itself, skip copying.)`);
  process.exit(0);
}

// 确保目标目录存在
if (!fs.existsSync(pluginDir)) {
  fs.mkdirSync(pluginDir, { recursive: true });
  console.log(`已创建插件目录: ${pluginDir}`);
}

// 复制文件
let allSuccess = true;
for (const file of filesToCopy) {
  const src = path.join(projectRoot, file);
  const dest = path.join(pluginDir, file);
  if (!fs.existsSync(src)) {
    console.warn(`未找到文件: ${src}，跳过。(File not found, skip: ${src})`);
    allSuccess = false;
    continue;
  }
  try {
    fs.copyFileSync(src, dest);
    console.log(`已复制文件: ${file} -> ${dest}`);
  } catch (err) {
    console.error(`复制 ${file} 到 ${dest} 失败: ${err.message}`);
    allSuccess = false;
  }
}
if (allSuccess) {
  console.log(`所有文件已成功复制到 Obsidian 库的 ${pluginId} 插件目录！(All files copied to Obsidian vault plugin dir successfully!)`);
} else {
  console.warn('部分文件复制失败，请检查上方日志。(Some files failed to copy, see above logs.)');
} 