package dto

import "time"

// posts
type (
	CreatePostRequest struct {
		IDUser       string    `json:"id_user"`
		Title        string    `json:"title" validate:"required,min=3,max=255"`
		Content      string    `json:"content" validate:"required"`
		ScheduledFor time.Time `json:"scheduled_for" validate:"required"`
		Status       string    `json:"-"`
	}

	DeletePostRequest struct {
		IDUser string `json:"id_user"`
		IDPost int    `json:"id_post" validate:"required"`
	}

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
	CreatePlatformRequest struct {
		IDUser       string `json:"id_user"`
		PlatformName string `json:"platform_name" validate:"required"`
		BotName      string `json:"bot_name" validate:"required"`
		Config       string `json:"config" validate:"required"`
	}
	DeletePlatformRequest struct {
		IDUser     string `json:"id_user"`
		IDPlatform int    `json:"id_platform" validate:"required"`
	}

	PutPlatformRequest struct {
		IDUser       string `json:"id_user"`
		IDPlatform   int    `json:"id_platform" validate:"required"`
		PlatformName string `json:"platform_name" validate:"required"`
		BotName      string `json:"content" validate:"required"`
		Config       string `json:"config" validate:"required"`
	}
)

// request для получения платформ/постов от пользователя
type GetByUserIDRequest struct {
	IDUser string `json:"id_user"`
}
