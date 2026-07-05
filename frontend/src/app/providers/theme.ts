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

export const theme = createTheme({
  primaryColor: 'brand',
  primaryShade: 6,
  colors: { brand, accent },
  defaultRadius: 'md',
  fontFamily: "'Golos Text Variable', 'Golos Text', system-ui, sans-serif",
  headings: { fontFamily: "'Golos Text Variable', 'Golos Text', system-ui, sans-serif" },
})
