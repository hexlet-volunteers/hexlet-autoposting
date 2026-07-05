import { Container, Group, Stack, Text, Title } from '@mantine/core'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Logo } from './Logo'

interface ErrorScreenProps {
  /** Большой код ошибки, напр. "404" / "500". */
  code: string
  title: string
  description: string
  /** Кнопки-действия (напр. «На главную»). */
  action?: ReactNode
}

/**
 * Экран ошибки в стиле Mantine UI «error pages», но в токенах «Отложки»:
 * крупный приглушённый код + заголовок + описание + действия.
 */
export function ErrorScreen({ code, title, description, action }: ErrorScreenProps) {
  return (
    <Container
      size="md"
      mih="100vh"
      py={64}
      style={{ display: 'flex', flexDirection: 'column' }}
    >
      <Group justify="center">
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <Logo />
        </Link>
      </Group>

      <Stack align="center" gap="md" style={{ flex: 1, justifyContent: 'center' }}>
        <Text
          fw={900}
          lh={1}
          c="brand.1"
          fz={{ base: 110, sm: 200 }}
          style={{ letterSpacing: '-4px', userSelect: 'none' }}
        >
          {code}
        </Text>
        <Title order={1} ta="center" fw={800} fz={{ base: 26, sm: 36 }}>
          {title}
        </Title>
        <Text c="dimmed" ta="center" maw={480}>
          {description}
        </Text>
        {action ? (
          <Group justify="center" mt="sm">
            {action}
          </Group>
        ) : null}
      </Stack>
    </Container>
  )
}
