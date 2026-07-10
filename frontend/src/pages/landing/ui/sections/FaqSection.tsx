import { useState } from 'react'
import { Accordion, Box, Text } from '@mantine/core'
import { Section } from '../Section'

const FAQ_ITEMS = [
  {
    q: 'Это безопасно? Аккаунты не забанят?',
    a: 'Мы публикуем только через официальные API площадок — так же, как их родные приложения. Пароли от соцсетей нам не нужны: вы авторизуетесь на стороне самой соцсети.',
  },
  {
    q: 'Можно ли изменить пост после планирования?',
    a: 'Да, до момента публикации можно менять текст, медиа и время. Изменения применятся сразу ко всем площадкам, куда запланирован пост.',
  },
  {
    q: 'Что умеет ИИ-помощник?',
    a: 'Пишет тексты по теме или по фото, адаптирует пост под площадку, предлагает идеи и контент-план на месяц. Любой текст можно править перед публикацией.',
  },
  {
    q: 'Есть ли командная работа и согласование?',
    a: 'Да, на тарифах «Про» и «Агентство»: роли участников, комментарии к черновикам и утверждение постов перед выходом.',
  },
  {
    q: 'Как отменить подписку?',
    a: 'В один клик в настройках, без писем в поддержку. Оплаченный период доработает до конца, контент-план и черновики сохранятся.',
  },
]

/** Круглый значок из макета: «−» у раскрытого пункта, «+» у свёрнутых. */
function FaqIcon({ open }: { open: boolean }) {
  return (
    <Box
      style={{
        width: 26,
        height: 26,
        borderRadius: 'var(--mantine-radius-pill)',
        border: '1.5px solid rgba(23,21,15,.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 15,
        color: 'rgba(23,21,15,.6)',
        flex: 'none',
      }}
    >
      {open ? '−' : '+'}
    </Box>
  )
}

/** FAQ: аккордеон с частыми вопросами, по умолчанию открыт первый. */
export function FaqSection() {
  // управляемое значение нужно, чтобы значок каждого пункта знал, раскрыт ли он
  const [opened, setOpened] = useState<string | null>('0')

  return (
    <Section id="faq" eyebrow="FAQ" title="Частые вопросы">
      <Box maw={760} mx="auto" w="100%">
        <Accordion
          value={opened}
          onChange={setOpened}
          variant="default"
          chevronPosition="right"
          chevronSize={26}
          disableChevronRotation
        >
          {FAQ_ITEMS.map((item, index) => (
            <Accordion.Item key={item.q} value={String(index)}>
              <Accordion.Control chevron={<FaqIcon open={opened === String(index)} />}>
                <Text fw={600} fz={16} c="#17150F">
                  {item.q}
                </Text>
              </Accordion.Control>
              <Accordion.Panel>
                <Text c="dimmed" fz={{ base: 14, sm: 15 }} lh={1.6}>
                  {item.a}
                </Text>
              </Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion>
      </Box>
    </Section>
  )
}
