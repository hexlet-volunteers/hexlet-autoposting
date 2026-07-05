import {
  ActionIcon,
  Badge,
  Button,
  Group,
  Modal,
  SimpleGrid,
  Stack,
  Text,
  Title,
  Tooltip,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { IconPencil, IconPlus } from '@tabler/icons-react'
import { useState } from 'react'
import { PostCard, usePosts } from '@/entities/post'
import type { Post } from '@/entities/post'
import { useCurrentUserId } from '@/entities/session'
import { POST_STATUS_LABEL } from '@/shared/config/postStatus'
import { EmptyState, QueryState } from '@/shared/ui'
import { CreatePostForm } from '@/features/create-post'
import { DeletePostButton } from '@/features/delete-post'
import { EditPostForm } from '@/features/edit-post'
import { StatusFilter, useStatusFilter } from '@/features/filter-posts-by-status'

export function PostsBoard() {
  const userId = useCurrentUserId()
  const statuses = useStatusFilter()
  const { data, isLoading, error } = usePosts(userId)

  const [createOpened, createModal] = useDisclosure(false)
  const [editing, setEditing] = useState<Post | null>(null)

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="center" wrap="wrap">
        <Title order={2}>Посты</Title>
        <Button leftSection={<IconPlus size={16} />} onClick={createModal.open}>
          Создать пост
        </Button>
      </Group>

      <StatusFilter />

      <QueryState isLoading={isLoading} error={error}>
        {data ? (
          <SimpleGrid cols={{ base: 1, sm: 2, lg: statuses.length || 1 }} spacing="md">
            {statuses.map((status) => {
              const posts = data[status]
              return (
                <Stack key={status} gap="sm">
                  <Group gap="xs">
                    <Text fw={600}>{POST_STATUS_LABEL[status]}</Text>
                    <Badge size="sm" variant="light" color="gray">
                      {posts.length}
                    </Badge>
                  </Group>
                  {posts.length === 0 ? (
                    <Text size="sm" c="dimmed">
                      Пусто
                    </Text>
                  ) : (
                    posts.map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        actions={
                          <>
                            <Tooltip label="Редактировать">
                              <ActionIcon
                                variant="subtle"
                                aria-label="Редактировать"
                                onClick={() => setEditing(post)}
                              >
                                <IconPencil size={16} />
                              </ActionIcon>
                            </Tooltip>
                            <DeletePostButton postId={post.id} />
                          </>
                        }
                      />
                    ))
                  )}
                </Stack>
              )
            })}
          </SimpleGrid>
        ) : (
          <EmptyState title="Нет постов" description="Создайте первый пост, чтобы он появился здесь." />
        )}
      </QueryState>

      <Modal opened={createOpened} onClose={createModal.close} title="Новый пост" centered>
        <CreatePostForm onSuccess={createModal.close} />
      </Modal>

      <Modal
        opened={editing !== null}
        onClose={() => setEditing(null)}
        title="Редактирование поста"
        centered
      >
        {editing ? <EditPostForm post={editing} onSuccess={() => setEditing(null)} /> : null}
      </Modal>
    </Stack>
  )
}
