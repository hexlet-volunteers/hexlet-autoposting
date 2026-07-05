import { useQuery } from '@tanstack/react-query'
import { request } from '@/shared/api'
import { toPlatform } from '../model/mappers'
import type {
  CreatePlatformRequestDto,
  GetPlatformsResponseDto,
  Platform,
  PlatformDto,
  UpdatePlatformRequestDto,
} from '../model/types'

export const platformKeys = {
  all: ['platforms'] as const,
  list: (userId: number) => [...platformKeys.all, 'list', userId] as const,
  detail: (userId: number, id: number) => [...platformKeys.all, 'detail', userId, id] as const,
}

async function fetchPlatforms(userId: number, signal?: AbortSignal): Promise<Platform[]> {
  const dto = await request<GetPlatformsResponseDto>('/platforms', {
    query: { id_user: userId },
    signal,
  })
  return (dto.plstforms ?? []).map(toPlatform)
}

async function fetchPlatform(userId: number, id: number, signal?: AbortSignal): Promise<Platform> {
  const dto = await request<PlatformDto>(`/platforms/${id}`, {
    query: { id_user: userId },
    signal,
  })
  return toPlatform(dto)
}

export function createPlatformRequest(body: CreatePlatformRequestDto): Promise<unknown> {
  return request('/platforms', { method: 'POST', body })
}

export function updatePlatformRequest(id: number, body: UpdatePlatformRequestDto): Promise<unknown> {
  return request(`/platforms/${id}`, { method: 'PUT', body })
}

export function deletePlatformRequest(userId: number, id: number): Promise<unknown> {
  return request(`/platforms/${id}`, { method: 'DELETE', query: { id_user: userId } })
}

export function usePlatforms(userId: number | null) {
  return useQuery({
    queryKey: platformKeys.list(userId ?? -1),
    queryFn: ({ signal }) => fetchPlatforms(userId as number, signal),
    enabled: userId != null,
  })
}

export function usePlatform(userId: number | null, id: number | null) {
  return useQuery({
    queryKey: platformKeys.detail(userId ?? -1, id ?? -1),
    queryFn: ({ signal }) => fetchPlatform(userId as number, id as number, signal),
    enabled: userId != null && id != null,
  })
}
