import { useEffect, useRef, useState } from 'react'
import type { MouseEvent, ReactNode } from 'react'
import { Box, Button, Group, Text } from '@mantine/core'

/**
 * RichText-заглушка композера (Design First): contentEditable + document.execCommand,
 * как в макете app-dashboard.html — форматирование настоящее (жирный/курсив/зачёркнутый/
 * ссылка дают чистый HTML), без markdown-маркеров в тексте.
 * TODO (Design First, #195): заменить на @mantine/tiptap (RichTextEditor.Bold/Italic/
 * Strikethrough/Link), когда пакет появится в зависимостях.
 */

interface RichTextAreaProps {
  /** HTML-содержимое (хранится в поле формы `text`). */
  value: string
  onChange: (html: string) => void
  placeholder?: string
}

/** Пусто ли содержимое с точки зрения пользователя (одни теги — тоже пусто). */
const isEmptyHtml = (html: string) => html.replace(/<[^>]*>/g, '').trim().length === 0

export function RichTextArea({ value, onChange, placeholder }: RichTextAreaProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [focused, setFocused] = useState(false)

  // Синхронизация извне: префилл при редактировании и вставка ИИ-варианта.
  // При обычном вводе innerHTML уже совпадает с value — курсор не сбрасывается.
  useEffect(() => {
    const el = editorRef.current
    if (el && el.innerHTML !== value) el.innerHTML = value
  }, [value])

  /** Команда форматирования; mousedown + preventDefault не снимает выделение. */
  const applyFormat = (event: MouseEvent, command: string, arg?: string) => {
    event.preventDefault()
    // execCommand устарел, но для мок-редактора достаточно; уйдёт вместе с заглушкой
    document.execCommand(command, false, arg)
    const editor = editorRef.current
    if (editor) onChange(editor.innerHTML)
  }

  return (
    <Box>
      <Group gap={5} mb={8}>
        <Text fz="sm" fw={600} c="dimmed" mr={5}>
          Текст
        </Text>
        <FormatButton title="Жирный" onMouseDown={(event) => applyFormat(event, 'bold')} fw={800}>
          Ж
        </FormatButton>
        <FormatButton
          title="Курсив"
          onMouseDown={(event) => applyFormat(event, 'italic')}
          fs="italic"
        >
          К
        </FormatButton>
        <FormatButton
          title="Зачёркнутый"
          onMouseDown={(event) => applyFormat(event, 'strikeThrough')}
          td="line-through"
        >
          S
        </FormatButton>
        {/* Демо-ссылка как в макете; в проде тут будет ввод адреса */}
        <FormatButton
          title="Ссылка"
          onMouseDown={(event) => applyFormat(event, 'createLink', 'https://otlozhka.ru')}
          c="brand.6"
        >
          Ссылка
        </FormatButton>
      </Group>
      <Box style={{ position: 'relative' }}>
        <Box
          ref={editorRef}
          contentEditable
          role="textbox"
          aria-multiline="true"
          aria-label="Текст поста"
          onInput={() => editorRef.current && onChange(editorRef.current.innerHTML)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            minHeight: 96,
            padding: '12px 14px',
            border: `1.5px solid ${
              focused ? 'var(--mantine-color-brand-6)' : 'rgba(23,21,15,.15)'
            }`,
            borderRadius: 10,
            fontSize: 14.5,
            lineHeight: 1.55,
            outline: 'none',
            background: 'var(--mantine-color-white)',
          }}
        />
        {placeholder && isEmptyHtml(value) && (
          <Text
            fz={14.5}
            c="dimmed"
            style={{ position: 'absolute', top: 12, left: 14, pointerEvents: 'none' }}
          >
            {placeholder}
          </Text>
        )}
      </Box>
    </Box>
  )
}

interface FormatButtonProps {
  title: string
  onMouseDown: (event: MouseEvent) => void
  children: ReactNode
  fw?: number
  fs?: string
  td?: string
  c?: string
}

/** Кнопка панели форматирования: Ж / К / S / Ссылка (стили — по макету). */
function FormatButton({ title, onMouseDown, children, fw = 600, fs, td, c }: FormatButtonProps) {
  return (
    <Button
      variant="default"
      size="compact-sm"
      radius={7}
      title={title}
      aria-label={title}
      onMouseDown={onMouseDown}
      styles={{
        root: { height: 28, minWidth: 30, paddingInline: 8 },
        label: {
          fontWeight: fw,
          fontStyle: fs,
          textDecoration: td,
          fontSize: 13,
          color: c ? `var(--mantine-color-${c.replace('.', '-')})` : undefined,
        },
      }}
    >
      {children}
    </Button>
  )
}
