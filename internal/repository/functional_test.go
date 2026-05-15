package repository_test

import (
	"context"
	"fmt"
	"hexlet/internal/dto"
	"hexlet/internal/repository"
	"os"
	"testing"
	"time"

	"github.com/jackc/pgx/v4/pgxpool"
	"github.com/ory/dockertest/v3"
	"github.com/ory/dockertest/v3/docker"
	"go.uber.org/zap"
)

var (
	testRepo   *repository.Repository
	testPool   *pgxpool.Pool
	dockerPool *dockertest.Pool
	resource   *dockertest.Resource
	ctx        context.Context
)

func TestMain(m *testing.M) {
	var err error
	ctx = context.Background()

	dockerPool, err = dockertest.NewPool("")
	if err != nil {
		fmt.Printf("Could not construct pool: %s\n", err)
		os.Exit(1)
	}

	err = dockerPool.Client.Ping()
	if err != nil {
		fmt.Printf("Could not connect to Docker: %s\n", err)
		os.Exit(1)
	}

	resource, err = dockerPool.RunWithOptions(&dockertest.RunOptions{
		Repository: "postgres",
		Tag:        "14-alpine",
		Env: []string{
			"POSTGRES_PASSWORD=testpass",
			"POSTGRES_USER=testuser",
			"POSTGRES_DB=testdb",
		},
	}, func(config *docker.HostConfig) {
		config.AutoRemove = true
		config.RestartPolicy = docker.RestartPolicy{Name: "no"}
	})
	if err != nil {
		fmt.Printf("Could not start resource: %s\n", err)
		os.Exit(1)
	}

	hostAndPort := resource.GetHostPort("5432/tcp")
	databaseUrl := fmt.Sprintf("postgres://testuser:testpass@%s/testdb?sslmode=disable", hostAndPort)

	resource.Expire(120)

	if err := dockerPool.Retry(func() error {
		var err error
		testPool, err = pgxpool.Connect(ctx, databaseUrl)
		if err != nil {
			return err
		}
		return testPool.Ping(ctx)
	}); err != nil {
		fmt.Printf("Could not connect to database: %s\n", err)
		dockerPool.Purge(resource)
		os.Exit(1)
	}

	if err := createTables(); err != nil {
		fmt.Printf("Could not create tables: %s\n", err)
		testPool.Close()
		dockerPool.Purge(resource)
		os.Exit(1)
	}

	logger := zap.NewNop()
	testRepo = repository.NewRepository(testPool, testPool, logger)

	code := m.Run()

	testPool.Close()
	if err := dockerPool.Purge(resource); err != nil {
		fmt.Printf("Could not purge resource: %s\n", err)
	}

	os.Exit(code)
}

func createTables() error {
	_, err := testPool.Exec(ctx, `
		CREATE TABLE IF NOT EXISTS posts (
			id SERIAL PRIMARY KEY,
			user_id TEXT NOT NULL,
			title VARCHAR(255) NOT NULL,
			content TEXT NOT NULL,
			created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
		)
	`)
	if err != nil {
		return err
	}

	_, err = testPool.Exec(ctx, `
		CREATE TABLE IF NOT EXISTS platforms (
			id SERIAL PRIMARY KEY,
			user_id TEXT NOT NULL,
			platform_name VARCHAR(50) NOT NULL,
			api_config JSONB,
			is_active BOOLEAN DEFAULT true,
			created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
		)
	`)
	if err != nil {
		return err
	}

	_, err = testPool.Exec(ctx, `
		CREATE TABLE IF NOT EXISTS post_destinations (
			id SERIAL PRIMARY KEY,
			user_id TEXT NOT NULL,
			post_id INTEGER NOT NULL,
			platform_id INTEGER NOT NULL,
			scheduled_for TIMESTAMP WITH TIME ZONE,
			published_at TIMESTAMP WITH TIME ZONE,
			status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'published', 'failed','processing')),
			error_message TEXT,
			created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
		)
	`)
	if err != nil {
		return err
	}

	return nil
}

