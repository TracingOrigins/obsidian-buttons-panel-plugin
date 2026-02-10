import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, ".");

const packagePath = resolve(projectRoot, "package.json");
const manifestPath = resolve(projectRoot, "manifest.json");
const versionsPath = resolve(projectRoot, "versions.json");

// 读取文件
const packageJson = JSON.parse(readFileSync(packagePath, "utf8"));
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const versions = JSON.parse(readFileSync(versionsPath, "utf8"));

// 确定目标版本（优先使用环境变量，否则使用 package.json）
const targetVersion = process.env.npm_package_version || packageJson.version;
const { minAppVersion } = manifest;

if (!targetVersion) {
	console.error("❌ 无法确定版本号");
	process.exit(1);
}

// 更新 manifest.json
manifest.version = targetVersion;
writeFileSync(manifestPath, JSON.stringify(manifest, null, "\t") + "\n");
console.log(`✅ 已更新 manifest.json 版本: ${targetVersion}`);

// 更新 versions.json（如果版本不存在）
if (!versions[targetVersion]) {
	versions[targetVersion] = minAppVersion;
	writeFileSync(versionsPath, JSON.stringify(versions, null, "\t") + "\n");
	console.log(`✅ 已添加版本映射: ${targetVersion} -> ${minAppVersion}`);
} else {
	console.log(`ℹ️  版本 ${targetVersion} 已存在于 versions.json`);
}

console.log(`✅ 版本同步完成: ${targetVersion} (minAppVersion: ${minAppVersion})`);
