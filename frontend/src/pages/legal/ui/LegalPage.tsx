import type { ReactNode } from 'react'
import {
  Alert,
  Anchor,
  Box,
  Container,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from '@mantine/core'
import { MarketingHeader } from '@/widgets/marketing-header'
import { MarketingFooter } from '@/widgets/marketing-footer'

const INK = '#17150F'
const BODY = 'rgba(23,21,15,0.75)'
const MUTED = 'rgba(23,21,15,0.45)'

const TOC = [
  { label: 'Публичная оферта', href: '#oferta' },
  { label: 'Политика конфиденциальности', href: '#privacy' },
  { label: 'Персональные данные', href: '#pd' },
  { label: 'Реквизиты', href: '#req' },
]

/** Абзац правового текста с выделенным жирным заголовком. */
function Clause({ term, children }: { term: string; children: ReactNode }) {
  return (
    <Text fz={14.5} lh={1.65} c={BODY}>
      <Text component="span" fw={700} c={INK}>
        {term}
      </Text>{' '}
      {children}
    </Text>
  )
}

/** Секция-карточка правового документа с якорным id. */
function LegalSection({
  id,
  title,
  meta,
  children,
}: {
  id: string
  title: string
  meta?: string
  children: ReactNode
}) {
  return (
    <Paper
      id={id}
      component="section"
      withBorder
      radius="lg"
      p={{ base: 'lg', sm: 30 }}
      style={{ scrollMarginTop: 84 }}
    >
      <Title order={2} fz={24} fw={800} c={INK} style={{ letterSpacing: '-0.3px' }}>
        {title}
      </Title>
      {meta ? (
        <Text mt={4} fz={12.5} c={MUTED}>
          {meta}
        </Text>
      ) : null}
      <Stack gap={14} mt={18} maw={720}>
        {children}
      </Stack>
    </Paper>
  )
}

/** Страница правовой информации: оферта, политика конфиденциальности, ПДн, реквизиты. */
export function LegalPage() {
  return (
    <>
      <MarketingHeader />

      <Container size="lg" py={{ base: 40, sm: 56 }}>
        <Title order={1} fz={{ base: 30, sm: 36 }} fw={800} c={INK} style={{ letterSpacing: '-0.6px' }}>
          Правовая информация
        </Title>

        <Alert
          mt="md"
          radius="md"
          color="yellow"
          styles={{ message: { color: BODY } }}
        >
          Это шаблон структуры документов — перед запуском замените тексты на согласованные с
          вашим юристом.
        </Alert>

        <Box mt={28}>
          <Group gap="xs" mb={28} wrap="wrap">
            {TOC.map((item) => (
              <Anchor
                key={item.href}
                href={item.href}
                underline="never"
                fw={600}
                fz={14}
                c="rgba(23,21,15,0.7)"
                px={12}
                py={9}
                style={{ borderRadius: 9 }}
              >
                {item.label}
              </Anchor>
            ))}
          </Group>

          <Stack gap={24}>
            <LegalSection id="oferta" title="Публичная оферта" meta="Редакция от 1 июля 2026 года">
              <Clause term="1. Термины.">
                «Сервис» — программа «Отложка», доступная на сайте и через API. «Пользователь» —
                лицо, создавшее аккаунт. «Тариф» — объём функций и лимитов, описанный на странице
                «Тарифы».
              </Clause>
              <Clause term="2. Предмет.">
                Исполнитель предоставляет Пользователю доступ к Сервису для планирования и
                автоматической публикации контента в подключённые социальные сети. Публикация
                выполняется через официальные интерфейсы (API) площадок.
              </Clause>
              <Clause term="3. Оплата.">
                Стоимость определяется выбранным Тарифом. Оплата — банковской картой, СБП или по
                счёту для юридических лиц. Подписка продлевается автоматически; автопродление
                отключается в настройках в любой момент.
              </Clause>
              <Clause term="4. Возвраты.">
                В течение 14 дней с момента оплаты Пользователь вправе запросить возврат без
                объяснения причин. Далее возврат рассчитывается пропорционально неиспользованному
                периоду.
              </Clause>
              <Clause term="5. Ответственность.">
                Сервис не отвечает за недоступность API социальных сетей, блокировки со стороны
                площадок и содержание публикуемого контента. Пользователь обязуется не публиковать
                материалы, нарушающие закон и правила площадок.
              </Clause>
              <Clause term="6. Изменение условий.">
                Актуальная редакция оферты публикуется на этой странице. Об изменениях, ухудшающих
                условия, уведомляем по почте не менее чем за 10 дней.
              </Clause>
            </LegalSection>

            <LegalSection
              id="privacy"
              title="Политика конфиденциальности"
              meta="Редакция от 1 июля 2026 года"
            >
              <Clause term="1. Что мы собираем.">
                Имя, адрес электронной почты, платёжные метаданные (без данных карты — их
                обрабатывает платёжный провайдер) и технические токены доступа к подключённым
                соцсетям.
              </Clause>
              <Clause term="2. Зачем.">
                Для работы Сервиса: авторизации, публикации контента от вашего имени, уведомлений о
                статусе публикаций и поддержки. Мы не продаём данные третьим лицам и не читаем личные
                переписки.
              </Clause>
              <Clause term="3. Токены соцсетей.">
                Пароли от аккаунтов соцсетей нам не передаются. Токены хранятся в зашифрованном виде
                и отзываются в один клик при отключении площадки.
              </Clause>
              <Clause term="4. Cookies.">
                Используем только технические cookies (сессия, настройки интерфейса) и обезличенную
                аналитику использования Сервиса.
              </Clause>
              <Clause term="5. Хранение.">
                Данные хранятся на серверах на территории Российской Федерации. При удалении аккаунта
                данные удаляются в течение 30 дней.
              </Clause>
            </LegalSection>

            <LegalSection
              id="pd"
              title="Обработка персональных данных"
              meta="Согласие в соответствии со 152-ФЗ"
            >
              <Clause term="1. Оператор.">
                Оператором персональных данных является ООО «Отложка» (реквизиты — ниже на этой
                странице).
              </Clause>
              <Clause term="2. Состав и цели.">
                Обрабатываются данные, перечисленные в Политике конфиденциальности, в целях
                исполнения договора-оферты и требований законодательства РФ.
              </Clause>
              <Clause term="3. Ваши права.">
                Вы вправе запросить сведения об обработке, потребовать уточнения или удаления данных,
                а также отозвать согласие, написав на legal@otlozhka.ru.
              </Clause>
              <Clause term="4. Срок.">
                Согласие действует до момента удаления аккаунта либо получения отзыва согласия.
              </Clause>
            </LegalSection>

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
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={10} verticalSpacing={10} mt={18} maw={720}>
                <Text fz={14.5} lh={1.5} c={MUTED}>
                  Наименование
                </Text>
                <Text fz={14.5} lh={1.5} fw={600} c={INK}>
                  ООО «Отложка»
                </Text>
                <Text fz={14.5} lh={1.5} c={MUTED}>
                  ИНН / КПП
                </Text>
                <Text fz={14.5} lh={1.5} fw={600} c={INK}>
                  7700000000 / 770001001
                </Text>
                <Text fz={14.5} lh={1.5} c={MUTED}>
                  ОГРН
                </Text>
                <Text fz={14.5} lh={1.5} fw={600} c={INK}>
                  1257700000000
                </Text>
                <Text fz={14.5} lh={1.5} c={MUTED}>
                  Адрес
                </Text>
                <Text fz={14.5} lh={1.5} fw={600} c={INK}>
                  123456, г. Москва, ул. Примерная, д. 1, оф. 1
                </Text>
                <Text fz={14.5} lh={1.5} c={MUTED}>
                  Почта
                </Text>
                <Text fz={14.5} lh={1.5} fw={600} c={INK}>
                  legal@otlozhka.ru
                </Text>
                <Text fz={14.5} lh={1.5} c={MUTED}>
                  Поддержка
                </Text>
                <Text fz={14.5} lh={1.5} fw={600} c={INK}>
                  help@otlozhka.ru · Телеграм-канал
                </Text>
              </SimpleGrid>
            </Paper>
          </Stack>
        </Box>
      </Container>

      <MarketingFooter />
    </>
  )
}