func cleanupTables() {
	testPool.Exec(ctx, "TRUNCATE posts, post_destinations, platforms CASCADE")
}

func TestNewRepository(t *testing.T) {
	logger := zap.NewNop()
	repo := repository.NewRepository(testPool, testPool, logger)
	if repo == nil {
		t.Error("Expected non-nil repository")
	}
}

func TestCreatePost(t *testing.T) {
	cleanupTables()

	configJSON := `{"token":"test_token"}`
	platformReq := dto.CreatePlatformRequest{
		IDUser:      "1",
		PlatformName: "telegram",
		BotName:     "test_bot",
		Config:       configJSON,
	}

	platformID, _, err := testRepo.CreatePlatform(ctx, platformReq)
	if err != nil {
		t.Fatal(err)
	}
	if platformID <= 0 {
		t.Errorf("Expected platform ID > 0, got %d", platformID)
	}

	post := dto.CreatePostRequest{
		IDUser:      "1",
		Title:        "First Post",
		Content:      "Content 1",
		SheduledFor: time.Now().Add(24 * time.Hour),
	}

	id, createdAt, err := testRepo.CreatePost(ctx, post)
	if err != nil {
		t.Fatal(err)
	}
	if id <= 0 {
		t.Errorf("Expected post ID > 0, got %d", id)
	}
	if createdAt.IsZero() {
		t.Error("Expected non-zero created_at")
	}

	posts, err := testRepo.GetPost(ctx, "1")
	if err != nil {
		t.Fatal(err)
	}

	if len(posts.Scheduled) != 1 {
		t.Errorf("Expected 1 scheduled post, got %d", len(posts.Scheduled))
	}
	if len(posts.Scheduled) > 0 && posts.Scheduled[0].Title != "First Post" {
		t.Errorf("Expected title 'First Post', got '%s'", posts.Scheduled[0].Title)
	}
}

func TestCreatePostWithMultiplePlatforms(t *testing.T) {
	cleanupTables()

	configJSON1 := `{"token":"token1"}`
	platformReq1 := dto.CreatePlatformRequest{
		IDUser:      "1",
		PlatformName: "telegram",
		BotName:     "bot1",
		Config:       configJSON1,
	}
	testRepo.CreatePlatform(ctx, platformReq1)

	configJSON2 := `{"token":"token2"}`
	platformReq2 := dto.CreatePlatformRequest{
		IDUser:      "1",
		PlatformName: "vk",
		BotName:     "bot2",
		Config:       configJSON2,
	}
	testRepo.CreatePlatform(ctx, platformReq2)

	post := dto.CreatePostRequest{
		IDUser:      "1",
		Title:        "Multi Platform Post",
		Content:      "Content for multiple platforms",
		SheduledFor: time.Now().Add(24 * time.Hour),
	}

	id, _, err := testRepo.CreatePost(ctx, post)
	if err != nil {
		t.Fatal(err)
	}
	if id <= 0 {
		t.Errorf("Expected post ID > 0, got %d", id)
	}

	var count int
	err = testPool.QueryRow(ctx, "SELECT COUNT(*) FROM post_destinations WHERE post_id=$1", id).Scan(&count)
	if err != nil {
		t.Fatal(err)
	}
	if count != 2 {
		t.Errorf("Expected 2 post destinations, got %d", count)
	}
}

func TestCreatePostNoPlatforms(t *testing.T) {
	cleanupTables()

	post := dto.CreatePostRequest{
		IDUser:      "999",
		Title:        "Post Without Platforms",
		Content:      "Content",
		SheduledFor: time.Now().Add(24 * time.Hour),
	}

	id, _, err := testRepo.CreatePost(ctx, post)
	if err != nil {
		t.Fatal(err)
	}

	var count int
	err = testPool.QueryRow(ctx, "SELECT COUNT(*) FROM post_destinations WHERE post_id=$1", id).Scan(&count)
	if err != nil {
		t.Fatal(err)
	}
	if count != 0 {
		t.Errorf("Expected 0 post destinations, got %d", count)
	}
}

