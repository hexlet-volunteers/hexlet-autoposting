import { useEffect } from 'react'
import { Box, Text } from '@mantine/core'
import { RichTextEditor } from '@mantine/tiptap'
import { useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import '@mantine/tiptap/styles.css'

/**
 * RichText-редактор композера на @mantine/tiptap (следствие #195: заменяет
 * прежнюю заглушку contentEditable + execCommand). Тулбар — Жирный/Курсив/
 * Зачёркнутый/Ссылка (StarterKit покрывает первые три марки, Link — отдельно).
 * Контракт с формой прежний: value(html) / onChange(html) / placeholder,
 * поэтому model/composerForm.ts (htmlToPlainText) и мок-мутации не меняются.
 */

interface RichTextAreaProps {
  /** HTML-содержимое (хранится в поле формы `text`). */
  value: string
  onChange: (html: string) => void
  placeholder?: string
}

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
      <Text fz="sm" fw={600} c="dimmed" mb={8}>
        Текст
      </Text>
      <RichTextEditor editor={editor}>
        <RichTextEditor.Toolbar>
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Bold />
            <RichTextEditor.Italic />
            <RichTextEditor.Strikethrough />
            <RichTextEditor.Link />
          </RichTextEditor.ControlsGroup>
        </RichTextEditor.Toolbar>
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
