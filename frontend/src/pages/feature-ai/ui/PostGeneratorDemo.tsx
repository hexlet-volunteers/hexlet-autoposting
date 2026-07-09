import { useState } from 'react'
import { Box, Button, Group, Stack, Text, UnstyledButton } from '@mantine/core'

interface Tone {
  name: string
  texts: string[]
}

/** Тоны и заготовленные тексты демо-генератора — дословно из макета feature-ai. */
const TONES: Tone[] = [
  {
    name: 'Дружелюбный',
    texts: [
      'Пятница! Приходите греться: какао с зефирками и новый плейлист уже ждут. Столик у окна — ваш, если успеете.',
      'Мы тут посчитали: за неделю вы улыбнулись нам 312 раз. Возвращайтесь за добавкой — эспрессо в подарок к десерту.',
    ],
  },
  {
    name: 'Экспертный',
    texts: [
      'Зерно светлой обжарки раскрывает кислотность при 92–94 °C. Рассказываем, как калибруем эспрессо каждое утро.',
      'Почему капучино на альтернативном молоке расслаивается? Три причины — и как мы решаем каждую из них.',
    ],
  },
  {
    name: 'Продающий',
    texts: [
      'Только до воскресенья: второй капучино — за полцены. Покажите этот пост бариста и забирайте.',
      'Новогодние сеты в предзаказе: 4 напитка + десерт за 990 ₽ вместо 1240 ₽. Мест мало — бронируйте.',
    ],
  },
]

const MUTED = 'rgba(23,21,15,.5)'

/**
 * Карточка «Генератор постов» в hero страницы ИИ-помощника.
 *
 * Чистая клиентская симуляция: перебирает заготовленные тексты из TONES
 * по кругу — позже кнопка сможет дёргать реальную ручку генерации (эпик ИИ).
 */
export function PostGeneratorDemo() {
  // Индекс выбранного тона и счётчик нажатий «Предложить другой вариант»
  const [tone, setTone] = useState(0)
  const [vi, setVi] = useState(0)

  const currentTone = TONES[tone]
  const total = currentTone.texts.length
  const variantIndex = vi % total

  // Смена тона переключает набор текстов и сбрасывает вариант на первый
  const pickTone = (index: number) => {
    setTone(index)
    setVi(0)
  }

  return (
    <Box
      bg="#fff"
      style={{
        border: '1px solid rgba(23,21,15,.1)',
        borderRadius: 16,
        boxShadow: '0 12px 32px rgba(23,21,15,.08)',
        overflow: 'hidden',
      }}
    >
      {/* Шапка карточки */}
      <Group gap={12} px={18} py={14} style={{ borderBottom: '1px solid rgba(23,21,15,.09)' }}>
        <Text fz={15} fw={700}>
          Генератор постов
        </Text>
        <Text ml="auto" fz={12} c="rgba(23,21,15,.48)">
          живое демо
        </Text>
      </Group>

      <Box px={18} pt={16} pb={18}>
        {/* Переключатель тона */}
        <Text fz={12.5} fw={600} c="rgba(23,21,15,.55)">
          Тон текста
        </Text>
        <Group gap={6} mt={8} wrap="wrap">
          {TONES.map((item, index) => {
            const active = index === tone
            return (
              <UnstyledButton
                key={item.name}
                onClick={() => pickTone(index)}
                px={14}
                py={8}
                fz={13}
                fw={600}
                style={{
                  borderRadius: 'var(--mantine-radius-pill)',
                  border: `1px solid ${
                    active ? 'var(--mantine-color-brand-6)' : 'rgba(23,21,15,.15)'
                  }`,
                  background: active ? 'var(--mantine-color-brand-6)' : '#fff',
                  color: active ? '#fff' : 'rgba(23,21,15,.75)',
                }}
              >
                {item.name}
              </UnstyledButton>
            )
          })}
        </Group>

        {/* Карточка-черновик от ИИ */}
        <Box
          mt={14}
          p={16}
          bg="#F6F4EF"
          style={{ border: '1px solid rgba(23,21,15,.08)', borderRadius: 12 }}
        >
          <Group gap={10} wrap="nowrap">
            <Box
              style={{
                width: 34,
                height: 34,
                borderRadius: 'var(--mantine-radius-pill)',
                background: 'var(--mantine-color-accent-5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: 14,
                flexShrink: 0,
              }}
            >
              М
            </Box>
            <Stack gap={0}>
              <Text fz={13.5} fw={700}>
                Кофейня «Молоко»
              </Text>
              <Text fz={11.5} c={MUTED}>
                черновик от ИИ · {currentTone.name.toLowerCase()} тон
              </Text>
            </Stack>
          </Group>

          <Text mt={12} fz={14.5} lh={1.6} c="rgba(23,21,15,.85)">
            {currentTone.texts[variantIndex]}
          </Text>

          <Group
            gap={8}
            mt={14}
            pt={12}
            align="center"
            style={{ borderTop: '1px dashed rgba(23,21,15,.15)' }}
          >
            <Text fz={11.5} c={MUTED}>
              вариант {variantIndex + 1} из {total}
            </Text>
            {/* Ссылки пока некликабельны — переходы появятся вместе с реальной интеграцией */}
            <Text ml="auto" fz={12} fw={600} c="brand.6" style={{ cursor: 'pointer' }}>
              Редактировать
            </Text>
            <Text fz={12} fw={600} c="#1E7F4F" style={{ cursor: 'pointer' }}>
              В отложку →
            </Text>
          </Group>
        </Box>

        {/* Перебор вариантов по кругу: после последнего снова первый */}
        <Button
          fullWidth
          mt={14}
          color="brand"
          radius={10}
          size="md"
          fz={14.5}
          onClick={() => setVi((value) => value + 1)}
        >
          Предложить другой вариант
        </Button>
      </Box>
    </Box>
  )
}
