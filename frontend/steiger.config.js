import { defineConfig } from 'steiger'
import fsd from '@feature-sliced/steiger-plugin'

export default defineConfig([
  ...fsd.configs.recommended,
  {
    rules: {
      // Слайсы с одним потребителем — осознанный выбор на старте продукта:
      // структура важнее числа ссылок, не считаем это ошибкой.
      'fsd/insignificant-slice': 'off',
    },
  },
])
