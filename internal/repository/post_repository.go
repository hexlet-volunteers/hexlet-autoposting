package repository

import (
	"context"
	"encoding/json"
	"hexlet/internal/domain"
	"hexlet/internal/dto"
	"time"

	"github.com/jackc/pgx/v4/pgxpool"
	"go.uber.org/zap"
)

type PostRepository interface {
	CreatePost(ctx context.Context, post dto.CreatePostRequest) (int, time.Time, error)
	GetPost(ctx context.Context, userID string) (dto.GetPostsResponse, error)
	GetPostByID(ctx context.Context, postID int, userID string) (dto.GetPostResponse, error)
	DeletePostByID(ctx context.Context, postID int) error
	UpdatePostByID(ctx context.Context, req dto.PutPostRequest) (dto.PutPostResponse, error)

	CreatePlatform(ctx context.Context, platform dto.CreatePlatformRequest) (int, time.Time, error)
	GetPlatform(ctx context.Context, userID string) (dto.GetPlatformResponse, error)
	GetPlatformByID(ctx context.Context, platformID int, userID string) (domain.Platform, error)
	DeletePlatformByID(ctx context.Context, PlatformID int) error
	UpdatePlatformByID(ctx context.Context, req dto.PutPlatformRequest) (dto.PutPlatformResponse, error)
}
type Repository struct {
	MasterPool *pgxpool.Pool
	SlavePool  *pgxpool.Pool
	logger     *zap.Logger
}

func NewRepository(masterpool *pgxpool.Pool, slavepool *pgxpool.Pool, logger *zap.Logger) *Repository {
	return &Repository{
		MasterPool: masterpool,
		SlavePool:  slavepool,
		logger:     logger,
	}
}

// --- POSTS REPOSITORY METHODS ---
/*
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE post_destinations (
    id SERIAL PRIMARY KEY,
	user_id INTEGER NOT NULL,
    post_id INTEGER NOT NULL,
    platform_id INTEGER NOT NULL,
    scheduled_for TIMESTAMP WITH TIME ZONE,
    published_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'published', 'failed','processing')),
    error_message TEXT,
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

*/
func (r *Repository) GetPostByID(ctx context.Context, postID int, userID string) (dto.GetPostResponse, error) {
	rows, err := r.SlavePool.Query(ctx, "SELECT user_id, platform_id, scheduled_for, status, error_message FROM post_destinations WHERE post_id=$1 AND user_id=$2 ", postID, userID)
	if err != nil {
		r.logger.Error("GetPostByID failed in selecting from post_destinations",
			zap.Error(err),
			zap.Int("post_id", postID),
			zap.String("user_id", userID),
		)
		return dto.GetPostResponse{}, err
	}
	defer rows.Close()
	res := dto.GetPostResponse{}
	res.Posts = []domain.Post{}
	for rows.Next() {
		p1 := domain.Post{}
		p1.IDPost = postID
		err := rows.Scan(&p1.IDUser, &p1.IDPlatform, &p1.SheduledFor, &p1.Status, &p1.ErrorMessage)
		if err != nil {
			r.logger.Error("GetPostByID failed in scaning",
				zap.Error(err),
				zap.Int("post_id", postID),
				zap.String("user_id", userID),
			)
			return res, err
		}
		err = r.SlavePool.QueryRow(ctx, "SELECT title, content, created_at FROM posts WHERE id=$1", p1.IDPost).Scan(
			&p1.Title, &p1.Content, &p1.CreatedAt)
		if err != nil {
			r.logger.Error("GetPostByID failed in selecting from posts",
				zap.Error(err),
				zap.Int("post_id", postID),
				zap.String("user_id", userID),
			)
			return res, err
		}
		err = r.SlavePool.QueryRow(ctx, "SELECT platform_name FROM platforms WHERE id=$1", p1.IDPlatform).Scan(
			&p1.PlatformName)
		if err != nil {
			r.logger.Error("GetPostByID failed in selecting from platforms",
				zap.Error(err),
				zap.Int("post_id", postID),
				zap.String("user_id", userID),
			)
			return res, err
		}
		p1.SheduledFor = p1.SheduledFor.Add(3 * time.Hour)
		p1.CreatedAt = p1.CreatedAt.Add(3 * time.Hour)
		res.Posts = append(res.Posts, p1)
	}
	return res, nil
}

