import { ConfirmDeleteButton } from '@/shared/ui'
import { useCurrentUserId } from '@/entities/session'
import { useDeletePost } from '../api/useDeletePost'

export function DeletePostButton({ postId }: { postId: number }) {
  const userId = useCurrentUserId()
  const deletePost = useDeletePost()
  return (
    <ConfirmDeleteButton
      tooltip="Удалить пост"
      confirmText="Удалить пост безвозвратно?"
      loading={deletePost.isPending}
      onConfirm={() => deletePost.mutate({ userId, id: postId })}
    />
  )
}
