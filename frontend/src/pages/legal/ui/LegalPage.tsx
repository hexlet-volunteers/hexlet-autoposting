import { usePageMeta } from '@/shared/lib'
import { Fragment, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Alert, Box, Container, Paper, SimpleGrid, Stack, Text, Title } from '@mantine/core'
import { LEGAL_SECTIONS, LEGAL_TOC, REQUISITES } from '../model/sections'
import { LegalHeader } from './LegalHeader'
import { LegalFooter } from './LegalFooter'
import classes from './LegalPage.module.css'

const INK = '#17150F'
const BODY = 'rgba(23,21,15,0.75)'
const MUTED = 'rgba(23,21,15,0.45)'

/** Страница правовой информации: sticky-оглавление + разделы из массива данных. */
export function LegalPage() {
  usePageMeta({
    title: 'Правовая информация — Отложка',
    description:
      'Оферта, политика конфиденциальности и обработка персональных данных сервиса Отложка.',
  })
  const location = useLocation()

  // Якоря /legal#oferta и /legal#privacy (на них ссылается форма регистрации):
  // плавно скроллим к разделу по хэшу при загрузке страницы и при кликах
  // по оглавлению (location.key учитывает повторный клик по тому же пункту).
  // scroll-margin-top на секциях не даёт заголовку спрятаться под шапкой.
  useEffect(() => {
    if (!location.hash) return
    document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: 'smooth' })
  }, [location.hash, location.key])

  return (
    <>
      <LegalHeader />

      <Container size="lg" py={{ base: 40, sm: 56 }}>
        <Title
          order={1}
          fz={{ base: 30, sm: 36 }}
          fw={800}
          c={INK}
          style={{ letterSpacing: '-0.6px' }}
        >
          Правовая информация
        </Title>

        <Alert mt="md" radius="md" color="yellow" styles={{ message: { color: BODY } }}>
          Это шаблон структуры документов — перед запуском замените тексты на согласованные с вашим
          юристом.
        </Alert>

        <Box className={classes.layout}>
          {/* Sticky-оглавление */}
          <nav className={classes.toc}>
            {LEGAL_TOC.map((item) => (
              <Link key={item.id} to={`#${item.id}`} className={classes.tocLink}>
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Разделы рендерятся циклом по данным — контент правится в model/sections.ts */}
          <Stack gap={24}>
            {LEGAL_SECTIONS.map((section) => (
              <Paper
                key={section.id}
                id={section.id}
                component="section"
                withBorder
                radius="lg"
                p={{ base: 'lg', sm: 30 }}
                style={{ scrollMarginTop: 84 }}
              >
                <Title order={2} fz={24} fw={800} c={INK} style={{ letterSpacing: '-0.3px' }}>
                  {section.title}
                </Title>
                {section.dateNote ? (
                  <Text mt={4} fz={12.5} c={MUTED}>
                    {section.dateNote}
                  </Text>
                ) : null}
                <Stack gap={14} mt={18} maw={720}>
                  {section.paragraphs.map((paragraph) => (
                    <Text key={paragraph.term} fz={14.5} lh={1.65} c={BODY}>
                      <Text component="span" fw={700} c={INK}>
                        {paragraph.term}
                      </Text>{' '}
                      {paragraph.text}
                    </Text>
                  ))}
                </Stack>
              </Paper>
            ))}

            {/* Реквизиты — грид «поле → значение» из массива данных */}
            <Paper
              id="req"
              component="section"
              withBorder
              radius="lg"
              p={{ base: 'lg', sm: 30 }}
              style={{ scrollMarginTop: 84 }}
            >
              <Title order={2} fz={24} fw={800} c={INK} style={{ letterSpacing: '-0.3px' }}>
                Реквизиты
              </Title>
              <SimpleGrid
                cols={{ base: 1, sm: 2 }}
                spacing={10}
                verticalSpacing={10}
                mt={18}
                maw={720}
              >
                {REQUISITES.map((row) => (
                  <Fragment key={row.label}>
                    <Text fz={14.5} lh={1.5} c={MUTED}>
                      {row.label}
                    </Text>
                    <Text fz={14.5} lh={1.5} fw={600} c={INK}>
                      {row.value}
                    </Text>
                  </Fragment>
                ))}
              </SimpleGrid>
            </Paper>
          </Stack>
        </Box>
      </Container>

      <LegalFooter />
    </>
  )
}