func (r *Repository) DeletePostByID(ctx context.Context, postID int) error {
	_, err := r.MasterPool.Exec(ctx, "DELETE FROM posts WHERE id=$1", postID)
	if err != nil {
		r.logger.Error("DeletePostByID failed in deleting in posts",
			zap.Error(err),
			zap.Int("post_id", postID),
		)
		return err
	}
	_, err = r.MasterPool.Exec(ctx, "DELETE FROM post_destinations WHERE post_id=$1", postID)
	if err != nil {
		r.logger.Error("DeletePostByID failed in deleting in post_destinations",
			zap.Error(err),
			zap.Int("post_id", postID),
		)
		return err
	}
	return nil
}

func (r *Repository) GetPost(ctx context.Context, userID string) (dto.GetPostsResponse, error) {
	rows, err := r.SlavePool.Query(ctx, "SELECT post_id, platform_id, scheduled_for, status, error_message FROM post_destinations WHERE user_id=$1", userID)
	if err != nil {
		r.logger.Error("GetPost failed in selecting from post_destinations",
			zap.Error(err),
			zap.String("user_id", userID),
		)
		return dto.GetPostsResponse{}, err
	}
	defer rows.Close()
	res := dto.GetPostsResponse{}
	res.Processing = []domain.Post{}
	res.Scheduled = []domain.Post{}
	res.Published = []domain.Post{}
	res.Failed = []domain.Post{}
	for rows.Next() {
		p1 := domain.Post{}
		p1.IDUser = userID
		err := rows.Scan(&p1.IDPost, &p1.IDPlatform, &p1.SheduledFor, &p1.Status, &p1.ErrorMessage)
		if err != nil {
			r.logger.Error("GetPost failed in scaning",
				zap.Error(err),
				zap.Int("post_id", p1.IDPost),
				zap.String("user_id", userID),
			)
			return dto.GetPostsResponse{}, err
		}
		err = r.SlavePool.QueryRow(ctx, "SELECT title, content, created_at FROM posts WHERE id=$1", p1.IDPost).Scan(
			&p1.Title, &p1.Content, &p1.CreatedAt)
		if err != nil {
			r.logger.Error("GetPost failed in selecting from posts",
				zap.Error(err),
				zap.Int("post_id", p1.IDPost),
				zap.String("user_id", userID),
			)
			return dto.GetPostsResponse{}, err
		}
		err = r.SlavePool.QueryRow(ctx, "SELECT platform_name FROM platforms WHERE id=$1", p1.IDPlatform).Scan(
			&p1.PlatformName)
		if err != nil {
			r.logger.Error("GetPost failed in selecting from platforms",
				zap.Error(err),
				zap.Int("platform_id", p1.IDPlatform),
				zap.String("user_id", userID),
			)
			return dto.GetPostsResponse{}, err
		}
		p1.SheduledFor = p1.SheduledFor.Add(3 * time.Hour)
		p1.CreatedAt = p1.CreatedAt.Add(3 * time.Hour)
		switch p1.Status {
		case "processing":
			res.Processing = append(res.Processing, p1)
		case "scheduled":
			res.Scheduled = append(res.Scheduled, p1)
		case "published":
			res.Published = append(res.Published, p1)
		default:
			res.Failed = append(res.Failed, p1)
		}
	}
	return res, nil
}

