import { Anchor, Button, Checkbox, Group, PasswordInput, Stack, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { useAuthModal } from '../model/hooks'

interface LoginValues {
  email: string
  password: string
  remember: boolean
}

export function LoginForm() {
  const { close, setMode } = useAuthModal()

  const form = useForm<LoginValues>({
    initialValues: { email: '', password: '', remember: false },
    validate: {
      email: (v) => (/^\S+@\S+\.\S+$/.test(v) ? null : 'Введите корректную почту'),
      password: (v) => (v.length > 0 ? null : 'Введите пароль'),
    },
  })

  const submit = form.onSubmit(() => {
    // TODO (Design First): POST /auth/login (email + password, remember-me), issue #110. Пока заглушка.
    notifications.show({ color: 'green', message: 'Вход выполнен (демо)' })
    close()
  })

  return (
    <form onSubmit={submit}>
      <Stack gap="sm">
        <TextInput label="Почта" placeholder="you@example.ru" withAsterisk {...form.getInputProps('email')} />
        <PasswordInput
          label="Пароль"
          placeholder="••••••••"
          withAsterisk
          {...form.getInputProps('password')}
        />
        <Group justify="space-between">
          <Checkbox label="Запомнить меня" {...form.getInputProps('remember', { type: 'checkbox' })} />
          <Anchor component="button" type="button" size="sm" onClick={() => setMode('reset')}>
            Забыли пароль?
          </Anchor>
        </Group>
        <Button type="submit" fullWidth mt={4}>
          Войти
        </Button>
      </Stack>
    </form>
  )
}
