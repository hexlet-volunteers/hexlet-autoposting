import { Button, Group, Modal, SimpleGrid, Stack, Title } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { IconPlus } from '@tabler/icons-react'
import { PlatformCard, usePlatforms } from '@/entities/platform'
import { useCurrentUserId } from '@/entities/session'
import { EmptyState, QueryState } from '@/shared/ui'
import { CreatePlatformForm } from '@/features/create-platform'
import { DeletePlatformButton } from '@/features/delete-platform'

export function PlatformsList() {
  const userId = useCurrentUserId()
  const { data, isLoading, error } = usePlatforms(userId)
  const [opened, modal] = useDisclosure(false)

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="center" wrap="wrap">
        <Title order={2}>Платформы</Title>
        <Button leftSection={<IconPlus size={16} />} onClick={modal.open}>
          Добавить платформу
        </Button>
      </Group>

      <QueryState isLoading={isLoading} error={error}>
        {data && data.length > 0 ? (
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
            {data.map((platform) => (
              <PlatformCard
                key={platform.id}
                platform={platform}
                actions={<DeletePlatformButton platformId={platform.id} />}
              />
            ))}
          </SimpleGrid>
        ) : (
          <EmptyState
            title="Нет платформ"
            description="Добавьте платформу (Telegram, VK), чтобы публиковать в неё посты."
          />
        )}
      </QueryState>

      <Modal opened={opened} onClose={modal.close} title="Новая платформа" centered>
        <CreatePlatformForm onSuccess={modal.close} />
      </Modal>
    </Stack>
  )
}