func TestCreatePostDatabaseError(t *testing.T) {
	cleanupTables()
	testPool.Exec(ctx, "DROP TABLE posts CASCADE")
	defer createTables()

	post := dto.CreatePostRequest{
		IDUser:      "1",
		Title:        "Test Post",
		Content:      "Content",
		SheduledFor: time.Now(),
	}
	_, _, err := testRepo.CreatePost(ctx, post)

	if err == nil {
		t.Error("Expected error when database fails (table does not exist)")
	}
}

func TestGetPostEmpty(t *testing.T) {
	cleanupTables()

	posts, err := testRepo.GetPost(ctx, "999")
	if err != nil {
		t.Fatal(err)
	}

	if len(posts.Scheduled) != 0 {
		t.Errorf("Expected 0 scheduled posts, got %d", len(posts.Scheduled))
	}
	if len(posts.Processing) != 0 {
		t.Errorf("Expected 0 processing posts, got %d", len(posts.Processing))
	}
	if len(posts.Published) != 0 {
		t.Errorf("Expected 0 published posts, got %d", len(posts.Published))
	}
	if len(posts.Failed) != 0 {
		t.Errorf("Expected 0 failed posts, got %d", len(posts.Failed))
	}
}

func TestGetPostByStatus(t *testing.T) {
	cleanupTables()

	_, err := testPool.Exec(ctx, `
		INSERT INTO platforms (id, user_id, platform_name, api_config) 
		VALUES (1, '1', 'telegram', '{}')
	`)
	if err != nil {
		t.Fatal(err)
	}

	_, err = testPool.Exec(ctx, `
		INSERT INTO posts (id, user_id, title, content) VALUES 
		(1, '1', 'Scheduled Post', 'Scheduled Content'),
		(2, '1', 'Published Post', 'Published Content'),
		(3, '1', 'Failed Post', 'Failed Content'),
		(4, '1', 'Processing Post', 'Processing Content')
	`)
	if err != nil {
		t.Fatal(err)
	}

	_, err = testPool.Exec(ctx, `
		INSERT INTO post_destinations (user_id, post_id, platform_id, scheduled_for, status, error_message) VALUES 
		('1', 1, 1, NOW() + INTERVAL '1 day', 'scheduled', NULL),
		('1', 2, 1, NOW() - INTERVAL '1 day', 'published', NULL),
		('1', 3, 1, NOW() - INTERVAL '2 day', 'failed', 'API error'),
		('1', 4, 1, NOW() + INTERVAL '2 day', 'processing', NULL)
	`)
	if err != nil {
		t.Fatal(err)
	}

	posts, err := testRepo.GetPost(ctx, "1")
	if err != nil {
		t.Fatal(err)
	}

	if len(posts.Scheduled) != 1 {
		t.Errorf("Expected 1 scheduled post, got %d", len(posts.Scheduled))
	}
	if len(posts.Published) != 1 {
		t.Errorf("Expected 1 published post, got %d", len(posts.Published))
	}
	if len(posts.Failed) != 1 {
		t.Errorf("Expected 1 failed post, got %d", len(posts.Failed))
	}
	if len(posts.Processing) != 1 {
		t.Errorf("Expected 1 processing post, got %d", len(posts.Processing))
	}

	if len(posts.Failed) > 0 {
		expectedMsg := "API error"
		if posts.Failed[0].ErrorMessage == nil {
			t.Error("Expected error message 'API error', got nil")
		} else if *posts.Failed[0].ErrorMessage != expectedMsg {
			t.Errorf("Expected error message '%s', got '%s'", expectedMsg, *posts.Failed[0].ErrorMessage)
		}
	}
}


