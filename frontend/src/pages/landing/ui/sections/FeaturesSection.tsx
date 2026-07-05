import { Card, SimpleGrid, Stack, Text, ThemeIcon } from '@mantine/core'
import type { ReactNode } from 'react'
import {
  IconClockHour4,
  IconPhoto,
  IconReportAnalytics,
  IconShare3,
  IconSparkles,
  IconUsers,
} from '@tabler/icons-react'
import type { Icon } from '@tabler/icons-react'
import { Link } from 'react-router-dom'
import { Section } from '../Section'

interface Feature {
  icon: Icon
  title: string
  description: string
  href?: string
}

const FEATURES: Feature[] = [
  {
    icon: IconClockHour4,
    title: 'Автопостинг по расписанию',
    description:
      'Очередь публикаций, автоповторы и подсказки лучшего времени. Планируйте хоть на год.',
    href: '/features/autoposting',
  },
  {
    icon: IconShare3,
    title: 'Кросспостинг с адаптацией',
    description:
      'Один пост уходит во все сети сразу — с учётом лимитов и форматов каждой площадки.',
    href: '/features/crossposting',
  },
  {
    icon: IconSparkles,
    title: 'ИИ-тексты и идеи',
    description:
      'Напишет пост по теме, перепишет под площадку, предложит контент-план на месяц.',
    href: '/features/ai',
  },
  {
    icon: IconPhoto,
    title: 'Медиатека и черновики',
    description:
      'Фото и видео в одном месте: шаблоны, водяные знаки, заготовки на будущее.',
  },
  {
    icon: IconUsers,
    title: 'Команда и согласование',
    description:
      'Автор пишет, редактор утверждает, клиент смотрит. Роли и комментарии к черновикам.',
  },
  {
    icon: IconReportAnalytics,
    title: 'Отчёты по публикациям',
    description:
      'Что вышло, когда и как сработало — сводка по всем площадкам в одном отчёте.',
  },
]

function FeatureBody({ icon: FeatureIcon, title, description, href }: Feature) {
  return (
    <Stack gap={10} h="100%">
      <ThemeIcon variant="light" color="brand" size={44} radius="md">
        <FeatureIcon size={24} stroke={1.8} />
      </ThemeIcon>
      <Text fz={17} fw={700} c="dark">
        {title}
      </Text>
      <Text fz={14} c="dimmed" style={{ lineHeight: 1.55 }}>
        {description}
      </Text>
      {href && (
        <Text fz={13.5} fw={600} c="brand.6" mt="auto">
          Подробнее →
        </Text>
      )}
    </Stack>
  )
}

export function FeaturesSection() {
  return (
    <Section id="features" eyebrow="Возможности" title="Всё для постинга — в одном окне">
      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg" mt="md">
        {FEATURES.map((feature): ReactNode => {
          if (feature.href) {
            return (
              <Card
                key={feature.title}
                component={Link}
                to={feature.href}
                withBorder
                radius="lg"
                p="lg"
                style={{ textDecoration: 'none' }}
              >
                <FeatureBody {...feature} />
              </Card>
            )
          }

          return (
            <Card key={feature.title} withBorder radius="lg" p="lg">
              <FeatureBody {...feature} />
            </Card>
          )
        })}
      </SimpleGrid>
    </Section>
  )
}
