package repository

import (
	"context"
	"encoding/json"
	"fmt"
	"hexlet/internal/domain"
	"time"

	"go.uber.org/zap"
)

// GetReadyForPublication возвращает срез публикаций со статусом 'scheduled', время отправки которых уже наступило.
func (r *Repository) GetReadyForPublication(ctx context.Context, batchSize int) ([]domain.ScheduledPublication, error) {
	query := `
        SELECT 
            pd.id as id_destination,
            pd.post_id as id_post,
            p.user_id as id_user,
            p.title,
            p.content, 
            pd.platform_id as id_platform,
            pl.platform_name
        FROM post_destinations pd
        JOIN posts p ON p.id = pd.post_id
        JOIN platforms pl ON pl.id = pd.platform_id
        WHERE pd.status = 'scheduled' 
        AND pd.scheduled_for <= NOW()
        ORDER BY pd.scheduled_for ASC
        LIMIT $1`

	rows, err := r.SlavePool.Query(ctx, query, batchSize)
	if err != nil {
		r.logger.Error("GetReadyForPublication failed in query", zap.Error(err))
		return nil, fmt.Errorf("failed to query scheduled publications: %w", err)
	}
	defer rows.Close()

	var publications []domain.ScheduledPublication
	for rows.Next() {
		var pub domain.ScheduledPublication
		err := rows.Scan(
			&pub.IDDestination,
			&pub.IDPost,
			&pub.IDUser,
			&pub.Title,
			&pub.Content,
			&pub.IDPlatform,
			&pub.PlatformName,
		)
		if err != nil {
			r.logger.Error("GetReadyForPublication failed in scanning", zap.Error(err))
			return nil, fmt.Errorf("failed to scan scheduled publication: %w", err)
		}
		publications = append(publications, pub)
	}

	if err := rows.Err(); err != nil {
		r.logger.Error("GetReadyForPublication rows iteration error", zap.Error(err))
		return nil, fmt.Errorf("rows error in scheduled publications: %w", err)
	}

	return publications, nil
}

// GetPlatformsByUserID извлекает конфигурацию конкретной активной платформы пользователя по его идентификатору.
// Функция запрашивает данные из SlavePool, декодирует JSON-конфигурацию API и возвращает структуру domain.PlatformSQL или ошибку.
func (r *Repository) GetPlatformsByUserID(ctx context.Context, platformName string, userID string) (domain.PlatformSQL, error) {
	query := "SELECT platform_name, api_config, is_active FROM platforms WHERE user_id = $1"
	rows, err := r.SlavePool.Query(ctx, query, userID)
	if err != nil {
		r.logger.Error("GetPlatformsByUserID failed in query",
			zap.Error(err),
			zap.String("user_id", userID),
		)
		return domain.PlatformSQL{}, err
	}
	var res domain.PlatformSQL
	defer rows.Close()
	for rows.Next() {
		var platform domain.PlatformSQL
		var configData []byte
		err := rows.Scan(&platform.PlatformName, &configData, &platform.IsActive)
		if err != nil {
			r.logger.Error("GetPlatformsByUserID failed in scaning",
				zap.Error(err),
				zap.String("user_id", userID),
			)
			return domain.PlatformSQL{}, err
		}
		if !platform.IsActive || platform.PlatformName != platformName {
			r.logger.Error("GetPlatformsByUserID not active",
				zap.Error(err),
				zap.String("user_id", userID),
			)
			return domain.PlatformSQL{}, nil
		}
		if len(configData) > 0 {
			var configMap map[string]string
			if err := json.Unmarshal(configData, &configMap); err != nil {
				r.logger.Error("GetPlatformsByUserID in unmarshaling",
					zap.Error(err),
					zap.String("user_id", userID),
				)
				continue
			}
			platform.APIConfig = configMap
		}
		res = platform

	}
	if err := rows.Err(); err != nil {
		return domain.PlatformSQL{}, err
	}
	return res, nil
}

// GetTitleANDContent извлекает заголовок и содержимое публикации из базы данных по её идентификатору.
// Функция выполняет запрос к реплике (SlavePool), логирует возможные сбои и возвращает структуру domain.Message или ошибку.
func (r *Repository) GetTitleANDContent(ctx context.Context, id int) (domain.Message, error) {
	query := `
        SELECT title, content FROM posts WHERE id = $1
    `
	var res domain.Message
	err := r.SlavePool.QueryRow(ctx, query, id).Scan(&res.Title, &res.Content)
	if err != nil {
		r.logger.Error("GetTitleANDContent failed",
			zap.Error(err),
			zap.Int("post_id", id),
		)
		return domain.Message{}, err
	}
	return res, nil
}

// MarkAsSent обновляет статус публикации на 'published' и устанавливает текущее время отправки в базе данных.
// Функция логирует ошибку и возвращает её в обернутом виде, если операцию обновления выполнить не удалось.
func (r *Repository) MarkAsSent(ctx context.Context, id int) error {
	query := `
		UPDATE post_destinations
		SET 
			status= 'published', published_at = $1
		WHERE id = $2
	`
	_, err := r.MasterPool.Exec(ctx, query, time.Now(), id)
	if err != nil {
		r.logger.Error("MarkAsSent failed",
			zap.Error(err),
			zap.Int("post_destinations_id", id),
		)
		return fmt.Errorf("failed to mark as sent: %w", err)
	}
	return nil
}

// ErrorMessage обновляет текст сообщения об ошибке для указанной публикации в базе данных.
// Функция логирует сбой и возвращает обернутую ошибку, если запрос к базе данных завершился неудачно.
func (r *Repository) ErrorMessage(ctx context.Context, destinationID int, err error) error {
	query := `
		UPDATE post_destinations
		SET 
			error_message = $1
		WHERE id = $2
	`
	_, err1 := r.MasterPool.Exec(ctx, query, err, destinationID)
	if err1 != nil {
		r.logger.Error("ErrorMessage failed",
			zap.Error(err1),
			zap.Int("post_destinations_id", destinationID),
		)
		return fmt.Errorf("failed set error message: %w", err1)
	}
	return nil
}
