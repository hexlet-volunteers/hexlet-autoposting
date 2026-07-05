import { Button, Stack, Textarea, TextInput } from '@mantine/core'
import { DateTimePicker } from '@mantine/dates'
import { useForm } from '@mantine/form'
import dayjs from 'dayjs'
import { useCurrentUserId } from '@/entities/session'
import { toIso } from '@/shared/lib'
import type { Post } from '@/entities/post'
import { useUpdatePost } from '../api/useUpdatePost'

interface EditPostFormProps {
  post: Post
  onSuccess?: () => void
}

interface FormValues {
  title: string
  content: string
  scheduledFor: Date | null
}

export function EditPostForm({ post, onSuccess }: EditPostFormProps) {
  const userId = useCurrentUserId()
  const updatePost = useUpdatePost()

  const initialDate = dayjs(post.scheduledFor)
  const form = useForm<FormValues>({
    initialValues: {
      title: post.title,
      content: post.content,
      scheduledFor: initialDate.isValid() ? initialDate.toDate() : null,
    },
    validate: {
      title: (value) => (value.trim().length < 3 ? 'Минимум 3 символа' : null),
      content: (value) => (value.trim().length === 0 ? 'Обязательное поле' : null),
      scheduledFor: (value) => (value ? null : 'Укажите дату публикации'),
    },
  })

  const handleSubmit = form.onSubmit((values) => {
    updatePost.mutate(
      {
        id: post.id,
        body: {
          id_post: String(post.id),
          id_user: userId,
          title: values.title,
          content: values.content,
          sheduled_for: toIso(values.scheduledFor),
        },
      },
      { onSuccess: () => onSuccess?.() },
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
        <Button type="submit" loading={updatePost.isPending}>
          Сохранить
        </Button>
      </Stack>
    </form>
  )
}
