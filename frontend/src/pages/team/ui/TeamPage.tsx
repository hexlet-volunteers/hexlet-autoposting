import { useState } from 'react'
import {
  Avatar,
  Badge,
  Button,
  Divider,
  Flex,
  Group,
  Paper,
  Popover,
  SegmentedControl,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { IconUserPlus } from '@tabler/icons-react'
import { EmptyState } from '@/shared/ui'
import { ROLE_LABELS, useCurrentMemberRole, useMembers } from '@/entities/member'
import type { Member, MemberRole } from '@/entities/member'

/**
 * Роль приглашаемого участника — только «Автор» и «Редактор» (владельцем
 * назначить нельзя, см. макет «Команда»). Владелец в опции не входит.
 */
const INVITE_ROLE_OPTIONS = (['author', 'editor'] as MemberRole[]).map((role) => ({
  value: role,
  label: ROLE_LABELS[role],
}))

/**
 * Стиль read-only бейджа роли (цвета из макета app-dashboard.html:1134-1137):
 * владелец — тёмный, редактор — фирменный синий, автор — зелёный «успех».
 */
const ROLE_BADGE: Record<MemberRole, { color: string; variant: 'filled' | 'light' }> = {
  owner: { color: 'dark', variant: 'filled' },
  editor: { color: 'brand', variant: 'light' },
  author: { color: 'success', variant: 'light' },
}

/** Инициалы из имени/почты для аватара (напр. «Мария Ковалёва» → «МК»). */
function initials(value: string): string {
  const parts = value
    .trim()
    .split(/[\s@.]+/)
    .filter(Boolean)
  const chars = parts.slice(0, 2).map((part) => part[0] ?? '')
  return chars.join('').toUpperCase() || value.slice(0, 2).toUpperCase()
}

/**
 * Текстовая кнопка «Отозвать» с инлайн-подтверждением (по макету — не иконка-корзина,
 * а красная кнопка со словом «Отозвать»).
 */
function RevokeButton({ memberName, onConfirm }: { memberName: string; onConfirm: () => void }) {
  const [opened, { open, close }] = useDisclosure(false)
  return (
    <Popover
      opened={opened}
      onChange={(o) => (o ? open() : close())}
      withArrow
      position="bottom-end"
    >
      <Popover.Target>
        <Button variant="outline" color="red" size="xs" onClick={open} style={{ flex: 'none' }}>
          Отозвать
        </Button>
      </Popover.Target>
      <Popover.Dropdown>
        <Text size="sm" mb="xs">
          Отозвать доступ для {memberName}?
        </Text>
        <Group justify="flex-end" gap="xs">
          <Button size="xs" variant="default" onClick={close}>
            Отмена
          </Button>
          <Button
            size="xs"
            color="red"
            onClick={() => {
              onConfirm()
              close()
            }}
          >
            Отозвать
          </Button>
        </Group>
      </Popover.Dropdown>
    </Popover>
  )
}

interface InviteFormValues {
  email: string
  role: MemberRole
}

export function TeamPage() {
  const { data } = useMembers()
  const [members, setMembers] = useState<Member[]>(data)

  // Гейтинг по роли ЗРИТЕЛЯ страницы (не по роли строки): отзывать доступ и
  // приглашать может только владелец проекта. Скрытие на фронте — только UX,
  // реальную проверку прав делает бэкенд (#147).
  const currentRole = useCurrentMemberRole()
  const canManageTeam = currentRole === 'owner'

  const form = useForm<InviteFormValues>({
    initialValues: { email: '', role: 'author' },
    validate: {
      email: (value) => (/^\S+@\S+\.\S+$/.test(value) ? null : 'Введите корректную почту'),
    },
  })

  const handleInvite = form.onSubmit((values) => {
    // TODO (Design First): POST /projects/{id}/invites { email, role }. Пока заглушка.
    setMembers((current) => [
      ...current,
      {
        id: `invite-${Date.now()}`,
        name: values.email,
        email: values.email,
        role: values.role,
        status: 'pending',
      },
    ])
    notifications.show({
      color: 'green',
      message: `Приглашение отправлено на ${values.email} (демо)`,
    })
    form.reset()
  })

  const handleRemove = (member: Member) => {
    // TODO (Design First): DELETE /projects/{id}/members/{memberId}. Пока заглушка.
    setMembers((current) => current.filter((m) => m.id !== member.id))
    notifications.show({ color: 'red', message: `Доступ для ${member.name} отозван (демо)` })
  }

  return (
    <Stack maw={880} gap="lg">
      <Title order={2}>Команда</Title>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg" style={{ alignItems: 'start' }}>
        {/* ===== Участники проекта ===== */}
        <Paper withBorder radius="lg" p={0}>
          <Group p="md" pb="sm">
            <Title order={4}>Участники проекта</Title>
          </Group>
          <Divider />
          {members.length === 0 ? (
            <div style={{ padding: 'var(--mantine-spacing-lg)' }}>
              <EmptyState
                title="В проекте пока только вы"
                description="Пригласите коллегу, чтобы работать над контентом вместе."
              />
            </div>
          ) : (
            <Stack gap="sm" p="md">
              {members.map((member) => (
                // На мобильном строка — колонка: управление (роль/статус/отзыв)
                // переносится под идентификацию, поэтому нет горизонтального скролла.
                <Flex
                  key={member.id}
                  direction={{ base: 'column', sm: 'row' }}
                  align={{ base: 'stretch', sm: 'center' }}
                  gap="sm"
                  style={{
                    backgroundColor: 'var(--mantine-color-gray-0)',
                    border: '1px solid var(--mantine-color-gray-3)',
                    borderRadius: 'var(--mantine-radius-md)',
                    padding: '10px 14px',
                  }}
                >
                  {/* Идентификация участника: аватар + имя/почта (усечение по ширине) */}
                  <Group gap="sm" wrap="nowrap" style={{ minWidth: 0, flex: 1 }}>
                    <Avatar color="brand" radius="xl">
                      {initials(member.name)}
                    </Avatar>
                    <Stack gap={0} style={{ minWidth: 0 }}>
                      <Text fw={700} size="sm" truncate>
                        {member.name}
                      </Text>
                      <Text size="xs" c="dimmed" truncate>
                        {member.email}
                      </Text>
                    </Stack>
                  </Group>

                  {/* Роль (read-only бейдж) + статус + отзыв; компактно, без Select */}
                  <Group gap="xs" wrap="nowrap" style={{ flex: 'none' }}>
                    <Badge {...ROLE_BADGE[member.role]} style={{ flex: 'none' }}>
                      {ROLE_LABELS[member.role]}
                    </Badge>

                    {member.status === 'pending' && (
                      <Badge color="accent" variant="light" style={{ flex: 'none' }}>
                        приглашён
                      </Badge>
                    )}

                    {member.role !== 'owner' && canManageTeam && (
                      <RevokeButton
                        memberName={member.name}
                        onConfirm={() => handleRemove(member)}
                      />
                    )}
                  </Group>
                </Flex>
              ))}
            </Stack>
          )}
        </Paper>

        {/* ===== Пригласить в команду ===== */}
        <Paper withBorder radius="lg" p="lg">
          {canManageTeam ? (
            <form onSubmit={handleInvite}>
              <Stack gap="md">
                <Title order={4}>Пригласить в команду</Title>
                <TextInput
                  label="Почта"
                  placeholder="kollega@example.ru"
                  type="email"
                  {...form.getInputProps('email')}
                />
                {/* Роль приглашаемого — переключатель «Автор»/«Редактор» (без владельца) */}
                <Stack gap={6}>
                  <Text size="sm" fw={500}>
                    Роль
                  </Text>
                  <SegmentedControl
                    fullWidth
                    data={INVITE_ROLE_OPTIONS}
                    value={form.values.role}
                    onChange={(value) => form.setFieldValue('role', value as MemberRole)}
                  />
                </Stack>
                <Button type="submit" fullWidth leftSection={<IconUserPlus size={16} />}>
                  Пригласить
                </Button>
                <Text size="xs" c="dimmed">
                  Автор пишет черновики, редактор утверждает и публикует. Отозвать доступ можно в
                  любой момент.
                </Text>
              </Stack>
            </form>
          ) : (
            <Stack gap="md">
              <Title order={4}>Пригласить в команду</Title>
              <Text size="sm" c="dimmed">
                Приглашать участников, менять роли и отзывать доступ может только владелец проекта.
              </Text>
            </Stack>
          )}
        </Paper>
      </SimpleGrid>
    </Stack>
  )
}