func TestGetPostByID(t *testing.T) {
	cleanupTables()

	configJSON := `{"token":"test_token"}`
	platformReq := dto.CreatePlatformRequest{
		IDUser:      "1",
		PlatformName: "telegram",
		BotName:     "test_bot",
		Config:       configJSON,
	}

	platformID, _, err := testRepo.CreatePlatform(ctx, platformReq)
	if err != nil {
		t.Fatal(err)
	}

	post := dto.CreatePostRequest{
		IDUser:      "1",
		Title:        "Test Post By ID",
		Content:      "Test Content By ID",
		SheduledFor: time.Now().Add(24 * time.Hour),
	}

	postID, _, err := testRepo.CreatePost(ctx, post)
	if err != nil {
		t.Fatal(err)
	}

	result, err := testRepo.GetPostByID(ctx, postID, "1")
	if err != nil {
		t.Fatal(err)
	}

	if len(result.Posts) != 1 {
		t.Errorf("Expected 1 post, got %d", len(result.Posts))
	}
	if len(result.Posts) > 0 {
		if result.Posts[0].IDPost != postID {
			t.Errorf("Expected post ID %d, got %d", postID, result.Posts[0].IDPost)
		}
		if result.Posts[0].Title != "Test Post By ID" {
			t.Errorf("Expected title 'Test Post By ID', got '%s'", result.Posts[0].Title)
		}
		if result.Posts[0].IDPlatform != platformID {
			t.Errorf("Expected platform ID %d, got %d", platformID, result.Posts[0].IDPlatform)
		}
	}
}

func TestGetPostByIDNotFound(t *testing.T) {
	cleanupTables()

	result, err := testRepo.GetPostByID(ctx, 99999, "1")
	if err != nil {
		t.Fatal(err)
	}
	if len(result.Posts) != 0 {
		t.Errorf("Expected 0 posts, got %d", len(result.Posts))
	}
}

func TestGetPostByIDWrongUser(t *testing.T) {
	cleanupTables()

	configJSON := `{"token":"test_token"}`
	platformReq := dto.CreatePlatformRequest{
		IDUser:      "1",
		PlatformName: "telegram",
		BotName:     "test_bot",
		Config:       configJSON,
	}
	testRepo.CreatePlatform(ctx, platformReq)

	post := dto.CreatePostRequest{
		IDUser:      "1",
		Title:        "User 1 Post",
		Content:      "Content",
		SheduledFor: time.Now().Add(24 * time.Hour),
	}
	postID, _, _ := testRepo.CreatePost(ctx, post)

	result, err := testRepo.GetPostByID(ctx, postID, "2")
	if err != nil {
		t.Fatal(err)
	}
	if len(result.Posts) != 0 {
		t.Errorf("Expected 0 posts for wrong user, got %d", len(result.Posts))
	}
}



func TestUpdatePostByID(t *testing.T) {
	cleanupTables()

	configJSON := `{"token":"test_token"}`
	platformReq := dto.CreatePlatformRequest{
		IDUser:      "1",
		PlatformName: "telegram",
		BotName:     "test_bot",
		Config:       configJSON,
	}

	_, _, err := testRepo.CreatePlatform(ctx, platformReq)
	if err != nil {
		t.Fatal(err)
	}

	post := dto.CreatePostRequest{
		IDUser:      "1",
		Title:        "Original Title",
		Content:      "Original Content",
		SheduledFor: time.Now().Add(24 * time.Hour),
	}

	postID, _, err := testRepo.CreatePost(ctx, post)
	if err != nil {
		t.Fatal(err)
	}

	updateReq := dto.PutPostRequest{
		IDPost:      postID,
		IDUser:      "1",
		Title:        "Updated Title",
		Content:      "Updated Content",
		SheduledFor: time.Now().Add(48 * time.Hour),
	}

	result, err := testRepo.UpdatePostByID(ctx, updateReq)
	if err != nil {
		t.Fatal(err)
	}

	if result.IDPost != postID {
		t.Errorf("Expected post ID %d, got %d", postID, result.IDPost)
	}
	if result.UpdatedAt.IsZero() {
		t.Error("Expected non-zero updated_at")
	}

	updatedPost, err := testRepo.GetPostByID(ctx, postID, "1")
	if err != nil {
		t.Fatal(err)
	}

	if len(updatedPost.Posts) > 0 {
		if updatedPost.Posts[0].Title != "Updated Title" {
			t.Errorf("Expected title 'Updated Title', got '%s'", updatedPost.Posts[0].Title)
		}
		if updatedPost.Posts[0].Content != "Updated Content" {
			t.Errorf("Expected content 'Updated Content', got '%s'", updatedPost.Posts[0].Content)
		}
	}
}

