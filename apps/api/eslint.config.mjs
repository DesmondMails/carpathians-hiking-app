// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';
import safeql from '@ts-safeql/eslint-plugin/config';
import 'dotenv/config';

// SafeQL needs a server-level connection (not the app database itself)
function safeqlConnectionUrl() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required for SafeQL');
  }
  const url = new URL(process.env.DATABASE_URL);
  url.pathname = '/postgres';
  url.search = '';
  return url.toString();
}

export default tseslint.config(
  {
    ignores: [
      'eslint.config.mjs',
      '**/*.d.ts',
      'prisma.config.ts',
      'prisma.config.js',
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
      'no-console': 'warn',
    },
  },
  safeql.configs.connections({
    // SafeQL creates a temporary database on this server and applies migrations to it
    connectionUrl: safeqlConnectionUrl(),
    migrationsDir: './prisma/migrations',
    targets: [
      // This makes `prisma.$queryRaw` and `prisma.$executeRaw` commands linted
      {
        tag: 'prisma.+($queryRaw|$executeRaw)',
        transform: '{type}[]',
      },
      { tag: 'tx.+($queryRaw|$executeRaw)', transform: '{type}[]' },
    ],
    overrides: {
      types: {
        geography: 'string',
        geometry: 'string',
      },
    },
  }),
  {
    plugins: {
      import: importPlugin,
    },
    rules: {
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            ['parent', 'sibling', 'index'],
          ],
          pathGroups: [
            {
              pattern: 'src/**',
              group: 'internal',
            },
          ],
          pathGroupsExcludedImportTypes: ['builtin'],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
    },
  },
);
