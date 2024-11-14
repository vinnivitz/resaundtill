import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import esLintPluginImport from 'eslint-plugin-import';
import globals from 'globals';
import parser from 'svelte-eslint-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
	baseDirectory: __dirname,
	recommendedConfig: js.configs.recommended,
	allConfig: js.configs.all
});

/** @type { import("eslint").ESLint.ConfigData } */
export default [
	{
		ignores: [
			'**/node_modules',
			'build',
			'.svelte-kit',
			'**/.env',
			'**/pnpm-lock.yaml',
			'static',
			'src/lib/components/calendar'
		]
	},
	...compat.extends(
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:svelte/recommended',
		'prettier'
	),
	{
		plugins: {
			'@typescript-eslint': typescriptEslint,
			import: esLintPluginImport
		},

		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node
			},

			parser: tsParser,
			ecmaVersion: 2020,
			sourceType: 'module',

			parserOptions: {
				extraFileExtensions: ['.svelte']
			}
		},

		settings: {
			'import/parsers': {
				'@typescript-eslint/parser': ['.ts', '.svelte']
			},

			'import/resolver': {
				typescript: {
					alwaysTryTypes: true,
					project: './tsconfig.json'
				}
			}
		},

		rules: {
			'svelte/no-at-html-tags': 'off',
			'no-global-assign': 'off',

			'import/order': [
				'error',
				{
					groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],

					pathGroups: [
						{
							pattern: '$app/**',
							group: 'internal',
							position: 'after'
						}
					],

					pathGroupsExcludedImportTypes: ['builtin'],
					'newlines-between': 'always',

					alphabetize: {
						order: 'asc',
						caseInsensitive: true
					}
				}
			],

			'no-restricted-imports': [
				'error',
				{
					patterns: [
						{
							group: ['$lib/models/*', '$lib/utils/*'],
							message: 'Please import from the index file.'
						}
					]
				}
			],

			'import/no-duplicates': 'error',

			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					argsIgnorePattern: '^_'
				}
			],

			'@typescript-eslint/explicit-function-return-type': [
				'error',
				{
					allowExpressions: true,
					allowTypedFunctionExpressions: true
				}
			]
		}
	},
	{
		files: ['**/*.svelte'],

		languageOptions: {
			parser: parser,
			ecmaVersion: 5,
			sourceType: 'script',

			parserOptions: {
				parser: '@typescript-eslint/parser'
			}
		}
	}
];