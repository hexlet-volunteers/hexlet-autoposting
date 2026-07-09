import { forwardRef, useEffect, useState } from 'react'
import type { ComponentPropsWithoutRef, CSSProperties, ReactNode } from 'react'
import { Box, Button, Group, Popover, Text, TextInput, UnstyledButton } from '@mantine/core'
import { RichTextEditor } from '@mantine/tiptap'
import { useEditor } from '@tiptap/react'
import type { Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import '@mantine/tiptap/styles.css'

/**
 * RichText-редактор композера на @mantine/tiptap (следствие #195: заменяет
 * прежнюю заглушку contentEditable + execCommand). По макету app-dashboard.html
 * (строки 419-426): подпись «Текст» и текстовые кнопки Ж/К/S/Ссылка в одну
 * строку над простым бордер-контейнером редактора. StarterKit покрывает первые
 * три марки, Link — отдельно (кнопка «Ссылка» с полем ввода URL).
 * Контракт с формой прежний: value(html) / onChange(html) / placeholder,
 * поэтому model/composerForm.ts (htmlToPlainText) и мок-мутации не меняются.
 */

interface RichTextAreaProps {
  /** HTML-содержимое (хранится в поле формы `text`). */
  value: string
  onChange: (html: string) => void
  placeholder?: string
}

// Рамка/фон кнопок тулбара из макета (строки 421-424).
const TOOLBAR_BORDER = 'rgba(23,21,15,.15)'
const TOOLBAR_ACTIVE_BG = 'rgba(23,21,15,.08)'

export function RichTextArea({ value, onChange, placeholder }: RichTextAreaProps) {
  const editor = useEditor({
    extensions: [StarterKit, Link],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  })

  // Синхронизация извне: префилл при редактировании и вставка ИИ-варианта.
  // При обычном вводе getHTML() уже совпадает с value — контент не пересобираем,
  // поэтому курсор не сбрасывается. emitUpdate=false: setContent не должен
  // порождать обратный onChange.
  useEffect(() => {
    if (!editor) return
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value, false)
    }
    // editor стабилен между рендерами — реагируем только на смену value
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return (
    <Box>
      {/* Тулбар: подпись «Текст» и текстовые контролы в одну строку (как в макете) */}
      <Group gap={5} mb={8} align="center" wrap="wrap">
        <Text fz="sm" fw={600} c="dimmed" mr={5}>
          Текст
        </Text>
        <FormatButton
          title="Жирный"
          active={editor?.isActive('bold')}
          onTrigger={() => editor?.chain().focus().toggleBold().run()}
          labelStyle={{ fontWeight: 800 }}
        >
          Ж
        </FormatButton>
        <FormatButton
          title="Курсив"
          active={editor?.isActive('italic')}
          onTrigger={() => editor?.chain().focus().toggleItalic().run()}
          labelStyle={{ fontStyle: 'italic', fontWeight: 600 }}
        >
          К
        </FormatButton>
        <FormatButton
          title="Зачёркнутый"
          active={editor?.isActive('strike')}
          onTrigger={() => editor?.chain().focus().toggleStrike().run()}
          labelStyle={{ fontWeight: 600, textDecoration: 'line-through' }}
        >
          S
        </FormatButton>
        <LinkControl editor={editor} />
      </Group>
      <RichTextEditor editor={editor}>
        {/* Плейсхолдер-оверлей: расширение @tiptap/extension-placeholder не в зоне
            зависимостей, поэтому показываем подсказку сами, пока редактор пуст.
            Отступ совпадает с padding контента (--mantine-spacing-md). */}
        <Box style={{ position: 'relative' }}>
          <RichTextEditor.Content />
          {placeholder && editor?.isEmpty && (
            <Text
              c="dimmed"
              style={{
                position: 'absolute',
                top: 'var(--mantine-spacing-md)',
                left: 'var(--mantine-spacing-md)',
                pointerEvents: 'none',
              }}
            >
              {placeholder}
            </Text>
          )}
        </Box>
      </RichTextEditor>
    </Box>
  )
}

interface FormatButtonProps extends ComponentPropsWithoutRef<'button'> {
  title: string
  active?: boolean
  onTrigger: () => void
  /** Начертание подписи кнопки (жирный/курсив/зачёркнутый). */
  labelStyle?: CSSProperties
  /** Широкая кнопка с текстовой подписью (например «Ссылка»). */
  wide?: boolean
  /** Цвет подписи (для брендовой «Ссылки»). */
  color?: string
  children: ReactNode
}

/**
 * Текстовая кнопка тулбара форматирования по макету (белая, рамка, радиус 7).
 * forwardRef — чтобы работать целью Popover (кнопка «Ссылка»): Popover.Target
 * клонирует ребёнка и вешает ref/aria-атрибуты, поэтому прокидываем и rest-пропы.
 */
const FormatButton = forwardRef<HTMLButtonElement, FormatButtonProps>(
  function FormatButton(
    { title, active, onTrigger, labelStyle, wide, color, children, ...rest },
    ref,
  ) {
    return (
      <UnstyledButton
        ref={ref}
        title={title}
        aria-label={title}
        aria-pressed={active}
        // onMouseDown + preventDefault: не теряем выделение в редакторе (как в макете).
        onMouseDown={(event) => {
          event.preventDefault()
          onTrigger()
        }}
        style={{
          height: 28,
          width: wide ? undefined : 30,
          padding: wide ? '0 10px' : 0,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: `1px solid ${TOOLBAR_BORDER}`,
          borderRadius: 7,
          background: active ? TOOLBAR_ACTIVE_BG : 'var(--mantine-color-white)',
          fontSize: wide ? 12 : 13,
          color,
          ...labelStyle,
        }}
        {...rest}
      >
        {children}
      </UnstyledButton>
    )
  },
)

/** Кнопка «Ссылка» с всплывающим полем ввода URL (устанавливает/снимает link-марку). */
function LinkControl({ editor }: { editor: Editor | null }) {
  const [opened, setOpened] = useState(false)
  const [url, setUrl] = useState('')
  const active = editor?.isActive('link') ?? false

  const openPopover = () => {
    if (!editor) return
    // Предзаполняем текущим href, если выделение уже внутри ссылки.
    setUrl((editor.getAttributes('link').href as string | undefined) ?? '')
    setOpened(true)
  }

  const apply = () => {
    if (!editor) return
    const href = url.trim()
    const chain = editor.chain().focus().extendMarkRange('link')
    if (href) chain.setLink({ href }).run()
    else chain.unsetLink().run()
    setOpened(false)
  }

  return (
    <Popover
      opened={opened}
      onChange={setOpened}
      position="bottom-start"
      shadow="md"
      width={260}
      trapFocus
    >
      <Popover.Target>
        <FormatButton
          title="Ссылка"
          active={active || opened}
          onTrigger={() => (opened ? setOpened(false) : openPopover())}
          color="var(--mantine-color-brand-6)"
          labelStyle={{ fontWeight: 600 }}
          wide
        >
          Ссылка
        </FormatButton>
      </Popover.Target>
      <Popover.Dropdown p="xs">
        <TextInput
          size="xs"
          placeholder="https://example.ru"
          value={url}
          onChange={(event) => setUrl(event.currentTarget.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              apply()
            }
          }}
          data-autofocus
        />
        <Group gap={6} mt={8} justify="flex-end">
          <Button size="compact-xs" variant="default" onClick={() => setOpened(false)}>
            Отмена
          </Button>
          <Button size="compact-xs" onClick={apply}>
            ОК
          </Button>
        </Group>
      </Popover.Dropdown>
    </Popover>
  )
}
