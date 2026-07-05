import { defineConfig } from '@hey-api/openapi-ts'

/**
 * Design First: generate the typed client + TanStack Query hooks from the OpenAPI
 * contract produced by TypeSpec (backlog M1). Run: `npm run generate:api`.
 *
 * The `input` points at the committed OpenAPI artifact from the /api workspace.
 * Until that exists, `src/shared/api/client.ts` is the hand-written bridge.
 */
export default defineConfig({
  input: '../api/openapi/openapi.yaml',
  output: {
    path: 'src/shared/api/generated',
    format: 'prettier',
  },
  plugins: [
    '@hey-api/client-fetch',
    '@tanstack/react-query',
  ],
})
