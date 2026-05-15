package dto

import (
	"hexlet/internal/domain"
	"time"
)

// post
type (
	CreatePostResponse struct {
		IDPost    int       `json:"id_post"`
		IDUser    string    `json:"id_user"`
		CreatedAt time.Time `json:"created_at"`
	}
	PutPostResponse struct {
		IDPost    int       `json:"id_post"`
		IDUser    string    `json:"id_user"`
		UpdatedAt time.Time `json:"updated_at"`
	}
	GetPostsResponse struct {
		Scheduled  []domain.Post `json:"scheduled"`
		Processing []domain.Post `json:"processing"`
		Published  []domain.Post `json:"published"`
		Failed     []domain.Post `json:"failed"`
	}
	GetPostResponse struct {
		Posts []domain.Post `json:"post"`
	}
)

// platform
type (
	CreatePlatformResponse struct {
		IDPlatform int       `json:"id_platform"`
		IDUser     string    `json:"id_user"`
		CreatedAt  time.Time `json:"created_at"`
	}
	PutPlatformResponse struct {
		IDPlatform int       `json:"id_platform"`
		IDUser     string    `json:"id_user"`
		UpdatedAt  time.Time `json:"updated_at"`
	}
	GetPlatformResponse struct {
		Platforms []domain.Platform `json:"plstforms"`
	}
)

type ErrorResponse struct {
	Error string `json:"error" example:"error message"`
}
