import { Button, SimpleGrid } from '@mantine/core'
import { env } from '@/shared/config'

/** 6 провайдеров OAuth из макета входа, с брендовыми цветами. */
const PROVIDERS = [
  { id: 'vk', label: 'VK ID', color: '#0077FF', fg: '#fff' },
  { id: 'telegram', label: 'Telegram', color: '#27A6E5', fg: '#fff' },
  { id: 'yandex', label: 'Яндекс', color: '#FC3F1D', fg: '#fff' },
  { id: 'sber', label: 'Сбер ID', color: '#21A038', fg: '#fff' },
  { id: 'tinkoff', label: 'T-ID', color: '#FFDD2D', fg: '#17150F' },
  { id: 'gosuslugi', label: 'Госуслуги', color: '#0D4CD3', fg: '#fff' },
]

export function OAuthButtons() {
  return (
    <SimpleGrid cols={3} spacing={6}>
      {PROVIDERS.map((p) => (
        <Button
          key={p.id}
          size="xs"
          radius="md"
          fw={600}
          styles={{ root: { background: p.color, color: p.fg } }}
          onClick={() => {
            // Design First: реальный OAuth-редирект на бэкенд (/auth/{provider}), см. issue #133/#111.
            window.location.href = `${env.apiUrl}/auth/${p.id}`
          }}
        >
          {p.label}
        </Button>
      ))}
    </SimpleGrid>
  )
}
