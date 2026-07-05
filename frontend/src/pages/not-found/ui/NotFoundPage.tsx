import { Button, Center, Stack, Text, Title } from '@mantine/core'
import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <Center mih="60vh">
      <Stack align="center" gap="sm">
        <Title order={1}>404</Title>
        <Text c="dimmed">Страница не найдена</Text>
        <Button component={Link} to="/posts" variant="light">
          На главную
        </Button>
      </Stack>
    </Center>
  )
}
