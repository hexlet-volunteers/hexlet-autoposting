import { Button, Stack, Textarea, TextInput } from '@mantine/core'
import { DateTimePicker } from '@mantine/dates'
import { useForm } from '@mantine/form'
import { useCurrentUserId } from '@/entities/session'
import { toIso } from '@/shared/lib'
import { useCreatePost } from '../api/useCreatePost'

interface CreatePostFormProps {
  onSuccess?: () => void
}

interface FormValues {
  title: string
  content: string
  scheduledFor: Date | null
}

export function CreatePostForm({ onSuccess }: CreatePostFormProps) {
  const userId = useCurrentUserId()
  const createPost = useCreatePost()

  const form = useForm<FormValues>({
    initialValues: { title: '', content: '', scheduledFor: null },
    validate: {
      title: (value) =>
        value.trim().length < 3
          ? 'Минимум 3 символа'
          : value.length > 255
            ? 'Максимум 255 символов'
            : null,
      content: (value) => (value.trim().length === 0 ? 'Обязательное поле' : null),
      scheduledFor: (value) => (value ? null : 'Укажите дату публикации'),
    },
  })

  const handleSubmit = form.onSubmit((values) => {
    createPost.mutate(
      {
        title: values.title,
        content: values.content,
        id_user: userId,
        sheduled_for: toIso(values.scheduledFor),
      },
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
        <TextInput label="Заголовок" withAsterisk {...form.getInputProps('title')} />
        <Textarea
          label="Текст поста"
          autosize
          minRows={4}
          withAsterisk
          {...form.getInputProps('content')}
        />
        <DateTimePicker
          label="Дата публикации"
          withAsterisk
          valueFormat="D MMMM YYYY, HH:mm"
          {...form.getInputProps('scheduledFor')}
        />
        <Button type="submit" loading={createPost.isPending}>
          Создать пост
        </Button>
      </Stack>
    </form>
  )
}