func (r *Repository) UpdatePostByID(ctx context.Context, req dto.PutPostRequest) (dto.PutPostResponse, error) {
	_, err := r.MasterPool.Exec(ctx, `
		UPDATE posts 
		SET title = $1, content = $2 
		WHERE id = $3 AND user_id = $4`,
		req.Title, req.Content, req.IDPost, req.IDUser,
	)
	if err != nil {
		r.logger.Error("UpdatePostByID failed in updating in posts",
			zap.Error(err),
			zap.String("user_id", req.IDUser),
			zap.Int("post_id", req.IDPost),
		)
		return dto.PutPostResponse{}, err
	}
	_, err = r.MasterPool.Exec(ctx, `
		UPDATE post_destinations
		SET scheduled_for = $1
		WHERE id = $2 AND user_id = $3`,
		req.SheduledFor, req.IDPost, req.IDUser,
	)
	if err != nil {
		r.logger.Error("UpdatePostByID failed in updating in post_destinations",
			zap.Error(err),
			zap.String("user_id", req.IDUser),
			zap.Int("post_id", req.IDPost),
		)
		return dto.PutPostResponse{}, err
	}
	IDPost := req.IDPost
	return dto.PutPostResponse{IDPost: IDPost, IDUser: req.IDUser, UpdatedAt: time.Now()}, nil
}
func (r *Repository) CreatePost(ctx context.Context, post dto.CreatePostRequest) (int, time.Time, error) {
	var ID int
	var createdAt time.Time
	err := r.MasterPool.QueryRow(ctx, `INSERT INTO posts (user_id, title, content) VALUES ($1, $2, $3) RETURNING id, created_at;`,
		post.IDUser, post.Title, post.Content).Scan(&ID, &createdAt)
	if err != nil {
		r.logger.Error("CreatePost failed in inserting to posts",
			zap.Error(err),
			zap.String("user_id", post.IDUser),
		)
		return ID, createdAt, err
	}
	platformsIDs, err := r.SlavePool.Query(ctx, "SELECT id FROM platforms WHERE user_id=$1", post.IDUser)
	if err != nil {
		r.logger.Error("CreatePost failed in selecting",
			zap.Error(err),
			zap.String("user_id", post.IDUser),
		)
		return ID, createdAt, err
	}
	defer platformsIDs.Close()
	var platformID int
	for platformsIDs.Next() {
		err := platformsIDs.Scan(&platformID)
		if err != nil {
			r.logger.Error("CreatePost failed in scaning",
				zap.Error(err),
				zap.String("user_id", post.IDUser),
			)
			return 0, createdAt, err
		}
		_, err1 := r.MasterPool.Exec(ctx,
			`INSERT INTO post_destinations (user_id, post_id, platform_id,status, scheduled_for) VALUES ($1, $2, $3, $4,$5)`,
			post.IDUser, ID, platformID, "scheduled", post.SheduledFor)
		if err1 != nil {
			r.logger.Error("CreatePost failed in inserting to post_destinations",
				zap.Error(err1),
				zap.String("user_id", post.IDUser),
			)
			return ID, createdAt, err1
		}
	}
	return ID, createdAt, nil
}

// --- PLATFORMS REPOSITORY METHODS ---
/*
CREATE TABLE platforms (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    platform_name VARCHAR(50) NOT NULL,
    api_config JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
*/

func (r *Repository) CreatePlatform(ctx context.Context, platform dto.CreatePlatformRequest) (int, time.Time, error) {
	var ID int
	var createdAt time.Time
	APIConfig := make(map[string]interface{})
	APIConfig[platform.BotName] = platform.Config
	err := r.MasterPool.QueryRow(ctx, `
        INSERT INTO platforms (user_id, platform_name, api_config, is_active) 
        VALUES ($1, $2, $3, $4) 
        RETURNING id, created_at;`,
		platform.IDUser,
		platform.PlatformName,
		APIConfig,
		true,
	).Scan(&ID, &createdAt)
	if err != nil {
		r.logger.Error("CreatePlatform failed",
			zap.Error(err),
			zap.String("user_id", platform.IDUser),
		)
		return ID, createdAt, err
	}
	return ID, createdAt, nil
}

