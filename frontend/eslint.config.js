import js from '@eslint/js'
import prettier from 'eslint-config-prettier'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist', 'src/shared/api/generated'] },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      reactHooks.configs.flat['recommended-latest'],
      reactRefresh.configs.vite,
      prettier,
    ],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    rules: {
      // verbatimModuleSyntax в tsconfig требует `import type` — пусть линтер подсказывает
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      // Guardrail сессии (ADR docs/adr/0001-fe-session-storage.md): токены/сессия
      // не должны попадать в web storage — оно читается любым XSS. Сессия живёт в
      // httpOnly-куке. Барьер мягкий: текущих использований нет, сборку не ломает.
      'no-restricted-globals': [
        'error',
        {
          name: 'localStorage',
          message:
            'Сессию/токены не храним в localStorage (XSS). См. docs/adr/0001-fe-session-storage.md',
        },
        {
          name: 'sessionStorage',
          message:
            'Сессию/токены не храним в sessionStorage (XSS). См. docs/adr/0001-fe-session-storage.md',
        },
      ],
      'no-restricted-properties': [
        'error',
        {
          object: 'window',
          property: 'localStorage',
          message:
            'Сессию/токены не храним в localStorage (XSS). См. docs/adr/0001-fe-session-storage.md',
        },
        {
          object: 'window',
          property: 'sessionStorage',
          message:
            'Сессию/токены не храним в sessionStorage (XSS). См. docs/adr/0001-fe-session-storage.md',
        },
      ],
      // Запрет dangerouslySetInnerHTML на пользовательском контенте — защита от stored XSS (#239).
      // Аналог react/no-danger без eslint-plugin-react (плагина нет в зависимостях): ловим JSX-атрибут
      // через core-правило. Нужен HTML-рендер — только через sanitizeHtml из @/shared/lib.
      'no-restricted-syntax': [
        'error',
        {
          selector: 'JSXAttribute[name.name="dangerouslySetInnerHTML"]',
          message:
            'dangerouslySetInnerHTML запрещён (XSS): санитайзьте через sanitizeHtml из @/shared/lib или рендерите как текст (#239).',
        },
      ],
    },
  },
)
