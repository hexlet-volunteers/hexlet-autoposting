import { useState } from 'react'
import {
  Alert,
  Anchor,
  Button,
  Checkbox,
  Group,
  PasswordInput,
  Stack,
  TextInput,
} from '@mantine/core'
import { IconAlertCircle } from '@tabler/icons-react'
import { useForm } from '@mantine/form'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { login } from '@/entities/session'
import { getAuthErrorMessage, mockLogin } from '../api/mockAuthApi'
import { useAuthModal } from '../model/hooks'

interface LoginValues {
  email: string
  password: string
  remember: boolean
}

export function LoginForm() {
  const { close, setMode } = useAuthModal()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  // Состояния мок-запроса: спиннер в кнопке + блокировка полей, ошибка — в Alert
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<LoginValues>({
    initialValues: { email: '', password: '', remember: false },
    validate: {
      email: (v) => (/^\S+@\S+\.\S+$/.test(v) ? null : 'Введите корректную почту'),
      password: (v) => (v.length > 0 ? null : 'Введите пароль'),
    },
  })

  const submit = form.onSubmit(async (values) => {
    setError(null)
    setPending(true)
    try {
      // Мок вместо POST /auth/login (#110): «Запомнить меня» уже прокидывается как rememberMe
      await mockLogin({
        email: values.email,
        password: values.password,
        rememberMe: values.remember,
      })
      dispatch(login())
      close()
      navigate('/app/calendar')
    } catch (e) {
      setError(getAuthErrorMessage(e))
    } finally {
      setPending(false)
    }
  })

  return (
    <form onSubmit={submit}>
      <Stack gap="xs">
        <TextInput
          label="Почта"
          placeholder="you@example.ru"
          withAsterisk
          disabled={pending}
          {...form.getInputProps('email')}
        />
        <PasswordInput
          label="Пароль"
          placeholder="••••••••"
          withAsterisk
          disabled={pending}
          {...form.getInputProps('password')}
        />
        <Group justify="space-between">
          <Checkbox
            label="Запомнить меня"
            disabled={pending}
            {...form.getInputProps('remember', { type: 'checkbox' })}
          />
          <Anchor component="button" type="button" size="sm" onClick={() => setMode('reset')}>
            Забыли пароль?
          </Anchor>
        </Group>
        <Button type="submit" fullWidth mt={2} loading={pending}>
          Войти
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
