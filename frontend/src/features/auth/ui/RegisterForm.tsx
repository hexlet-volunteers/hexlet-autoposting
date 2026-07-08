import { Anchor, Button, Checkbox, PasswordInput, Stack, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { login } from '@/entities/session'
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

  const form = useForm<RegisterValues>({
    initialValues: { name: '', email: '', password: '', oferta: false },
    validate: {
      name: (v) => (v.trim().length > 0 ? null : 'Как к вам обращаться?'),
      email: (v) => (/^\S+@\S+\.\S+$/.test(v) ? null : 'Введите корректную почту'),
      password: (v) => (v.length >= 6 ? null : 'Минимум 6 символов'),
      oferta: (v) => (v ? null : 'Нужно принять условия'),
    },
  })

  const submit = form.onSubmit(() => {
    // TODO (Design First): POST /auth/register + провижининг free-тарифа, issue #110. Пока мок.
    dispatch(login())
    close()
    navigate('/app/calendar')
  })

  return (
    <form onSubmit={submit}>
      <Stack gap="xs">
        <TextInput
          label="Как вас зовут"
          placeholder="Мария"
          withAsterisk
          {...form.getInputProps('name')}
        />
        <TextInput
          label="Почта"
          placeholder="you@example.ru"
          withAsterisk
          {...form.getInputProps('email')}
        />
        <PasswordInput
          label="Пароль"
          placeholder="••••••••"
          withAsterisk
          {...form.getInputProps('password')}
        />
        <Checkbox
          {...form.getInputProps('oferta', { type: 'checkbox' })}
          label={
            <>
              Принимаю{' '}
              <Anchor href="/legal" target="_blank">
                оферту
              </Anchor>{' '}
              и{' '}
              <Anchor href="/legal" target="_blank">
                политику конфиденциальности
              </Anchor>
            </>
          }
        />
        <Button type="submit" fullWidth mt={2}>
          Создать аккаунт
        </Button>
      </Stack>
    </form>
  )
}
