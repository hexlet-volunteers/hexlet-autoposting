import { CheckIcon, ColorSwatch, Group } from '@mantine/core'

/** Палитра цветов проекта (Mantine ColorSwatch). Переиспользуется в новом проекте и настройках. */
export const PROJECT_COLORS = [
  '#2B50EC',
  '#22A06B',
  '#E23B54',
  '#F7931E',
  '#6E5BFF',
  '#0077FF',
  '#E6BD2A',
  '#17150F',
]

interface ColorSwatchPickerProps {
  value: string
  onChange: (color: string) => void
  colors?: string[]
}

export function ColorSwatchPicker({ value, onChange, colors = PROJECT_COLORS }: ColorSwatchPickerProps) {
  return (
    <Group gap="xs">
      {colors.map((color) => (
        <ColorSwatch
          key={color}
          component="button"
          type="button"
          color={color}
          onClick={() => onChange(color)}
          style={{ color: '#fff', cursor: 'pointer' }}
          aria-label={color}
        >
          {value.toLowerCase() === color.toLowerCase() && <CheckIcon style={{ width: 12, height: 12 }} />}
        </ColorSwatch>
      ))}
    </Group>
  )
}
