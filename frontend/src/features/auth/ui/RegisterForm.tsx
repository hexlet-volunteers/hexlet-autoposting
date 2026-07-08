import { useState } from 'react'
import { Alert, Anchor, Button, Checkbox, PasswordInput, Stack, TextInput } from '@mantine/core'
import { IconAlertCircle } from '@tabler/icons-react'
import { useForm } from '@mantine/form'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { login } from '@/entities/session'
import { getAuthErrorMessage, mockRegister } from '../api/mockAuthApi'
import { useAuthModal } from '../model/hooks'

interface RegisterValues {
  name: string
  email: string
  password: string
  oferta: boolean
}

export function RegisterForm() {
  const { close } = useAuthModal()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  // Состояния мок-запроса: спиннер в кнопке + блокировка полей, ошибка — в Alert
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<RegisterValues>({
    initialValues: { name: '', email: '', password: '', oferta: false },
    validate: {
      name: (v) => (v.trim().length > 0 ? null : 'Как к вам обращаться?'),
      email: (v) => (/^\S+@\S+\.\S+$/.test(v) ? null : 'Введите корректную почту'),
      password: (v) => (v.length >= 6 ? null : 'Минимум 6 символов'),
      oferta: (v) => (v ? null : 'Нужно принять условия'),
    },
  })

  const submit = form.onSubmit(async (values) => {
    setError(null)
    setPending(true)
    try {
      // Мок вместо POST /auth/register + провижининг free-тарифа (#110)
      await mockRegister({ name: values.name, email: values.email, password: values.password })
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
          label="Как вас зовут"
          placeholder="Мария"
          withAsterisk
          disabled={pending}
          {...form.getInputProps('name')}
        />
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
        <Checkbox
          disabled={pending}
          {...form.getInputProps('oferta', { type: 'checkbox' })}
          label={
            <>
              Принимаю{' '}
              <Anchor href="/legal#oferta" target="_blank">
                оферту
              </Anchor>{' '}
              и{' '}
              <Anchor href="/legal#privacy" target="_blank">
                политику конфиденциальности
              </Anchor>
            </>
          }
        />
        {/* Кнопка неактивна, пока не отмечен чекбокс согласия с офертой */}
        <Button type="submit" fullWidth mt={2} disabled={!form.values.oferta} loading={pending}>
          Создать аккаунт
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
