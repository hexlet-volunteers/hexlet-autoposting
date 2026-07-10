import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Продакшн-домен для canonical/OG/sitemap. При смене домена поправить здесь
 * и в public/robots.txt + public/sitemap.xml.
 */
export const SITE_URL = 'https://otlozhka.ru'
export const SITE_NAME = 'Отложка'

interface PageMeta {
  /** Полный заголовок вкладки/выдачи, напр. «Тарифы — Отложка». */
  title: string
  /** Мета-описание для поисковой выдачи и соцсетей (до ~160 символов). */
  description: string
  /**
   * Приватные/служебные страницы (кабинет, вход, ошибки) — noindex,nofollow.
   * Публичные индексируемые — false (по умолчанию).
   */
  noindex?: boolean
}

/** Создаёт/обновляет <meta> по имени или og-свойству. */
function upsertMeta(kind: 'name' | 'property', key: string, content: string) {
  const selector = `meta[${kind}="${key}"]`
  let el = document.head.querySelector<HTMLMetaElement>(selector)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(kind, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

/** Создаёт/обновляет <link rel="canonical">. */
function upsertCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', 'canonical')
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

/**
 * Пер-страничный SEO для SPA: заголовок вкладки, description, robots, canonical и
 * Open Graph. Без SSR — теги проставляются на клиенте (Google/Яндекс рендерят JS);
 * приватные разделы дополнительно закрыты в robots.txt.
 */
export function usePageMeta({ title, description, noindex = false }: PageMeta) {
  const { pathname } = useLocation()

  useEffect(() => {
    document.title = title
    const canonical = SITE_URL + pathname

    upsertMeta('name', 'description', description)
    upsertMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow')

    upsertMeta('property', 'og:title', title)
    upsertMeta('property', 'og:description', description)
    upsertMeta('property', 'og:type', 'website')
    upsertMeta('property', 'og:site_name', SITE_NAME)
    upsertMeta('property', 'og:url', canonical)

    upsertCanonical(canonical)
  }, [title, description, noindex, pathname])
}