func (r *Repository) GetPlatform(ctx context.Context, userID string) (dto.GetPlatformResponse, error) {
	rows, err := r.SlavePool.Query(ctx, "SELECT id, platform_name, api_config, is_active, created_at, updated_at FROM platforms WHERE user_id=$1", userID)
	if err != nil {
		r.logger.Error("GetPlatform failed",
			zap.Error(err),
			zap.String("user_id", userID),
		)
		return dto.GetPlatformResponse{}, err
	}
	defer rows.Close()
	res := dto.GetPlatformResponse{}
	res.Platforms = []domain.Platform{}
	for rows.Next() {
		p1 := domain.Platform{}
		err := rows.Scan(&p1.IDPlatform, &p1.Name, &p1.APIConfig, &p1.IsActive, &p1.CreatedAt, &p1.UpdatedAt)
		if err != nil {
			r.logger.Error("GetPlatform failed in scaning",
				zap.Error(err),
				zap.String("user_id", userID),
			)
			return res, err
		}
		res.Platforms = append(res.Platforms, p1)
	}
	return res, nil
}

func (r *Repository) GetPlatformByID(ctx context.Context, platformID int, userID string) (domain.Platform, error) {
	res := domain.Platform{}
	err := r.SlavePool.QueryRow(ctx, "SELECT id, platform_name, api_config, is_active, created_at, updated_at FROM platforms WHERE user_id=$1 AND id=$2", userID, platformID).Scan(
		&res.IDPlatform, &res.Name, &res.APIConfig, &res.IsActive, &res.CreatedAt, &res.UpdatedAt)
	if err != nil {
		r.logger.Error("GetPlatformByID failed",
			zap.Error(err),
			zap.Int("platform_id", platformID),
			zap.String("user_id", userID),
		)
		return domain.Platform{}, err
	}
	return res, nil
}

func (r *Repository) DeletePlatformByID(ctx context.Context, platformID int) error {
	_, err := r.MasterPool.Exec(ctx, "DELETE FROM platforms WHERE id=$1", platformID)
	if err != nil {
		r.logger.Error("DeletePlatformByID failed in deleting from platforms",
			zap.Error(err),
			zap.Int("platform_id", platformID),
		)
		return err
	}
	_, err = r.MasterPool.Exec(ctx, "DELETE FROM post_destinations WHERE platform_id=$1", platformID)
	if err != nil {
		r.logger.Error("DeletePlatformByID failed in deleting from post_destinations",
			zap.Error(err),
			zap.Int("platform_id", platformID),
		)
		return err
	}
	return nil
}

func (r *Repository) UpdatePlatformByID(ctx context.Context, req dto.PutPlatformRequest) (dto.PutPlatformResponse, error) {
	APIConfig := make(map[string]interface{})
	APIConfig[req.BotName] = req.Config
	configBytes, err := json.Marshal(APIConfig)
	if err != nil {
		r.logger.Error("UpdatePlatformByID failed in marshal",
			zap.Error(err),
			zap.Int("platform_id", req.IDPlatform),
			zap.String("user_id", req.IDUser),
		)
		return dto.PutPlatformResponse{}, err
	}
	_, err = r.MasterPool.Exec(ctx, `
		UPDATE platforms
		SET  api_config = $1
		WHERE id = $2 AND user_id = $3`,
		configBytes, req.IDPlatform, req.IDUser,
	)
	if err != nil {
		r.logger.Error("UpdatePlatformByID failed in query",
			zap.Error(err),
			zap.Int("platform_id", req.IDPlatform),
			zap.String("user_id", req.IDUser),
		)
		return dto.PutPlatformResponse{}, err
	}
	return dto.PutPlatformResponse{IDPlatform: req.IDPlatform, IDUser: req.IDUser, UpdatedAt: time.Now()}, nil
}
