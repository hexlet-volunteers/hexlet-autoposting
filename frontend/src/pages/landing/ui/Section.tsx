import { Box, Container, Stack, Text, Title } from '@mantine/core'
import type { ReactNode } from 'react'

interface SectionProps {
  id?: string
  eyebrow?: string
  title?: ReactNode
  subtitle?: ReactNode
  bg?: string
  children?: ReactNode
}

/** Обёртка секции лендинга: единый ритм (вертикальные отступы, контейнер, eyebrow/заголовок). */
export function Section({ id, eyebrow, title, subtitle, bg, children }: SectionProps) {
  return (
    <Box component="section" id={id} style={{ background: bg }} py={64}>
      <Container size="lg">
        <Stack gap="md">
          {(eyebrow || title || subtitle) && (
            <Stack gap={6} maw={760}>
              {eyebrow && (
                <Text tt="uppercase" fw={700} c="brand.6" fz={12} style={{ letterSpacing: '1.5px' }}>
                  {eyebrow}
                </Text>
              )}
              {title && (
                <Title order={2} fz={{ base: 26, sm: 32 }} fw={800} style={{ letterSpacing: '-0.5px' }}>
                  {title}
                </Title>
              )}
              {subtitle && (
                <Text c="dimmed" fz={{ base: 15, sm: 16 }}>
                  {subtitle}
                </Text>
              )}
            </Stack>
          )}
          {children}
        </Stack>
      </Container>
    </Box>
  )
}
