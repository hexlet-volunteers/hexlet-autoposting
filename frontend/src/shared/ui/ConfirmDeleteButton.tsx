import { ActionIcon, Button, Group, Popover, Text, Tooltip } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { IconTrash } from '@tabler/icons-react'

interface ConfirmDeleteButtonProps {
  onConfirm: () => void
  loading?: boolean
  tooltip?: string
  confirmText?: string
}

/** Generic trash button with an inline confirm popover. No domain knowledge. */
export function ConfirmDeleteButton({
  onConfirm,
  loading,
  tooltip = 'Удалить',
  confirmText = 'Удалить безвозвратно?',
}: ConfirmDeleteButtonProps) {
  const [opened, { open, close }] = useDisclosure(false)

  return (
    <Popover
      opened={opened}
      onChange={(o) => (o ? open() : close())}
      withArrow
      position="bottom-end"
    >
      <Popover.Target>
        <Tooltip label={tooltip}>
          <ActionIcon color="red" variant="subtle" onClick={open} aria-label={tooltip}>
            <IconTrash size={16} />
          </ActionIcon>
        </Tooltip>
      </Popover.Target>
      <Popover.Dropdown>
        <Text size="sm" mb="xs">
          {confirmText}
        </Text>
        <Group justify="flex-end" gap="xs">
          <Button size="xs" variant="default" onClick={close}>
            Отмена
          </Button>
          <Button
            size="xs"
            color="red"
            loading={loading}
            onClick={() => {
              onConfirm()
              close()
            }}
          >
            Удалить
          </Button>
        </Group>
      </Popover.Dropdown>
    </Popover>
  )
}
