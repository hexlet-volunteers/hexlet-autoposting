import { useQuery } from '@tanstack/react-query'
import { request } from '@/shared/api'
import { toPost, toPostsByStatus } from '../model/mappers'
import type {
  CreatePostRequestDto,
  GetPostResponseDto,
  GetPostsResponseDto,
  Post,
  PostsByStatus,
  UpdatePostRequestDto,
} from '../model/types'

export const postKeys = {
  all: ['posts'] as const,
  list: (userId: number) => [...postKeys.all, 'list', userId] as const,
  detail: (userId: number, id: number) => [...postKeys.all, 'detail', userId, id] as const,
}

// --- read fetchers (id_user as query param; see shared/api/client.ts note) ---

async function fetchPosts(userId: number, signal?: AbortSignal): Promise<PostsByStatus> {
  const dto = await request<GetPostsResponseDto>('/posts', { query: { id_user: userId }, signal })
  return toPostsByStatus(dto)
}

async function fetchPost(userId: number, id: number, signal?: AbortSignal): Promise<Post | null> {
  const dto = await request<GetPostResponseDto>(`/posts/${id}`, {
    query: { id_user: userId },
    signal,
  })
  const first = dto.post?.[0]
  return first ? toPost(first) : null
}

// --- write requests (wrapped into mutation hooks by feature slices) ---

export function createPostRequest(body: CreatePostRequestDto): Promise<unknown> {
  return request('/posts', { method: 'POST', body })
}

export function updatePostRequest(id: number, body: UpdatePostRequestDto): Promise<unknown> {
  return request(`/posts/${id}`, { method: 'PUT', body })
}

export function deletePostRequest(userId: number, id: number): Promise<unknown> {
  return request(`/posts/${id}`, { method: 'DELETE', query: { id_user: userId } })
}

// --- query hooks ---

export function usePosts(userId: number | null) {
  return useQuery({
    queryKey: postKeys.list(userId ?? -1),
    queryFn: ({ signal }) => fetchPosts(userId as number, signal),
    enabled: userId != null,
  })
}

export function usePost(userId: number | null, id: number | null) {
  return useQuery({
    queryKey: postKeys.detail(userId ?? -1, id ?? -1),
    queryFn: ({ signal }) => fetchPost(userId as number, id as number, signal),
    enabled: userId != null && id != null,
  })
}
