import { useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Chip,
  Group,
  Loader,
  Select,
  Stack,
  Text,
  TextInput,
  Tooltip,
  UnstyledButton,
} from '@mantine/core'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { IconAlertTriangle, IconSparkles } from '@tabler/icons-react'
import { incrementAiUsage, useQuota } from '@/entities/subscription'
import { AI_ACCENT, AI_MODELS, AI_TONES, generateAiVariants } from '../model/aiAssist'
import type { AiTone } from '../model/aiAssist'

/**
 * Панель ИИ-помощника композера (сегмент features/composer, см. model/aiAssist).
 * Состояния: idle → загрузка (блокируется только панель) → варианты / ошибка;
 * при исчерпанной квоте генерация недоступна и виден совет улучшить тариф.
 */

interface AiAssistPanelProps {
  /** Есть ли фото во вложениях — включает генерацию «по фото». */
  hasPhoto: boolean
  /** Вставить выбранный вариант в поле «Текст поста». */
  onInsert: (text: string) => void
}

export function AiAssistPanel({ hasPhoto, onInsert }: AiAssistPanelProps) {
  const queryClient = useQueryClient()
  const quota = useQuota('ai')
  const [model, setModel] = useState(AI_MODELS[0])
  const [tone, setTone] = useState<AiTone>('Дружелюбный')
  const [topic, setTopic] = useState('')

  const generation = useMutation({
    mutationFn: generateAiVariants,
    // Квоту списываем только за успешную генерацию (мок; в проде посчитает сервер)
    onSuccess: () => incrementAiUsage(queryClient),
  })

  const isLoading = generation.isPending
  const inputsDisabled = isLoading || quota.exhausted

  const counterLabel = Number.isFinite(quota.limit)
    ? `ИИ-тексты · ${quota.used} из ${quota.limit} · осталось ${Math.max(0, quota.limit - quota.used)}`
    : 'ИИ-тексты · безлимит'

  const handleGenerate = (byPhoto: boolean) => {
    if (quota.exhausted) return
    generation.mutate({ topic, tone, byPhoto })
  }

  const handleRetry = () => {
    if (generation.variables) generation.mutate(generation.variables)
  }

  return (
    <Box
      style={{
        background: 'rgba(110,91,255,.06)',
        border: '1px solid rgba(110,91,255,.25)',
        borderRadius: 12,
        padding: 12,
      }}
    >
      <Group gap={8} mb={10}>
        <IconSparkles size={15} color={AI_ACCENT} />
        <Text fw={700} fz="sm" c={AI_ACCENT}>
          ИИ-помощник
        </Text>
        <Select
          ml="auto"
          size="xs"
          data={AI_MODELS}
          allowDeselect={false}
          disabled={isLoading}
          value={model}
          onChange={(value) => setModel(value ?? AI_MODELS[0])}
        />
      </Group>

      {/* Тон генерации — влияет на мок-варианты */}
      <Chip.Group value={tone} onChange={(value) => setTone(value as AiTone)}>
        <Group gap={6} mb={10}>
          {AI_TONES.map((toneOption) => (
            <Chip
              key={toneOption}
              value={toneOption}
              size="xs"
              color={AI_ACCENT}
              disabled={inputsDisabled}
            >
              {toneOption}
            </Chip>
          ))}
        </Group>
      </Chip.Group>

      <Group gap={8} wrap="nowrap">
        <TextInput
          style={{ flex: 1 }}
          size="sm"
          placeholder="О чём написать? Например: анонс новогодних сетов"
          disabled={inputsDisabled}
          value={topic}
          onChange={(event) => setTopic(event.currentTarget.value)}
        />
        <Button
          color={AI_ACCENT}
          loading={isLoading}
          disabled={quota.exhausted}
          onClick={() => handleGenerate(false)}
        >
          Предложить
        </Button>
        <Tooltip
          label={
            hasPhoto
              ? 'Мок-подпись к фото из вложений'
              : 'Прикрепите хотя бы одно фото в блоке «Фото»'
          }
        >
          <Box>
            <Button
              variant="default"
              disabled={inputsDisabled || !hasPhoto}
              onClick={() => handleGenerate(true)}
              styles={{
                root: {
                  color: AI_ACCENT,
                  borderColor: 'rgba(110,91,255,.4)',
                  background: 'rgba(110,91,255,.07)',
                },
              }}
            >
              По фото
            </Button>
          </Box>
        </Tooltip>
      </Group>

      {/* Исчерпанная квота: генерацию не запускаем, подсказываем сменить тариф */}
      {quota.exhausted && (
        <Alert mt={10} radius="md" color="orange" icon={<IconAlertTriangle size={16} />}>
          Лимит ИИ-текстов исчерпан — улучшите тариф, чтобы продолжить генерацию
        </Alert>
      )}

      {/* Загрузка: блокируется только панель, остальной композер активен */}
      {isLoading && (
        <Group gap={8} mt={10}>
          <Loader size="xs" color={AI_ACCENT} />
          <Text fz="xs" c="dimmed">
            Генерируем варианты…
          </Text>
        </Group>
      )}

      {/* Ошибка мок-генерации с повтором последнего запроса */}
      {generation.isError && !isLoading && (
        <Alert mt={10} radius="md" color="red" icon={<IconAlertTriangle size={16} />}>
          <Group gap="xs" justify="space-between" wrap="nowrap">
            <Text fz="xs">{generation.error.message}</Text>
            <Button size="compact-xs" color="red" variant="light" onClick={handleRetry}>
              Повторить
            </Button>
          </Group>
        </Alert>
      )}

      {/* Варианты: клик вставляет текст в поле «Текст поста» */}
      {generation.isSuccess && !isLoading && (
        <Box mt={10}>
          <Text fz="xs" c="dimmed" mb={6}>
            Выберите вариант — вставим его в поле «Текст поста»
          </Text>
          <Stack gap={6}>
            {generation.data.map((variant) => (
              <UnstyledButton
                key={variant}
                onClick={() => onInsert(variant)}
                style={{
                  background: 'var(--mantine-color-white)',
                  border: '1px solid rgba(110,91,255,.25)',
                  borderRadius: 9,
                  padding: '8px 10px',
                }}
              >
                <Text fz="xs" lh={1.5}>
                  {variant}
                </Text>
              </UnstyledButton>
            ))}
          </Stack>
        </Box>
      )}

      <Group gap={10} mt={8} wrap="nowrap">
        <Text fz="xs" c="dimmed">
          Текст появится в поле выше — правьте как угодно
        </Text>
        <Text fz="xs" fw={600} ml="auto" style={{ color: AI_ACCENT, whiteSpace: 'nowrap' }}>
          {counterLabel}
        </Text>
      </Group>
    </Box>
  )
}
