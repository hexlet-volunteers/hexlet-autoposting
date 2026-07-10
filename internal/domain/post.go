package domain

import "time"

// Post представляет структуру публикации пользователя, включая её метаданные, статус и время планирования.
type Post struct {
	IDPost       int       `json:"id_post"`
	IDUser       string    `json:"id_user"`
	IDPlatform   int       `json:"id_platform"`
	Title        string    `json:"title"`
	Content      string    `json:"content"`
	Status       string    `json:"status"`
	CreatedAt    time.Time `json:"created_at"`
	SheduledFor  time.Time `json:"sheduled_for"`
	PlatformName string    `json:"platform_name"`
	ErrorMessage *string   `json:"error_message"`
}

// Platform описывает социальную сеть или сторонний сервис, куда отправляются публикации, включая настройки интеграции.
type Platform struct {
	IDPlatform int               `json:"id_platform"`
	Name       string            `json:"name"`
	APIConfig  map[string]string `json:"api_config"`
	IsActive   bool              `json:"is_active"`
	CreatedAt  time.Time         `json:"created_at"`
	UpdatedAt  time.Time         `json:"updated_at"`
}

// PostDestination связывает публикацию с конкретной целевой платформой и отслеживает статус её отправки.
type PostDestination struct {
	IDDestination int        `json:"id_destination"`
	IDPost        int        `json:"id_post"`
	IDPlatform    int        `json:"id_platform"`
	ScheduledFor  *time.Time `json:"scheduled_for"`
	PublishedAt   *time.Time `json:"published_at"`
	Status        string     `json:"status"`
	ErrorMessage  *string    `json:"error_message"`
	CreatedAt     time.Time  `json:"created_at"`
}

// ScheduledPublication объединяет полные данные поста и платформы, готовые для фоновой обработки планировщиком.
type ScheduledPublication struct {
	IDDestination int    `json:"id_destination"`
	IDPost        int    `json:"id_post"`
	IDUser        string `json:"id_user"`
	Title         string `json:"title"`
	Content       string `json:"content"`
	IDPlatform    int    `json:"id_platform"`
	PlatformName  string `json:"platform_name"`
	APIConfig     string `json:"api_config"`
}

// PublicationEvent описывает событие отправки поста на платформу для шины сообщений или логирования системы.
type PublicationEvent struct {
	DestinationID int       `json:"destination_id"`
	Timestamp     time.Time `json:"timestamp"`
	PostID        int       `json:"post_id"`
	PlatformID    int       `json:"platform_id"`
	UserID        string    `json:"user_id"`
}

// PlatformSQL используется для считывания информации о платформе и её настройках напрямую из базы данных SQL.
type PlatformSQL struct {
	PlatformName string
	APIConfig    map[string]string
	IsActive     bool
}

// Message представляет собой облегченную структуру, содержащую только текстовые данные публикации (заголовок и тело).
type Message struct {
	Title   string
	Content string
}
