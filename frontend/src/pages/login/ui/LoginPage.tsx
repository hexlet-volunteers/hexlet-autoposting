import { Card, Center, Stack, Text, Title } from '@mantine/core'
import { IconBrandTelegram } from '@tabler/icons-react'
import { LoginButton } from '@/features/auth'

export function LoginPage() {
  return (
    <Center mih="100vh" p="md">
      <Card withBorder radius="md" padding="xl" w={380}>
        <Stack align="center" gap="md">
          <IconBrandTelegram size={40} />
          <Title order={3}>Hexlet Autoposting</Title>
          <Text c="dimmed" ta="center" size="sm">
            Планируйте и публикуйте посты в Telegram и VK из одного места.
          </Text>
          <LoginButton />
        </Stack>
      </Card>
    </Center>
  )
}
