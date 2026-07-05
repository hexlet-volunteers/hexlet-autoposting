import { Button, Stack, TextInput, Textarea } from '@mantine/core'
import { useForm } from '@mantine/form'
import { useCurrentUserId } from '@/entities/session'
import { useCreatePlatform } from '../api/useCreatePlatform'

interface CreatePlatformFormProps {
  onSuccess?: () => void
}

interface FormValues {
  platfromname: string
  bot_name: string
  config: string
}

export function CreatePlatformForm({ onSuccess }: CreatePlatformFormProps) {
  const userId = useCurrentUserId()
  const createPlatform = useCreatePlatform()

  const form = useForm<FormValues>({
    initialValues: { platfromname: '', bot_name: '', config: '' },
    validate: {
      platfromname: (value) => (value.trim().length === 0 ? 'Обязательное поле' : null),
      bot_name: (value) => (value.trim().length === 0 ? 'Обязательное поле' : null),
      config: (value) => (value.trim().length === 0 ? 'Обязательное поле' : null),
    },
  })

  const handleSubmit = form.onSubmit((values) => {
    createPlatform.mutate(
      { ...values, id_user: userId },
      {
        onSuccess: () => {
          form.reset()
          onSuccess?.()
        },
      },
    )
  })

  return (
    <form onSubmit={handleSubmit}>
      <Stack>
        <TextInput label="Название платформы" withAsterisk {...form.getInputProps('platfromname')} />
        <TextInput label="Имя бота" withAsterisk {...form.getInputProps('bot_name')} />
        <Textarea
          label="Конфигурация (токен / JSON)"
          autosize
          minRows={2}
          withAsterisk
          {...form.getInputProps('config')}
        />
        <Button type="submit" loading={createPlatform.isPending}>
          Добавить платформу
        </Button>
      </Stack>
    </form>
  )
}
