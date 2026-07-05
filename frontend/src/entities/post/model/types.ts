import type { PostStatus } from '@/shared/config/postStatus'

/** Clean domain model used across the UI (camelCase). */
export interface Post {
  id: number
  userId: number
  platformId: number
  platformName: string
  title: string
  content: string
  status: PostStatus
  scheduledFor: string
  createdAt: string
  errorMessage: string
}

/** Posts grouped by lifecycle status, as returned by GET /posts. */
export type PostsByStatus = Record<PostStatus, Post[]>

// --- Wire DTOs (match the current backend contract verbatim, incl. its typos) ---

export interface PostDto {
  content: string
  created_at: string
  error_message: string
  id_platform: number
  id_post: number
  id_user: number
  platform_name: string
  sheduled_for: string
  status: string
  title: string
}

export interface GetPostsResponseDto {
  processing?: PostDto[]
  scheduled?: PostDto[]
  published?: PostDto[]
  failed?: PostDto[]
}

export interface GetPostResponseDto {
  post: PostDto[]
}

export interface CreatePostRequestDto {
  content: string
  id_user: number
  sheduled_for: string
  title: string
}

export interface UpdatePostRequestDto {
  content: string
  id_post: string
  id_user: number
  sheduled_for: string
  title: string
}
