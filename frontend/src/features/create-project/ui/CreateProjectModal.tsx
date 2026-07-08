import { Button, Modal, Stack, Text, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form'
import { useState } from 'react'
import { PROJECT_COLORS } from '@/shared/config'
import { ColorSwatchPicker } from '@/shared/ui'
import { useCreateProject } from '../api/useCreateProject'

interface CreateProjectModalProps {
  opened: boolean
  onClose: () => void
}

export function CreateProjectModal({ opened, onClose }: CreateProjectModalProps) {
  const createProject = useCreateProject()
  const [color, setColor] = useState(PROJECT_COLORS[0])

  const form = useForm({
    initialValues: { name: '' },
    validate: { name: (v) => (v.trim().length > 0 ? null : 'Введите название') },
  })

  const submit = form.onSubmit((values) => {
    createProject(values.name, color)
    form.reset()
    setColor(PROJECT_COLORS[0])
    onClose()
  })

  return (
    <Modal opened={opened} onClose={onClose} centered radius="lg" title="Новый проект">
      <form onSubmit={submit}>
        <Stack gap="md">
          <TextInput
            label="Название проекта"
            placeholder="Цветочная «Пион»"
            withAsterisk
            data-autofocus
            {...form.getInputProps('name')}
          />
          <div>
            <Text fw={600} fz="sm" mb={6}>
              Цвет проекта
            </Text>
            <ColorSwatchPicker value={color} onChange={setColor} />
          </div>
          <Button type="submit" fullWidth mt={4} disabled={form.values.name.trim().length === 0}>
            Создать проект
          </Button>
          <Text c="dimmed" fz="xs">
            Площадки подключите после создания — на вкладке «Календарь».
          </Text>
        </Stack>
      </form>
    </Modal>
  )
}
