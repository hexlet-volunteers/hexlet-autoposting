import { POST_STATUSES } from '@/shared/config/postStatus'
import type { PostStatus } from '@/shared/config/postStatus'
import type { GetPostsResponseDto, Post, PostDto, PostsByStatus } from './types'

function normalizeStatus(status: string): PostStatus {
  return (POST_STATUSES as readonly string[]).includes(status)
    ? (status as PostStatus)
    : 'processing'
}

export function toPost(dto: PostDto): Post {
  return {
    id: dto.id_post,
    userId: dto.id_user,
    platformId: dto.id_platform,
    platformName: dto.platform_name,
    title: dto.title,
    content: dto.content,
    status: normalizeStatus(dto.status),
    scheduledFor: dto.sheduled_for,
    createdAt: dto.created_at,
    errorMessage: dto.error_message,
  }
}

export function emptyPostsByStatus(): PostsByStatus {
  return { processing: [], scheduled: [], published: [], failed: [] }
}

export function toPostsByStatus(dto: GetPostsResponseDto): PostsByStatus {
  return {
    processing: (dto.processing ?? []).map(toPost),
    scheduled: (dto.scheduled ?? []).map(toPost),
    published: (dto.published ?? []).map(toPost),
    failed: (dto.failed ?? []).map(toPost),
  }
}
