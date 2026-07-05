import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import '@fontsource-variable/golos-text/index.css'

import '@mantine/core/styles.css'
import '@mantine/dates/styles.css'
import '@mantine/notifications/styles.css'

import '@/app/styles/global.css'

import { App } from '@/app/App'

const container = document.getElementById('root')
if (!container) throw new Error('Root element #root not found')

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
