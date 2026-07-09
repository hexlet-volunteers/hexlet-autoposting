import { Link } from 'react-router-dom'
import { Box, Container, Group } from '@mantine/core'
import { Logo } from '@/shared/ui'
import classes from './LegalHeader.module.css'

/** Лёгкая липкая шапка правовой страницы: логотип и «← На главную», без меню и входа. */
export function LegalHeader() {
  return (
    <Box component="header" className={classes.header}>
      <Container size="lg">
        <Group justify="space-between" py={15}>
          <Link to="/" className={classes.logoLink}>
            <Logo />
          </Link>
          <Link to="/" className={classes.backLink}>
            ← На главную
          </Link>
        </Group>
      </Container>
    </Box>
  )
}
