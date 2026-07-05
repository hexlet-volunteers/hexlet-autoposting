import { NumberInput } from '@mantine/core'
import { IconUser } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { setCurrentUserId, useCurrentUserId } from '@/entities/session'

/**
 * Temporary control: the current backend needs an explicit id_user (no JWT yet,
 * backlog #60/#82). Lets you switch the acting user until real auth lands.
 *
 * Uses a local draft so the field can be cleared/edited freely (empty string while
 * typing) and only commits a valid positive integer to the store.
 */
export function UserSwitcher() {
  const dispatch = useDispatch()
  const userId = useCurrentUserId()
  const [draft, setDraft] = useState<string | number>(userId)

  // Keep the field in sync if the current user changes elsewhere.
  useEffect(() => {
    setDraft(userId)
  }, [userId])

  return (
    <NumberInput
      size="xs"
      w={130}
      min={1}
      leftSection={<IconUser size={14} />}
      value={draft}
      allowDecimal={false}
      allowNegative={false}
      onChange={(value) => {
        setDraft(value)
        const next = typeof value === 'number' ? value : Number(value)
        if (Number.isInteger(next) && next > 0) dispatch(setCurrentUserId(next))
      }}
      aria-label="ID пользователя"
    />
  )
}
