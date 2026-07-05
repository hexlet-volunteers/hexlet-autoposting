import type { Platform, PlatformDto } from './types'

export function toPlatform(dto: PlatformDto): Platform {
  return {
    id: dto.id_platform,
    name: dto.name,
    isActive: dto.is_active,
    apiConfig: dto.api_config ?? {},
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  }
}
