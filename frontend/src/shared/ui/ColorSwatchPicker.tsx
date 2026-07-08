import { CheckIcon, ColorSwatch, Group } from '@mantine/core'
import { PROJECT_COLORS } from '../config'

interface ColorSwatchPickerProps {
  value: string
  onChange: (color: string) => void
  colors?: string[]
}

export function ColorSwatchPicker({
  value,
  onChange,
  colors = PROJECT_COLORS,
}: ColorSwatchPickerProps) {
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
          {value.toLowerCase() === color.toLowerCase() && (
            <CheckIcon style={{ width: 12, height: 12 }} />
          )}
        </ColorSwatch>
      ))}
    </Group>
  )
}