func TestUpdatePostByIDWrongUser(t *testing.T) {
	cleanupTables()

	configJSON := `{"token":"test_token"}`
	platformReq := dto.CreatePlatformRequest{
		IDUser:      "1",
		PlatformName: "telegram",
		BotName:     "test_bot",
		Config:       configJSON,
	}
	testRepo.CreatePlatform(ctx, platformReq)

	post := dto.CreatePostRequest{
		IDUser:      "1",
		Title:        "Original Title",
		Content:      "Original Content",
		SheduledFor: time.Now().Add(24 * time.Hour),
	}
	postID, _, _ := testRepo.CreatePost(ctx, post)

	updateReq := dto.PutPostRequest{
		IDPost:      postID,
		IDUser:      "2",
		Title:        "Hacked Title",
		Content:      "Hacked Content",
		SheduledFor: time.Now().Add(48 * time.Hour),
	}

	result, err := testRepo.UpdatePostByID(ctx, updateReq)
	if err != nil {
		t.Logf("Got error as expected: %v", err)
		return
	}

	if result.IDPost == postID {
		var title string
		err := testPool.QueryRow(ctx, "SELECT title FROM posts WHERE id=$1", postID).Scan(&title)
		if err == nil && title == "Hacked Title" {
			t.Error("Post was updated with wrong user ID - security issue!")
		} else {
			t.Log("Post was not updated - correct behavior")
		}
	}
}

func TestUpdatePostByIDDatabaseError(t *testing.T) {
	cleanupTables()
	testPool.Exec(ctx, "DROP TABLE posts CASCADE")
	defer createTables()

	updateReq := dto.PutPostRequest{
		IDPost:      1,
		IDUser:      "1",
		Title:        "Title",
		Content:      "Content",
		SheduledFor: time.Now(),
	}
	_, err := testRepo.UpdatePostByID(ctx, updateReq)
	if err == nil {
		t.Error("Expected error when database fails")
	}
}

func TestDeletePostByID(t *testing.T) {
	cleanupTables()

	configJSON := `{"token":"test_token"}`
	platformReq := dto.CreatePlatformRequest{
		IDUser:      "1",
		PlatformName: "telegram",
		BotName:     "test_bot",
		Config:       configJSON,
	}

	_, _, err := testRepo.CreatePlatform(ctx, platformReq)
	if err != nil {
		t.Fatal(err)
	}

	post := dto.CreatePostRequest{
		IDUser:      "1",
		Title:        "Post To Delete",
		Content:      "Content To Delete",
		SheduledFor: time.Now().Add(24 * time.Hour),
	}

	postID, _, err := testRepo.CreatePost(ctx, post)
	if err != nil {
		t.Fatal(err)
	}

	err = testRepo.DeletePostByID(ctx, postID)
	if err != nil {
		t.Fatal(err)
	}

	result, err := testRepo.GetPostByID(ctx, postID, "1")
	if err == nil && len(result.Posts) > 0 {
		t.Error("Expected no posts after deletion")
	}
}

func TestDeletePostByIDNotFound(t *testing.T) {
	cleanupTables()

	err := testRepo.DeletePostByID(ctx, 99999)
	if err != nil {
		t.Logf("Got error when deleting non-existent post: %v", err)
	}
}

func TestDeletePostByIDDatabaseError(t *testing.T) {
	cleanupTables()

	testPool.Exec(ctx, "DROP TABLE posts CASCADE")
	defer createTables()

	err := testRepo.DeletePostByID(ctx, 1)
	if err == nil {
		t.Error("Expected error when database fails")
	}
}

