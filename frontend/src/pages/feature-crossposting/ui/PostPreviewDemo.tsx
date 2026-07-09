import { useState } from 'react'
import { Box, Card, Group, Text, UnstyledButton } from '@mantine/core'
import { NETWORKS } from '@/shared/config'

const BORDER = 'rgba(23,21,15,.1)'
const SOFT_BORDER = 'rgba(23,21,15,.09)'

/** Общий текст поста кофейни «Молоко» — базу адаптируем под каждую сеть (как в макете). */
const BASE_TEXT =
  'Открыли запись на новогодние капучино-сеты! Бронируйте столик — вечером мест уже не будет.'

interface NetworkPreview {
  /** Строка под названием сообщества: формат публикации и время. */
  meta: string
  /** Заголовок над текстом — только у сетей со «статьями» (Дзен, RUTUBE). */
  title?: string
  text: string
  /** Подпись заглушки медиа-блока. */
  media: string
  /** Кнопка внизу карточки — только там, где площадка её поддерживает (Telegram). */
  btn?: string
  /** Зелёные чипы-пометки: что «Отложка» адаптировала для этой сети. */
  chips: string[]
}

// Мок-данные превью по 7 сетям, ключ — id из общего справочника NETWORKS.
// Позже данные превью могут приходить с бэкенда — сейчас это осознанный мок,
// реальная интеграция вне scope этой задачи.
const PREVIEWS: Record<string, NetworkPreview> = {
  vk: {
    meta: 'пост сообщества · сегодня, 12:00',
    text: `${BASE_TEXT}\n\n#кофейня #новыйгод #капучино`,
    media: 'фото 1200 × 800',
    chips: ['Хештеги подставлены', 'UTM-метка в ссылке'],
  },
  tg: {
    meta: 'пост в канале · сегодня, 12:00',
    text: BASE_TEXT,
    media: 'фото 1280 × 720',
    btn: 'Забронировать столик',
    chips: ['Кнопка-ссылка добавлена', 'Уведомление подписчикам'],
  },
  ok: {
    meta: 'заметка группы · сегодня, 12:00',
    text: BASE_TEXT,
    media: 'фото 1200 × 800',
    chips: ['Формат «заметка с фото»', 'UTM-метка в ссылке'],
  },
  max: {
    meta: 'сообщение в канал · сегодня, 12:00',
    text: BASE_TEXT,
    media: 'фото 1080 × 1080',
    chips: ['Формат под мессенджер'],
  },
  dzen: {
    meta: 'статья · сегодня, 12:05',
    title: 'Новогодние капучино-сеты уже в меню',
    text: `${BASE_TEXT} Рассказываем, что внутри сета и как забронировать.`,
    media: 'обложка 1600 × 900',
    chips: ['Добавлен заголовок для Дзена', 'Текст расширен до статьи'],
  },
  rutube: {
    meta: 'видео · сегодня, 12:10',
    title: 'Новогодние сеты: смотрим, что внутри',
    text: `Описание к видео: ${BASE_TEXT}`,
    media: 'видео 1920 × 1080 + обложка',
    chips: ['Заголовок и описание к видео'],
  },
  youtube: {
    meta: 'Shorts · сегодня, 12:10',
    text: `Описание: ${BASE_TEXT}`,
    media: 'вертикальное видео 1080 × 1920',
    chips: ['Формат Shorts', 'Ссылка в описании'],
  },
}

/**
 * Демо «Как пост будет выглядеть на площадке» в hero страницы «Кросспостинг».
 * Чистая клиентская симуляция на useState: переключение таба сети полностью
 * перерисовывает превью поста под выбранную площадку. Текст поста рендерится
 * как текст (React экранирует), без innerHTML — гайдлайн безопасности.
 */
