import { Avatar, Card, Group, SimpleGrid, Stack, Text } from '@mantine/core'
import { Section } from '../Section'

interface Testimonial {
  quote: string
  name: string
  role: string
  initials: string
  color: string
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      '«Веду шесть проектов. Раньше воскресенье уходило на расстановку постов по площадкам, теперь — час в пятницу. Клиенты даже не заметили, что я в отпуске».',
    name: 'Марина Ковалёва',
    role: 'SMM-фрилансер, 6 проектов',
    initials: 'МК',
    color: '#2B50EC',
  },
  {
    quote:
      '«Я пекарь, а не маркетолог. Сфотографировал хлеб, ИИ написал текст, посты вышли везде сами. Продажи по акциям выросли — вот и вся магия».',
    name: 'Сергей Панов',
    role: 'владелец пекарни «Корка»',
    initials: 'СП',
    color: '#F7931E',
  },
  {
    quote:
      '«Канал в Telegram, зеркала в Дзене и ВК. Пишу один раз, Отложка сама разносит и подгоняет формат. Подписчики думают, что у меня редакция».',
    name: 'Аня Лебедева',
    role: 'автор канала на 40 тыс. подписчиков',
    initials: 'АЛ',
    color: '#22A06B',
  },
]

export function TestimonialsSection() {
  return (
    <Section id="testimonials" eyebrow="Отзывы" title="Нас советуют коллегам">
      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg" mt="md">
        {TESTIMONIALS.map(({ quote, name, role, initials, color }) => (
          <Card key={name} withBorder radius="lg" p="lg">
            <Stack gap="md" h="100%">
              <Text fz={14.5} c="dark.5" style={{ lineHeight: 1.6 }}>
                {quote}
              </Text>
              <Group gap={11} mt="auto" wrap="nowrap">
                <Avatar radius="xl" size={38} style={{ backgroundColor: color, color: '#fff' }}>
                  <Text fz={14} fw={700} c="#fff">
                    {initials}
                  </Text>
                </Avatar>
                <div>
                  <Text fz={14} fw={700} c="dark">
                    {name}
                  </Text>
                  <Text fz={12.5} c="dimmed">
                    {role}
                  </Text>
                </div>
              </Group>
            </Stack>
          </Card>
        ))}
      </SimpleGrid>
    </Section>
  )
}
