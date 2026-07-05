import { ConfirmDeleteButton } from '@/shared/ui'
import { useCurrentUserId } from '@/entities/session'
import { useDeletePlatform } from '../api/useDeletePlatform'

export function DeletePlatformButton({ platformId }: { platformId: number }) {
  const userId = useCurrentUserId()
  const deletePlatform = useDeletePlatform()
  return (
    <ConfirmDeleteButton
      tooltip="Удалить платформу"
      confirmText="Удалить платформу безвозвратно?"
      loading={deletePlatform.isPending}
      onConfirm={() => deletePlatform.mutate({ userId, id: platformId })}
    />
  )
}
