package dto

import "time"

// posts
type (
	// CreatePostRequest представляет тело запроса для создания нового поста.
	CreatePostRequest struct {
		IDUser       string    `json:"id_user"`
		Title        string    `json:"title" validate:"required,min=3,max=255"`
		Content      string    `json:"content" validate:"required"`
		ScheduledFor time.Time `json:"scheduled_for" validate:"required"`
		Status       string    `json:"-"`
	}

	// DeletePostRequest представляет тело запроса для удаления существующего поста.
	DeletePostRequest struct {
		IDUser string `json:"id_user"`
		IDPost int    `json:"id_post" validate:"required"`
	}

	// PutPostRequest представляет тело запроса для обновления существующего поста.
	PutPostRequest struct {
		IDUser       string    `json:"id_user"`
		IDPost       int       `json:"id_post"`
		Title        string    `json:"title"`
		Content      string    `json:"content"`
		ScheduledFor time.Time `json:"scheduled_for"`
	}
)

// platforms
type (
	// CreatePlatformRequest представляет тело запроса для создания новой платформы.
	CreatePlatformRequest struct {
		IDUser       string `json:"id_user"`
		PlatformName string `json:"platform_name" validate:"required"`
		BotName      string `json:"bot_name" validate:"required"`
		Config       string `json:"config" validate:"required"`
	}

	// DeletePlatformRequest представляет тело запроса для удаления существующей платформы.
	DeletePlatformRequest struct {
		IDUser     string `json:"id_user"`
		IDPlatform int    `json:"id_platform" validate:"required"`
	}

	// PutPlatformRequest представляет тело запроса для обновления существующей платформы.
	PutPlatformRequest struct {
		IDUser       string `json:"id_user"`
		IDPlatform   int    `json:"id_platform" validate:"required"`
		PlatformName string `json:"platform_name" validate:"required"`
		BotName      string `json:"bot_name" validate:"required"`
		Config       string `json:"config" validate:"required"`
	}
)

// GetByUserIDRequest представляет тело запроса для получения постов или платформ пользователя по его ID.
type GetByUserIDRequest struct {
	IDUser string `json:"id_user"`
}
