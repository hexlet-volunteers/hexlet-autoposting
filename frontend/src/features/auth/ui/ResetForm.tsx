import { Alert, Button, Stack, TextInput } from '@mantine/core'
import { IconMailCheck } from '@tabler/icons-react'
import { useForm } from '@mantine/form'
import { useState } from 'react'

interface ResetValues {
  email: string
}

export function ResetForm() {
  const [sent, setSent] = useState(false)

  const form = useForm<ResetValues>({
    initialValues: { email: '' },
    validate: {
      email: (v) => (/^\S+@\S+\.\S+$/.test(v) ? null : 'Введите корректную почту'),
    },
  })

  const submit = form.onSubmit(() => {
    // TODO (Design First): POST /auth/password-reset (email), issue #110. Пока заглушка.
    setSent(true)
  })

  if (sent) {
    return (
      <Stack gap="sm">
        <Alert color="green" icon={<IconMailCheck size={18} />} title="Ссылка отправлена.">
          Проверьте почту — там ссылка для сброса пароля.
        </Alert>
        <Button variant="light" fullWidth onClick={() => setSent(false)}>
          Отправить ещё раз
        </Button>
      </Stack>
    )
  }

  return (
    <form onSubmit={submit}>
      <Stack gap="sm">
        <TextInput
          label="Почта"
          placeholder="you@example.ru"
          withAsterisk
          {...form.getInputProps('email')}
        />
        <Button type="submit" fullWidth mt={4}>
          Отправить ссылку
        </Button>
      </Stack>
    </form>
  )
}
