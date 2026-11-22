package dto

import (
	"hexlet/internal/domain"
	"time"
)

// post
type (
	// CreatePostResponse представляет тело ответа после создания поста.
	CreatePostResponse struct {
		IDPost    int       `json:"id_post"`
		IDUser    string    `json:"id_user"`
		CreatedAt time.Time `json:"created_at"`
	}

	// PutPostResponse представляет тело ответа после обновления поста.
	PutPostResponse struct {
		IDPost    int       `json:"id_post"`
		IDUser    string    `json:"id_user"`
		UpdatedAt time.Time `json:"updated_at"`
	}

	// GetPostsResponse представляет тело ответа со списком постов, сгруппированных по статусам.
	GetPostsResponse struct {
		Scheduled  []domain.Post `json:"scheduled"`
		Processing []domain.Post `json:"processing"`
		Published  []domain.Post `json:"published"`
		Failed     []domain.Post `json:"failed"`
	}

	// GetPostResponse представляет тело ответа с данными конкретного поста.
	GetPostResponse struct {
		Posts []domain.Post `json:"post"`
	}
)

// platform
type (
	// CreatePlatformResponse представляет тело ответа после создания платформы.
	CreatePlatformResponse struct {
		IDPlatform int       `json:"id_platform"`
		IDUser     string    `json:"id_user"`
		CreatedAt  time.Time `json:"created_at"`
	}

	// PutPlatformResponse представляет тело ответа после обновления платформы.
	PutPlatformResponse struct {
		IDPlatform int       `json:"id_platform"`
		IDUser     string    `json:"id_user"`
		UpdatedAt  time.Time `json:"updated_at"`
	}

	// GetPlatformResponse представляет тело ответа со списком платформ пользователя.
	GetPlatformResponse struct {
		Platforms []domain.Platform `json:"platforms"`
	}
)

// ErrorResponse представляет стандартный ответ с сообщением об ошибке.
type ErrorResponse struct {
	Error string `json:"error" example:"error message"`
}
