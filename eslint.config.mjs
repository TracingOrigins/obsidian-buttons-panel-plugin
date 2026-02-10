import tseslint from 'typescript-eslint';
import obsidianmd from 'eslint-plugin-obsidianmd';
import globals from 'globals';

export default tseslint.config(
	{
		ignores: [
			'**/node_modules/**',
			'**/dist/**',
			'**/scripts/**',
			'esbuild.config.mjs',
			'eslint.config.mjs',
			'version-bump.mjs',
			'versions.json',
			'package.json',
			'main.js',
			'*.js',
		],
	},
	// 先应用 Obsidian 官方推荐规则
	...obsidianmd.configs.recommended,
	// 再在最后一层统一放宽规则，以当前项目的实际情况为准
	{
		languageOptions: {
			globals: {
				...globals.browser,
			},
			parserOptions: {
				projectService: {
					allowDefaultProject: ['eslint.config.js', 'manifest.json'],
				},
				tsconfigRootDir: import.meta.dirname,
				extraFileExtensions: ['.json'],
			},
		},
		rules: {
			// 放宽类型安全规则，允许 any 类型（现有代码库大量使用）
			'@typescript-eslint/no-explicit-any': 'warn',
			'@typescript-eslint/no-unsafe-assignment': 'warn',
			'@typescript-eslint/no-unsafe-member-access': 'warn',
			'@typescript-eslint/no-unsafe-call': 'warn',
			'@typescript-eslint/no-unsafe-argument': 'warn',
			'@typescript-eslint/no-unsafe-return': 'warn',
			// 放宽 Promise 相关规则，避免大量事件回调报错
			'@typescript-eslint/no-floating-promises': 'warn',
			'@typescript-eslint/no-misused-promises': 'warn',
			// 放宽类型断言规则，保留部分断言以兼容现有代码
			'@typescript-eslint/no-unnecessary-type-assertion': 'warn',
			// 允许未使用的变量（可能是预留的）
			'@typescript-eslint/no-unused-vars': [
				'warn',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
				},
			],
			// 允许 console.warn 和 console.error
			'no-console': ['warn', { allow: ['warn', 'error'] }],
		},
	},
);
