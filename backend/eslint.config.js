import js from '@eslint/js';
import importX from 'eslint-plugin-import-x';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

export default [
    js.configs.recommended,
    {
        files: ['**/*.js'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: {
                process: 'readonly',
                console: 'readonly',
                setTimeout: 'readonly',
                clearTimeout: 'readonly',
                setInterval: 'readonly',
                clearInterval: 'readonly',
                Buffer: 'readonly',
                __dirname: 'readonly',
                __filename: 'readonly',
            },
        },
        plugins: {
            'import-x': importX,
            prettier: prettierPlugin,
        },
        rules: {
            ...importX.configs.recommended.rules,
            'import-x/no-unresolved': 'error',
            'import-x/no-duplicates': 'error',
            'import-x/extensions': ['error', 'always', { ignorePackages: true }],
            'import-x/order': [
                'error',
                {
                    groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
                    'newlines-between': 'always',
                    alphabetize: { order: 'asc', caseInsensitive: true },
                },
            ],
            'no-console': 'off',
            'consistent-return': 'off',
            'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            'prefer-destructuring': ['warn', { object: true, array: false }],
            'prettier/prettier': 'error',
        },
    },
    prettierConfig,
];
