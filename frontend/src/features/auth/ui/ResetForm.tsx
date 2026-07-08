import { useState } from 'react'
import { Alert, Button, Stack, TextInput } from '@mantine/core'
import { IconAlertCircle, IconMailCheck } from '@tabler/icons-react'
import { useForm } from '@mantine/form'
import { getAuthErrorMessage, mockRequestPasswordReset } from '../api/mockAuthApi'

interface ResetValues {
  email: string
}

export function ResetForm() {
  const [sent, setSent] = useState(false)

  // Состояния мок-запроса: спиннер в кнопке + блокировка поля, ошибка — в Alert
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<ResetValues>({
    initialValues: { email: '' },
    validate: {
      email: (v) => (/^\S+@\S+\.\S+$/.test(v) ? null : 'Введите корректную почту'),
    },
  })

  const submit = form.onSubmit(async (values) => {
    setError(null)
    setPending(true)
    try {
      // Мок вместо POST /auth/password-reset (#110)
      await mockRequestPasswordReset(values.email)
      setSent(true)
    } catch (e) {
      setError(getAuthErrorMessage(e))
    } finally {
      setPending(false)
    }
  })

  if (sent) {
    return (
      <Stack gap="sm">
        <Alert color="green" icon={<IconMailCheck size={18} />} title="Ссылка отправлена.">
          Проверьте входящие — а если письма нет, загляните в «Спам».
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
          disabled={pending}
          {...form.getInputProps('email')}
        />
        <Button type="submit" fullWidth mt={4} loading={pending}>
          Отправить ссылку
        </Button>
        {error && (
          <Alert color="red" icon={<IconAlertCircle size={18} />}>
            {error}
          </Alert>
        )}
      </Stack>
    </form>
  )
}