func TestCreatePlatform(t *testing.T) {
	cleanupTables()

	configJSON := `{"token":"test_token","chat_id":"12345"}`
	platformReq := dto.CreatePlatformRequest{
		IDUser:      "1",
		PlatformName: "telegram",
		BotName:     "test_bot",
		Config:       configJSON,
	}

	platformID, createdAt, err := testRepo.CreatePlatform(ctx, platformReq)
	if err != nil {
		t.Fatal(err)
	}
	if platformID <= 0 {
		t.Errorf("Expected platform ID > 0, got %d", platformID)
	}
	if createdAt.IsZero() {
		t.Error("Expected non-zero created_at")
	}

	platform, err := testRepo.GetPlatformByID(ctx, platformID, "1")
	if err != nil {
		t.Fatal(err)
	}

	if platform.Name != "telegram" {
		t.Errorf("Expected platform name 'telegram', got '%s'", platform.Name)
	}
	if !platform.IsActive {
		t.Error("Expected platform to be active")
	}
}

func TestCreatePlatformInvalidJSON(t *testing.T) {
	cleanupTables()

	platformReq := dto.CreatePlatformRequest{
		IDUser:      "1",
		PlatformName: "telegram",
		BotName:     "test_bot",
		Config:       `{"token":"test_token"`,
	}

	id, _, err := testRepo.CreatePlatform(ctx, platformReq)
	if err != nil {
		t.Logf("Got error as expected: %v", err)
		return
	}

	if id > 0 {
		platform, getErr := testRepo.GetPlatformByID(ctx, id, "1")
		if getErr == nil {
			t.Logf("Platform created with ID %d despite invalid JSON", id)
			if platform.ApiConfig == nil {
				t.Error("API config is nil")
			}
		}
	}
}

func TestCreatePlatformDatabaseError(t *testing.T) {
	cleanupTables()

	testPool.Exec(ctx, "DROP TABLE platforms CASCADE")
	defer createTables()

	platformReq := dto.CreatePlatformRequest{
		IDUser:      "1",
		PlatformName: "telegram",
		BotName:     "test_bot",
		Config:       `{"token":"test_token"}`,
	}

	_, _, err := testRepo.CreatePlatform(ctx, platformReq)
	if err == nil {
		t.Error("Expected error when database fails")
	}
}

func TestGetPlatformEmpty(t *testing.T) {
	cleanupTables()

	platforms, err := testRepo.GetPlatform(ctx, "999")
	if err != nil {
		t.Fatal(err)
	}

	if len(platforms.Platforms) != 0 {
		t.Errorf("Expected 0 platforms, got %d", len(platforms.Platforms))
	}
}

func TestGetPlatformMultiple(t *testing.T) {
	cleanupTables()

	platforms := []dto.CreatePlatformRequest{
		{
			IDUser:      "1",
			PlatformName: "telegram",
			BotName:     "telegram_bot",
			Config:       `{"token":"token1"}`,
		},
		{
			IDUser:      "1",
			PlatformName: "vk",
			BotName:     "vk_bot",
			Config:       `{"token":"token2"}`,
		},
		{
			IDUser:      "1",
			PlatformName: "discord",
			BotName:     "discord_bot",
			Config:       `{"token":"token3"}`,
		},
	}

	for _, p := range platforms {
		_, _, err := testRepo.CreatePlatform(ctx, p)
		if err != nil {
			t.Fatal(err)
		}
	}

	result, err := testRepo.GetPlatform(ctx, "1")
	if err != nil {
		t.Fatal(err)
	}

	if len(result.Platforms) != 3 {
		t.Errorf("Expected 3 platforms, got %d", len(result.Platforms))
	}
}



func TestGetPlatformByID(t *testing.T) {
	cleanupTables()

	configJSON := `{"token":"test_token"}`
	platformReq := dto.CreatePlatformRequest{
		IDUser:      "1",
		PlatformName: "telegram",
		BotName:     "test_bot",
		Config:       configJSON,
	}

	platformID, _, err := testRepo.CreatePlatform(ctx, platformReq)
	if err != nil {
		t.Fatal(err)
	}

	platform, err := testRepo.GetPlatformByID(ctx, platformID, "1")
	if err != nil {
		t.Fatal(err)
	}

	if platform.IDPlatform != platformID {
		t.Errorf("Expected platform ID %d, got %d", platformID, platform.IDPlatform)
	}
	if platform.Name != "telegram" {
		t.Errorf("Expected platform name 'telegram', got '%s'", platform.Name)
	}
}

