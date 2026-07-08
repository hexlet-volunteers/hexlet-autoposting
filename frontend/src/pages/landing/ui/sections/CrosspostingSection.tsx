import { Button, Card, Center, Group, SimpleGrid, Stack, Text, ThemeIcon } from '@mantine/core'
import { IconCheck } from '@tabler/icons-react'
import { Link } from 'react-router-dom'
import { NetworkPill } from '@/shared/ui'
import { NETWORKS } from '@/shared/config'
import { Section } from '../Section'

/** Время публикации для каждой площадки — статичная выборка вместо data-driven демо из макета. */
const PUBLISHED_TIMES = ['10:00', '10:00', '10:01', '10:01', '10:02', '10:02', '10:03']

/** Секция «Кросспостинг»: один черновик → семь публикаций во все площадки. */
export function CrosspostingSection() {
  return (
    <Section
      id="crossposting"
      eyebrow="Кросспостинг"
      title="Один пост — семь публикаций"
      subtitle="Напишите текст один раз. Отложка адаптирует его под каждую площадку — обрежет под лимиты, подставит хештеги — и опубликует в нужное время."
    >
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl" mt="md" verticalSpacing="xl">
        {/* Левая колонка — черновик поста */}
        <Card withBorder radius="lg" p="lg" bg="#F6F4EF">
          <Group gap={10}>
            <Center
              w={36}
              h={36}
              style={{
                borderRadius: 'var(--mantine-radius-pill)',
                background: 'var(--mantine-color-accent-5)',
                fontWeight: 800,
                fontSize: 15,
              }}
            >
              М
            </Center>
            <div>
              <Text fz={14} fw={700}>
                Кофейня «Молоко»
              </Text>
              <Text fz={12} c="dimmed">
                черновик поста
              </Text>
            </div>
          </Group>

          <Text mt={12} fz={14} lh={1.5}>
            Открыли запись на новогодние капучино-сеты! Бронируйте столик — вечером мест уже не
            будет.
          </Text>

          <Center
            mt={12}
            h={120}
            fz={12}
            c="dimmed"
            style={{
              border: '1.5px dashed rgba(23,21,15,.2)',
              borderRadius: 10,
              background: '#fff',
            }}
          >
            фото 1200 × 800
          </Center>

          <Button component={Link} to="/login" color="brand" mt={14} fullWidth radius="md">
            Опубликовать в 7 соцсетей
          </Button>
        </Card>

        {/* Правая колонка — опубликовано во всех сетях */}
        <Stack gap={8} justify="center">
          {NETWORKS.map((network, index) => (
            <Group
              key={network.id}
              gap={10}
              wrap="nowrap"
              px={14}
              py={9}
              style={{ background: '#F6F4EF', borderRadius: 10 }}
            >
              <NetworkPill network={network} variant="badge" />
              <Text fz={13.5} fw={600}>
                {network.name}
              </Text>
              <Text ml="auto" fz={12} c="dimmed" style={{ whiteSpace: 'nowrap' }}>
                Опубликовано · {PUBLISHED_TIMES[index]}
              </Text>
              <ThemeIcon color="teal" radius="pill" size={18} variant="filled">
                <IconCheck size={11} stroke={3} />
              </ThemeIcon>
            </Group>
          ))}
        </Stack>
      </SimpleGrid>
    </Section>
  )
}
