/** Clean domain model. */
export interface Platform {
  id: number
  name: string
  isActive: boolean
  apiConfig: Record<string, string>
  createdAt: string
  updatedAt: string
}

// --- Wire DTOs (match the current backend contract verbatim, incl. its typos) ---

export interface PlatformDto {
  api_config: Record<string, string>
  created_at: string
  id_platform: number
  is_active: boolean
  name: string
  updated_at: string
}

export interface GetPlatformsResponseDto {
  /** NB: backend typo — "plstforms". */
  plstforms: PlatformDto[]
}

export interface CreatePlatformRequestDto {
  bot_name: string
  config: string
  id_user: number
  /** NB: backend typo — "platfromname". */
  platfromname: string
}

/**
 * Matches the current backend `dto.PutPlatformRequest` VERBATIM — including its quirks:
 * there is NO `bot_name` here (unlike create), and there is a stray `content` field that
 * has no platform analogue (a Post concept leaked into the platform update contract).
 * Kept faithful to the contract on purpose; the Design-First rewrite (M1) should clean this up.
 */
export interface UpdatePlatformRequestDto {
  config: string
  content: string
  id_platform: number
  id_user: number
  platfromname: string
}