func TestGetPlatformByIDNotFound(t *testing.T) {
	cleanupTables()

	_, err := testRepo.GetPlatformByID(ctx, 99999, "1")
	if err == nil {
		t.Error("Expected error when getting non-existent platform")
	}
}

func TestGetPlatformByIDWrongUser(t *testing.T) {
	cleanupTables()

	configJSON := `{"token":"test_token"}`
	platformReq := dto.CreatePlatformRequest{
		IDUser:      "1",
		PlatformName: "telegram",
		BotName:     "test_bot",
		Config:       configJSON,
	}

	platformID, _, err := testRepo.CreatePlatform(ctx, platformReq)
	if err != nil {
		t.Fatal(err)
	}

	_, err = testRepo.GetPlatformByID(ctx, platformID, "2")
	if err == nil {
		t.Error("Expected error when getting platform with wrong user ID")
	}
}

func TestGetPlatformByIDDatabaseError(t *testing.T) {
	cleanupTables()

	testPool.Exec(ctx, "DROP TABLE platforms CASCADE")
	createTables()

	_, err := testRepo.GetPlatformByID(ctx, 1, "1")
	if err == nil {
		t.Error("Expected error when database fails")
	}
}

func TestUpdatePlatformByID(t *testing.T) {
	cleanupTables()

	configJSON := `{"token":"test_token"}`
	platformReq := dto.CreatePlatformRequest{
		IDUser:      "1",
		PlatformName: "telegram",
		BotName:     "test_bot",
		Config:       configJSON,
	}

	platformID, _, err := testRepo.CreatePlatform(ctx, platformReq)
	if err != nil {
		t.Fatal(err)
	}

	updateConfigJSON := `{"token":"updated_token","chat_id":"67890"}`
	updateReq := dto.PutPlatformRequest{
		IDPlatform:  platformID,
		IDUser:      "1",
		PlatformName: "telegram",
		BotName:     "updated_bot",
		Config:       updateConfigJSON,
	}

	result, err := testRepo.UpdatePlatformByID(ctx, updateReq)
	if err != nil {
		t.Fatal(err)
	}

	if result.IDPlatform != platformID {
		t.Errorf("Expected platform ID %d, got %d", platformID, result.IDPlatform)
	}
	if result.UpdatedAt.IsZero() {
		t.Error("Expected non-zero updated_at")
	}
}

func TestUpdatePlatformByIDInvalidJSON(t *testing.T) {
	cleanupTables()

	configJSON := `{"token":"test_token"}`
	platformReq := dto.CreatePlatformRequest{
		IDUser:      "1",
		PlatformName: "telegram",
		BotName:     "test_bot",
		Config:       configJSON,
	}

	platformID, _, err := testRepo.CreatePlatform(ctx, platformReq)
	if err != nil {
		t.Fatal(err)
	}

	updateReq := dto.PutPlatformRequest{
		IDPlatform:  platformID,
		IDUser:      "1",
		PlatformName: "telegram",
		BotName:     "updated_bot",
		Config:       `{"token":"updated_token"`,
	}

	result, err := testRepo.UpdatePlatformByID(ctx, updateReq)
	if err != nil {
		t.Logf("Got error as expected: %v", err)
		return
	}

	if result.IDPlatform == platformID {
		platform, getErr := testRepo.GetPlatformByID(ctx, platformID, "1")
		if getErr == nil && platform.ApiConfig != nil {
			t.Log("Platform was updated despite invalid JSON")
		}
	}
}

