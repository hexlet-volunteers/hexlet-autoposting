import { useState } from 'react'
import { Box, Button, Card, Divider, Group, Stack, Text, Title } from '@mantine/core'
import { NetworkPill } from '@/shared/ui'
import { NETWORKS } from '@/shared/config'
import { Section } from '../Section'

/** Заготовленные варианты «сгенерированных» постов — дословно из демо макета. */
const AI_VARIANTS = [
  'Открываем запись на декабрь! Успейте забронировать любимое время — в прошлом месяце окошки закончились за три дня.',
  'Секрет идеального капучино — молоко 3,2% и ровно 55 градусов. Приходите, покажем. И нальём.',
  'Итоги недели: 4 новых вкуса, 120 довольных гостей и один очень счастливый бариста.',
  'Совет дня: планируйте посты с вечера — утром голова нужна для важных дел.',
]

/** Спотлайт ИИ-помощника: панель с примером сгенерированного поста и ценностными тезисами. */
export function AiAssistantSection() {
  // Живое демо: перебор заготовленных вариантов по кругу. Сейчас это чисто
  // клиентская симуляция — позже кнопка может дёргать реальную ручку ИИ.
  const [variantIndex, setVariantIndex] = useState(0)
  const nextVariant = () => setVariantIndex((index) => (index + 1) % AI_VARIANTS.length)

  return (
    <Section id="ai">
      <Card withBorder radius={20} p={0} style={{ overflow: 'hidden' }}>
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          }}
        >
          {/* Левая половина: тезисы и CTA */}
          <Stack gap={0} p={{ base: 24, sm: 36 }}>
            <Text tt="uppercase" fw={700} c="brand.6" fz={12} style={{ letterSpacing: '1.5px' }}>
              ИИ-помощник
            </Text>
            <Title order={2} mt={12} fz={28} fw={800} style={{ letterSpacing: '-0.4px' }}>
              Кончились идеи? Есть кнопка
            </Title>
            <Text mt={12} fz={15} c="dimmed" style={{ lineHeight: 1.6 }}>
              ИИ напишет пост в вашем стиле: по теме, по фото или по прошлым публикациям.
              Отредактируйте и отправьте в отложку — или сразу во все сети.
            </Text>
            <Group mt={24} gap={14} align="center">
              <Button color="brand" radius="md" size="md" onClick={nextVariant}>
                Предложить пост
              </Button>
              <Text fz={12.5} c="dimmed">
                вариант {variantIndex + 1} из {AI_VARIANTS.length} · живое демо
              </Text>
            </Group>
          </Stack>

          {/* Правая половина: карточка с примером ИИ-поста */}
          <Box
            bg="#F6F4EF"
            p={{ base: 24, sm: 36 }}
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <Card
              withBorder
              radius={14}
              p={18}
              w="100%"
              style={{ boxShadow: '0 8px 24px rgba(23,21,15,.06)' }}
            >
              <Group gap={9} wrap="nowrap">
                <Box
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 'var(--mantine-radius-pill)',
                    background: 'var(--mantine-color-accent-5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: 13,
                    flexShrink: 0,
                  }}
                >
                  М
                </Box>
                <Text fz={13.5} fw={700}>
                  Кофейня «Молоко»
                </Text>
              </Group>

              <Text mt={12} fz={14} style={{ lineHeight: 1.55 }}>
                {AI_VARIANTS[variantIndex]}
              </Text>

              <Divider mt={14} variant="dashed" />
              <Group mt={12} gap={6} wrap="wrap" align="center">
                {NETWORKS.map((network) => (
                  <NetworkPill key={network.id} network={network} variant="badge" />
                ))}
                <Text ml="auto" fz={11.5} c="dimmed">
                  в отложку: завтра, 12:00
                </Text>
              </Group>
            </Card>
          </Box>
        </Box>
      </Card>
    </Section>
  )
}
