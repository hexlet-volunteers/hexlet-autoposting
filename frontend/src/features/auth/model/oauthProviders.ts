/**
 * 6 провайдеров быстрого входа из макета (docs/design/mockups/login.html):
 * порядок, подписи и бренд-цвета фиксированы макетом. Цвета — брендовые
 * палитры внешних сервисов, а не токены темы, поэтому заданы литералами.
 */
export interface OAuthProvider {
  id: string
  label: string
  /** Брендовый цвет фона кнопки */
  color: string
  /** Цвет текста поверх брендового фона */
  fg: string
  /** Сила hover-затемнения: жёлтой T-ID хватает 0.95, остальным — 0.92 */
  hoverBrightness: number
}

export const OAUTH_PROVIDERS: OAuthProvider[] = [
  { id: 'vk', label: 'VK ID', color: '#0077FF', fg: '#fff', hoverBrightness: 0.92 },
  { id: 'telegram', label: 'Telegram', color: '#27A6E5', fg: '#fff', hoverBrightness: 0.92 },
  { id: 'yandex', label: 'Яндекс', color: '#FC3F1D', fg: '#fff', hoverBrightness: 0.92 },
  { id: 'sber', label: 'Сбер ID', color: '#21A038', fg: '#fff', hoverBrightness: 0.92 },
  { id: 'tinkoff', label: 'T-ID', color: '#FFDD2D', fg: '#17150F', hoverBrightness: 0.95 },
  { id: 'gosuslugi', label: 'Госуслуги', color: '#0D4CD3', fg: '#fff', hoverBrightness: 0.92 },
]
