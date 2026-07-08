import { createTheme } from '@mantine/core'
import type { MantineColorsTuple } from '@mantine/core'

// Дизайн-токены «Отложки» (см. docs/design/mockups):
// bg #F6F4EF · text #17150F · primary #2B50EC (hover #1F3FD1) · accent #FFD84D · Golos Text.

// Синяя фирменная палитра: основной оттенок (index 6) = #2B50EC, hover (index 7) = #1F3FD1.
const brand: MantineColorsTuple = [
  '#eef1fe',
  '#d8e0fc',
  '#adbdf7',
  '#7f97f3',
  '#5a77ef',
  '#4364ed',
  '#2b50ec', // primary
  '#1f3fd1', // hover
  '#1a37b8',
  '#122a97',
]

// Жёлтый акцент вокруг #FFD84D (index 5).
const accent: MantineColorsTuple = [
  '#fffbe6',
  '#fff4c2',
  '#ffec97',
  '#ffe266',
  '#ffdb47',
  '#ffd84d', // accent
  '#e6bd2a',
  '#c99e10',
  '#a37f00',
  '#7d6100',
]

// Семантический зелёный «успех/да» вокруг #22A06B (index 6).
// Не путать с произвольными аватарными цветами проектов/авторов — те не токен.
const success: MantineColorsTuple = [
  '#e7f8ef',
  '#d0f0e0',
  '#a3e2c2',
  '#71d3a2',
  '#48c688',
  '#2fb877',
  '#22a06b', // success
  '#178f5c',
  '#0c7f50',
  '#006e42',
]

export const theme = createTheme({
  primaryColor: 'brand',
  primaryShade: 6,
  colors: { brand, accent, success },
  defaultRadius: 'md',
  // Шкала отступов макета: ритм 8px (см. docs/design/mockups/landing-home.html).
  spacing: { xs: '8px', sm: '12px', md: '16px', lg: '20px', xl: '32px' },
  // Радиус «пилюль» (NetworkPill, чипы демо-секций): radius="pill" / var(--mantine-radius-pill).
  radius: { pill: '999px' },
  fontFamily: "'Golos Text Variable', 'Golos Text', system-ui, sans-serif",
  headings: { fontFamily: "'Golos Text Variable', 'Golos Text', system-ui, sans-serif" },
})