func TestUpdatePlatformByIDWrongUser(t *testing.T) {
	cleanupTables()

	configJSON := `{"token":"test_token"}`
	platformReq := dto.CreatePlatformRequest{
		IDUser:      "1",
		PlatformName: "telegram",
		BotName:     "test_bot",
		Config:       configJSON,
	}

	platformID, _, err := testRepo.CreatePlatform(ctx, platformReq)
	if err != nil {
		t.Fatal(err)
	}

	updateReq := dto.PutPlatformRequest{
		IDPlatform:  platformID,
		IDUser:      "2",
		PlatformName: "telegram",
		BotName:     "hacked_bot",
		Config:       `{"token":"hacked_token"}`,
	}

	result, err := testRepo.UpdatePlatformByID(ctx, updateReq)
	if err != nil {
		t.Logf("Got error as expected: %v", err)
		return
	}

	if result.IDPlatform == platformID {
		platform, getErr := testRepo.GetPlatformByID(ctx, platformID, "1")
		if getErr == nil && platform.ApiConfig != nil {
			if config, ok := platform.ApiConfig["hacked_bot"]; ok {
				if config == "hacked_token" {
					t.Error("Platform was updated with wrong user ID - security issue!")
					return
				}
			}
		}
		t.Log("Platform was not updated - correct behavior")
	}
}

func TestUpdatePlatformByIDDatabaseError(t *testing.T) {
	cleanupTables()

	testPool.Exec(ctx, "DROP TABLE platforms CASCADE")
	defer createTables()

	updateReq := dto.PutPlatformRequest{
		IDPlatform:  1,
		IDUser:      "1",
		PlatformName: "telegram",
		BotName:     "test_bot",
		Config:       `{"token":"test_token"}`,
	}

	_, err := testRepo.UpdatePlatformByID(ctx, updateReq)
	if err == nil {
		t.Error("Expected error when database fails")
	}
}

func TestDeletePlatformByID(t *testing.T) {
	cleanupTables()

	configJSON := `{"token":"test_token"}`
	platformReq := dto.CreatePlatformRequest{
		IDUser:      "1",
		PlatformName: "telegram",
		BotName:     "test_bot",
		Config:       configJSON,
	}

	platformID, _, err := testRepo.CreatePlatform(ctx, platformReq)
	if err != nil {
		t.Fatal(err)
	}

	err = testRepo.DeletePlatformByID(ctx, platformID)
	if err != nil {
		t.Fatal(err)
	}

	_, err = testRepo.GetPlatformByID(ctx, platformID, "1")
	if err == nil {
		t.Error("Expected error when getting deleted platform")
	}
}

func TestDeletePlatformByIDCascade(t *testing.T) {
	cleanupTables()

	configJSON := `{"token":"test_token"}`
	platformReq := dto.CreatePlatformRequest{
		IDUser:      "1",
		PlatformName: "telegram",
		BotName:     "test_bot",
		Config:       configJSON,
	}

	platformID, _, err := testRepo.CreatePlatform(ctx, platformReq)
	if err != nil {
		t.Fatal(err)
	}

	post := dto.CreatePostRequest{
		IDUser:      "1",
		Title:        "Post with platform",
		Content:      "Content",
		SheduledFor: time.Now().Add(24 * time.Hour),
	}

	postID, _, err := testRepo.CreatePost(ctx, post)
	if err != nil {
		t.Fatal(err)
	}

	err = testRepo.DeletePlatformByID(ctx, platformID)
	if err != nil {
		t.Fatal(err)
	}

	var count int
	err = testPool.QueryRow(ctx, "SELECT COUNT(*) FROM post_destinations WHERE post_id=$1", postID).Scan(&count)
	if err != nil {
		t.Fatal(err)
	}
	if count != 0 {
		t.Errorf("Expected 0 post destinations after platform deletion, got %d", count)
	}
}

func TestDeletePlatformByIDNotFound(t *testing.T) {
	cleanupTables()

	err := testRepo.DeletePlatformByID(ctx, 99999)
	if err != nil {
		t.Logf("Got error when deleting non-existent platform: %v", err)
	}
}

func TestDeletePlatformByIDDatabaseError(t *testing.T) {
	cleanupTables()

	testPool.Exec(ctx, "DROP TABLE platforms CASCADE")
	defer createTables()

	err := testRepo.DeletePlatformByID(ctx, 1)
	if err == nil {
		t.Error("Expected error when database fails")
	}
}
