import {
  Alert,
  Anchor,
  Box,
  Divider,
  Modal,
  SegmentedControl,
  Stack,
  Text,
  Title,
} from '@mantine/core'
import { IconAlertCircle } from '@tabler/icons-react'
import { useAuthModal } from '../model/hooks'
import type { AuthMode } from '../model/authModalSlice'
import { OAuthButtons } from './OAuthButtons'
import { LoginForm } from './LoginForm'
import { RegisterForm } from './RegisterForm'
import { ResetForm } from './ResetForm'

const COPY: Record<AuthMode, { title: string; subtitle: string }> = {
  login: {
    title: 'С возвращением!',
    subtitle: 'Посты уже заждались — войдите и проверьте очередь.',
  },
  register: {
    title: 'Создайте аккаунт',
    subtitle: 'Бесплатный тариф навсегда: 3 соцсети и 10 постов в месяц. Карта не нужна.',
  },
  reset: {
    title: 'Восстановим пароль',
    subtitle: 'Укажите почту аккаунта — пришлём ссылку для сброса пароля.',
  },
}

/**
 * Единая auth-модалка: морфится между режимами вход / регистрация / сброс пароля
 * (как в макете docs/design/mockups/login.html). Открывается через Redux (useAuthModal).
 */
export function AuthModal() {
  const { opened, mode, close, setMode, oauthError, clearOauthError } = useAuthModal()
  const isAuth = mode !== 'reset'

  return (
    <Modal
      opened={opened}
      onClose={close}
      centered
      radius="lg"
      size="md"
      yOffset="12px"
      padding="md"
      title={null}
    >
      <Stack gap="xs">
        {/* Вкладки — только в режимах входа/регистрации: в режиме сброса их нет (как в макете) */}
        {isAuth && (
          <SegmentedControl
            fullWidth
            color="dark"
            value={mode === 'register' ? 'register' : 'login'}
            onChange={(v) => setMode(v as AuthMode)}
            data={[
              { label: 'Вход', value: 'login' },
              { label: 'Регистрация', value: 'register' },
            ]}
          />
        )}

        <div>
          <Title order={3} fz={18} fw={800}>
            {COPY[mode].title}
          </Title>
          {/* Резерв под 2 строки: подзаголовки входа/регистрации/сброса разной длины
              не должны менять высоту модалки при переключении вкладок. */}
          <Text c="dimmed" fz={12} mt={0} mih={38}>
            {COPY[mode].subtitle}
          </Text>
        </div>

        {isAuth && (
          <>
            {/* Ошибка возврата с OAuth-callback (?error=…) — над блоком быстрого входа */}
            {oauthError && (
              <Alert
                color="red"
                icon={<IconAlertCircle size={18} />}
                withCloseButton
                onClose={clearOauthError}
              >
                {oauthError}
              </Alert>
            )}
            <OAuthButtons />
            <Divider label="или по почте" labelPosition="center" />
          </>
        )}

        {/* Слот формы фиксированной высоты для входа/регистрации: у регистрации
            на поле «Имя» больше, поэтому резервируем её высоту — при переключении
            вкладок модалка не меняет размер (форма входа добирает пустым местом). */}
        <Box mih={isAuth ? 306 : undefined}>
          {mode === 'login' && <LoginForm />}
          {mode === 'register' && <RegisterForm />}
          {mode === 'reset' && <ResetForm />}
        </Box>

        {isAuth ? (
          <Text ta="center" fz="sm" c="dimmed">
            {mode === 'register' ? 'Уже есть аккаунт? ' : 'Ещё нет аккаунта? '}
            <Anchor
              component="button"
              type="button"
              fz="sm"
              onClick={() => setMode(mode === 'register' ? 'login' : 'register')}
            >
              {mode === 'register' ? 'Войти' : 'Зарегистрироваться'}
            </Anchor>
          </Text>
        ) : (
          <Anchor
            component="button"
            type="button"
            ta="center"
            fz="sm"
            onClick={() => setMode('login')}
          >
            ← Вернуться ко входу
          </Anchor>
        )}
      </Stack>
    </Modal>
  )
}
