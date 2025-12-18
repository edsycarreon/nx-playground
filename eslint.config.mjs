import nx from '@nx/eslint-plugin';
import importPlugin from 'eslint-plugin-import';
import securityPlugin from 'eslint-plugin-security';

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: [
      '**/dist',
      '**/build',
      '**/.next',
      '**/out',
      '**/node_modules',
      '**/coverage',
      '**/.nyc_output',
      '**/.nx',
      '**/tmp',
      '**/.json',
      '**/logs',
      '**/*.log',
      '.env',
      '.env.local',
      '.env.*.local',
      '.vscode',
      '.idea',
      '**/*.swp',
      '**/*.swo',
      '.DS_Store',
      '**/.cache',
      '**/*.tsbuildinfo',
      '**/webpack.config.js',
    ],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    plugins: {
      import: importPlugin,
      security: securityPlugin,
    },
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$'],
          depConstraints: [
            {
              sourceTag: '*',
              onlyDependOnLibsWithTags: ['*'],
            },
          ],
        },
        
      ],
      // Enforce explicit return types on functions and class methods
      '@typescript-eslint/explicit-function-return-type': 'error',
      // Enforce explicit accessibility modifiers (public, private, protected)
      // '@typescript-eslint/explicit-member-accessibility': [
      //   'error',
      //   {
      //     accessibility: 'explicit',
      //     overrides: {
      //       constructors: 'no-public',
      //     },
      //   },
      // ],
      // Require explicit types for module boundaries (function params and returns)
      '@typescript-eslint/explicit-module-boundary-types': 'error',
       // Prevent unused variables (catches dead code)
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      // Enforce consistent interface naming (no I prefix)
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'interface',
          format: ['PascalCase'],
          custom: {
            regex: '^I[A-Z]',
            match: false,
          },
        },
        {
          selector: 'typeAlias',
          format: ['PascalCase'],
        },
        {
          selector: 'enum',
          format: ['PascalCase'],
        },
        {
          selector: 'enumMember',
          format: ['UPPER_CASE'],
        },
        {
          selector: 'class',
          format: ['PascalCase'],
        },
      ],
      // Prevent floating promises (unhandled async operations)
      '@typescript-eslint/no-floating-promises': 'error',
      
      // Enforce proper Promise handling
      '@typescript-eslint/no-misused-promises': [
        'error',
        {
          checksVoidReturn: false, // Allow promises in places expecting void (common in NestJS)
        },
      ],

       // Prevent unnecessary type assertions
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      
      // Require consistent use of type imports
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          disallowTypeAnnotations: true,
        },
      ],

      // Prevent any type usage (enforce type safety)
      '@typescript-eslint/no-explicit-any': 'error',
      
      // Enforce proper async function usage
      '@typescript-eslint/require-await': 'error',
      
      // Prevent unnecessary conditions
      '@typescript-eslint/no-unnecessary-condition': 'warn',
      
      // // Enforce proper null checks
      // '@typescript-eslint/strict-boolean-expressions': [
      //   'error',
      //   {
      //     allowString: false,
      //     allowNumber: false,
      //     allowNullableObject: false,
      //   },
      // ],

      // Enforce import order (keeps imports clean and organized)
      'import/order': [
        'error',
        {
          groups: [
            'builtin',   // Node.js built-in modules
            'external',  // npm packages
            'internal',  // Absolute imports
            'parent',    // Relative parent imports
            'sibling',   // Relative sibling imports
            'index',     // Index imports
          ],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],

      // Prevent duplicate imports
      'import/no-duplicates': 'error',
      
      // Prevent circular dependencies (can cause runtime issues)
      'import/no-cycle': 'error',
      
      // Ensure imports point to files that exist
      'import/no-unresolved': 'off', // TypeScript handles this
      
      // Prevent importing dev dependencies in production code
      'import/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: [
            '**/*.spec.ts',
            '**/*.test.ts',
            '**/test/**',
            '**/tests/**',
          ],
        },
      ],

      // Prevent eval and similar dangerous functions
      'security/detect-eval-with-expression': 'error',
      
      // Warn about potential ReDoS vulnerabilities
      'security/detect-non-literal-regexp': 'warn',
      
      // Warn about buffer usage (can cause memory issues)
      'security/detect-buffer-noassert': 'error',
      
      // Prevent unsafe regular expressions
      'security/detect-unsafe-regex': 'error',

      // Prevent console.log in production code
      'no-console': [
        'error',
        {
          allow: ['warn', 'error'],
        },
      ],

      // Prevent var usage (use const/let)
      'no-var': 'error',
      
      // Prefer const over let when possible
      'prefer-const': 'error',

      // Require === instead of ==
      eqeqeq: ['error', 'always'],

      // Prevent return await (unnecessary)
      'no-return-await': 'error',

      // Enforce consistent brace style
      curly: ['error', 'all'],
      
      // Prevent magic numbers (use named constants)
      'no-magic-numbers': [
        'warn',
        {
          ignore: [0, 1, -1],
          ignoreArrayIndexes: true,
          ignoreDefaultValues: true,
          enforceConst: true,
        },
      ],

      // Prevent nested ternary expressions (hard to read)
      'no-nested-ternary': 'error',

      // Prevent parameter reassignment
      'no-param-reassign': 'error',
      
      // Enforce consistent return in array methods
      'array-callback-return': 'error',
      
      // Prevent unnecessary conditionals
      'no-unneeded-ternary': 'error',

      // Allow decorators without explicit return types
      '@typescript-eslint/explicit-module-boundary-types': [
        'error',
        {
          allowArgumentsExplicitlyTypedAsAny: true,
        },
      ],
    },
  },

  // ========================================
  // Test Files - More Lenient Rules
  // ========================================
  {
    files: ['**/*.spec.ts', '**/*.test.ts', '**/test/**', '**/tests/**'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'no-magic-numbers': 'off',
      'max-lines-per-function': 'off',
      'sonarjs/no-duplicate-string': 'off',
      '@typescript-eslint/unbound-method': 'off',
    },
  },
  {
    files: [
      '**/*.ts',
      '**/*.tsx',
      '**/*.cts',
      '**/*.mts',
      '**/*.js',
      '**/*.jsx',
      '**/*.cjs',
      '**/*.mjs',
    ],
    // Override or add rules here
    rules: {},
  },
];
