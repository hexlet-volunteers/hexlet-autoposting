import { Card, SimpleGrid, Stack, Text } from '@mantine/core'
import { Section } from '../Section'

interface Step {
  number: string
  title: string
  description: string
}

const STEPS: Step[] = [
  {
    number: '01',
    title: 'Подключите площадки',
    description: 'Авторизуйтесь через официальные API соцсетей. Один раз — пароли нам не нужны.',
  },
  {
    number: '02',
    title: 'Соберите контент-план',
    description: 'Напишите посты сами или попросите ИИ. Расставьте по календарю — хоть на месяц вперёд.',
  },
  {
    number: '03',
    title: 'Живите спокойно',
    description: 'Отложка опубликует всё точно в срок и пришлёт отчёт в Telegram, когда посты выйдут.',
  },
]

export function HowItWorksSection() {
  return (
    <Section id="how" eyebrow="Как это работает" title="Три шага — и контент на автопилоте">
      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
        {STEPS.map((step) => (
          <Card key={step.number} withBorder radius="lg" p="lg" bg="#F6F4EF">
            <Stack gap={8}>
              <Text fz={38} fw={800} c="rgba(43, 80, 236, 0.25)" lh={1} style={{ letterSpacing: '-1px' }}>
                {step.number}
              </Text>
              <Text fz={18} fw={700}>
                {step.title}
              </Text>
              <Text fz="sm" c="dimmed" lh={1.55}>
                {step.description}
              </Text>
            </Stack>
          </Card>
        ))}
      </SimpleGrid>
    </Section>
  )
}
