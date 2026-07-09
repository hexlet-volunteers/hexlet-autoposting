import { Link } from 'react-router-dom'
import { Box, Container, Group, UnstyledButton } from '@mantine/core'
import { useAuthModal } from '@/features/auth'
import classes from './LegalFooter.module.css'

/** Узкий тёмный футер правовой страницы: копирайт и короткие ссылки в одну строку. */
export function LegalFooter() {
  const { open } = useAuthModal()

  return (
    <Box component="footer" className={classes.footer}>
      <Container size="lg">
        <Group gap={20} py={20} wrap="wrap">
          <span>© Отложка, 2026</span>
          <Link to="/" className={classes.link}>
            Главная
          </Link>
          <Link to="/pricing" className={classes.link}>
            Тарифы
          </Link>
          {/* Та же точка входа, что и на маркетинге, — модалка входа */}
          <UnstyledButton className={classes.link} onClick={() => open('login')}>
            Вход
          </UnstyledButton>
        </Group>
      </Container>
    </Box>
  )
}
