import { Group, Stack, Text } from '@mantine/core'
import { NetworkPill } from '@/shared/ui'
import { NETWORKS } from '@/shared/config'
import { Section } from '../Section'

/** Секция «Соцсети»: короткая подпись + все 7 площадок как NetworkPill. */
export function NetworksSection() {
  return (
    <Section id="networks">
      <Stack gap="lg" align="center">
        <Text fz={13} fw={600} c="dimmed" ta="center">
          Публикуем везде, где ваша аудитория:
        </Text>
        <Group gap="sm" justify="center" wrap="wrap">
          {NETWORKS.map((network) => (
            <NetworkPill key={network.id} network={network} />
          ))}
        </Group>
      </Stack>
    </Section>
  )
}
