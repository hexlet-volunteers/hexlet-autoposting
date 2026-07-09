import { useState } from 'react'
import {
  Avatar,
  Badge,
  Button,
  Divider,
  Flex,
  Group,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { IconUserPlus } from '@tabler/icons-react'
import { ConfirmDeleteButton, EmptyState } from '@/shared/ui'
import { ROLE_LABELS, useCurrentMemberRole, useMembers } from '@/entities/member'
import type { Member, MemberRole } from '@/entities/member'

/** Данные для Mantine Select: value = роль, label = русское название. */
const ROLE_OPTIONS = (Object.keys(ROLE_LABELS) as MemberRole[]).map((role) => ({
  value: role,
  label: ROLE_LABELS[role],
}))

/** Инициалы из имени/почты для аватара (напр. «Мария Ковалёва» → «МК»). */
function initials(value: string): string {
  const parts = value
    .trim()
    .split(/[\s@.]+/)
    .filter(Boolean)
  const chars = parts.slice(0, 2).map((part) => part[0] ?? '')
  return chars.join('').toUpperCase() || value.slice(0, 2).toUpperCase()
}

interface InviteFormValues {
  email: string
  role: MemberRole
}

export function TeamPage() {
  const { data } = useMembers()
  const [members, setMembers] = useState<Member[]>(data)

  // Гейтинг по роли ЗРИТЕЛЯ страницы (не по роли строки): менять роли,
  // отзывать доступ и приглашать может только владелец проекта. Скрытие на
  // фронте — только UX, реальную проверку прав делает бэкенд (#147).
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

  const handleRoleChange = (id: string, role: MemberRole) => {
    // TODO (Design First): PATCH /projects/{id}/members/{memberId} { role }. Пока заглушка.
    setMembers((current) => current.map((m) => (m.id === id ? { ...m, role } : m)))
    notifications.show({ color: 'green', message: 'Роль обновлена (демо)' })
  }

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
        <Paper withBorder radius="md" p={0}>
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
                // На мобильном строка — колонка: управление (роль/статус/удаление)
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

                  {/* Роль/статус/управление: на узком экране переносятся между собой */}
                  <Group gap="sm" wrap="wrap" style={{ flex: 'none' }}>
                    {member.status === 'pending' && (
                      <Badge color="yellow" variant="light">
                        приглашение отправлено
                      </Badge>
                    )}

                    {canManageTeam ? (
                      <Select
                        data={ROLE_OPTIONS}
                        value={member.role}
                        onChange={(value) =>
                          value && handleRoleChange(member.id, value as MemberRole)
                        }
                        disabled={member.role === 'owner'}
                        allowDeselect={false}
                        aria-label={`Роль участника ${member.name}`}
                        w={130}
                      />
                    ) : (
                      // Режим «только чтение»: роль — бейджем (владельца показывает бейдж ниже)
                      member.role !== 'owner' && (
                        <Badge color="gray" variant="light">
                          {ROLE_LABELS[member.role]}
                        </Badge>
                      )
                    )}

                    {member.role === 'owner' ? (
                      <Badge color="dark" variant="filled">
                        Владелец
                      </Badge>
                    ) : (
                      canManageTeam && (
                        <ConfirmDeleteButton
                          onConfirm={() => handleRemove(member)}
                          tooltip="Отозвать доступ к проекту"
                          confirmText={`Отозвать доступ для ${member.name}?`}
                        />
                      )
                    )}
                  </Group>
                </Flex>
              ))}
            </Stack>
          )}
        </Paper>

        {/* ===== Пригласить в команду ===== */}
        <Paper withBorder radius="md" p="lg">
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
                <Select
                  label="Роль"
                  data={ROLE_OPTIONS}
                  allowDeselect={false}
                  {...form.getInputProps('role')}
                />
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
