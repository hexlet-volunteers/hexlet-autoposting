import { Anchor, type AnchorProps, Text } from '@mantine/core'
import type { ReactNode } from 'react'
import { sanitizeUrl } from '@/shared/lib'

interface ExternalLinkProps extends AnchorProps {
  /** Целевой адрес. Схема отличная от http/https/mailto блокируется (#215/#239). */
  href: string
  children: ReactNode
  /** По умолчанию открываем в новой вкладке; rel всегда noopener noreferrer. */
  target?: string
}

/**
 * Внешняя ссылка с обязательным rel="noopener noreferrer" (защита от reverse tabnabbing)
 * и allowlist схем (http/https/mailto). Небезопасный URL (javascript:/data:/vbscript:)
 * не рендерится как ссылка — остаётся только текст. Единая точка для всех target="_blank".
 */
export function ExternalLink({ href, target = '_blank', children, ...rest }: ExternalLinkProps) {
  const safeHref = sanitizeUrl(href)

  // Заблокированная схема — не оставляем кликабельный вектор, выводим просто текст
  if (safeHref === '') {
    return (
      <Text component="span" {...rest}>
        {children}
      </Text>
    )
  }

  return (
    <Anchor {...rest} href={safeHref} target={target} rel="noopener noreferrer">
      {children}
    </Anchor>
  )
}