export function PostPreviewDemo() {
  const [activeIndex, setActiveIndex] = useState(0)

  const network = NETWORKS[activeIndex]
  const preview = PREVIEWS[network.id]

  return (
    <Card
      withBorder
      radius="lg"
      p={0}
      style={{
        borderColor: BORDER,
        background: '#fff',
        boxShadow: '0 12px 32px rgba(23,21,15,.08)',
        overflow: 'hidden',
      }}
    >
      <Group
        gap={12}
        align="center"
        px={18}
        py={14}
        wrap="wrap"
        style={{ borderBottom: `1px solid ${SOFT_BORDER}` }}
      >
        <Text fz={15} fw={700}>
          Как пост будет выглядеть на площадке
        </Text>
        <Text ml="auto" fz={12} c="rgba(23,21,15,.48)">
          живое демо — переключайте
        </Text>
      </Group>

      {/* Табы-пилюли по всем 7 сетям: активная заливается брендовым цветом сети */}
      <Group gap={6} px={18} pt={14} pb={4} wrap="wrap">
        {NETWORKS.map((net, index) => {
          const active = index === activeIndex
          return (
            <UnstyledButton
              key={net.id}
              onClick={() => setActiveIndex(index)}
              style={{
                border: `1px solid ${active ? net.color : 'rgba(23,21,15,.15)'}`,
                background: active ? net.color : '#fff',
                color: active ? '#fff' : 'rgba(23,21,15,.75)',
                borderRadius: 'var(--mantine-radius-pill)',
                padding: '7px 13px',
                fontSize: 12.5,
                fontWeight: 600,
              }}
            >
              {net.name}
            </UnstyledButton>
          )
        })}
      </Group>

      <Box px={18} pt={14} pb={18}>
        {/* Карточка превью поста кофейни «Молоко» под выбранную сеть */}
        <Box
          p={16}
          style={{
            background: '#F6F4EF',
            border: '1px solid rgba(23,21,15,.08)',
            borderRadius: 12,
          }}
        >
          <Group gap={10} align="center" wrap="nowrap">
            <Box
              w={34}
              h={34}
              style={{
                flex: 'none',
                borderRadius: 'var(--mantine-radius-pill)',
                background: 'var(--mantine-color-accent-5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: 14,
              }}
            >
              М
            </Box>
            <Box>
              <Text fz={13.5} fw={700}>
                Кофейня «Молоко»
              </Text>
              <Text fz={11.5} c="rgba(23,21,15,.5)">
                {preview.meta}
              </Text>
            </Box>
            <Text
              ml="auto"
              fz={9.5}
              fw={700}
              c="#fff"
              style={{
                flex: 'none',
                background: network.color,
                borderRadius: 5,
                padding: '3px 7px',
              }}
            >
              {network.code}
            </Text>
          </Group>

          {/* Заголовок — только у сетей, где он задан (Дзен, RUTUBE) */}
          {preview.title && (
            <Text mt={12} fz={15.5} fw={700}>
              {preview.title}
            </Text>
          )}

          {/* Текст поста рендерится как текст — без innerHTML (безопасность) */}
          <Text mt={10} fz={14} lh={1.55} c="rgba(23,21,15,.85)" style={{ whiteSpace: 'pre-line' }}>
            {preview.text}
          </Text>

          {/* Заглушка медиа: dashed-рамка с подписью, реальных файлов в демо нет */}
          <Box
            mt={12}
            h={96}
            style={{
              border: '1.5px dashed rgba(23,21,15,.18)',
              borderRadius: 10,
              background: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text fz={12} c="rgba(23,21,15,.4)">
              {preview.media}
            </Text>
          </Box>

          {/* Кнопка — только там, где площадка её поддерживает (Telegram) */}
          {preview.btn && (
            <Box
              mt={12}
              p={9}
              ta="center"
              style={{
                border: `1.5px solid ${network.color}`,
                color: network.color,
                borderRadius: 9,
                fontSize: 13.5,
                fontWeight: 700,
              }}
            >
              {preview.btn}
            </Box>
          )}
        </Box>

        {/* Зелёные чипы: что «Отложка» адаптировала под выбранную сеть */}
        <Group gap={6} mt={12} wrap="wrap">
          {preview.chips.map((chip) => (
            <Text
              key={chip}
              fz={11.5}
              fw={600}
              style={{
                color: '#1E7F4F',
                background: 'rgba(34,160,107,.1)',
                borderRadius: 'var(--mantine-radius-pill)',
                padding: '5px 10px',
              }}
            >
              ✓ {chip}
            </Text>
          ))}
        </Group>
      </Box>
    </Card>
  )
}
