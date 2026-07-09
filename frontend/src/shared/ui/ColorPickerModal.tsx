import { ColorSwatch, Modal, SimpleGrid, Text } from '@mantine/core'
import { PROJECT_COLORS } from '../config'
import classes from './ColorPickerModal.module.css'

interface ColorPickerModalProps {
  opened: boolean
  value: string
  onSelect: (color: string) => void
  onClose: () => void
  colors?: string[]
}

/**
 * Модалка «Цвет проекта»: 12 свотчей сеткой 6×2, выбранный подсвечен кольцом.
 * Презентационный компонент: сам ничего не сохраняет — отдаёт цвет через onSelect
 * и закрывается, применение цвета делает вызывающая форма в своём состоянии.
 */
export function ColorPickerModal({
  opened,
  value,
  onSelect,
  onClose,
  colors = PROJECT_COLORS,
}: ColorPickerModalProps) {
  const handlePick = (color: string) => {
    onSelect(color)
    onClose()
  }

  return (
    <Modal opened={opened} onClose={onClose} centered radius="lg" size={380} title="Цвет проекта">
      {/* Сетка 6 колонок с зазором 10px — по макету app-dashboard.html */}
      <SimpleGrid cols={6} spacing={10} mt={4}>
        {colors.map((color) => (
          <ColorSwatch
            key={color}
            component="button"
            type="button"
            color={color}
            withShadow={false}
            className={classes.swatch}
            data-selected={value.toLowerCase() === color.toLowerCase() || undefined}
            onClick={() => handlePick(color)}
            aria-label={`Выбрать цвет ${color}`}
          />
        ))}
      </SimpleGrid>
      <Text mt="md" size="xs" c="dimmed">
        Цвет помогает различать проекты в списке и календаре
      </Text>
    </Modal>
  )
}
