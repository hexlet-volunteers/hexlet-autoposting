package handler

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
	"time"

	"hexlet/internal/auth"
	"hexlet/internal/domain"
	"hexlet/internal/dto"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

// Mock репозитория
type MockPostRepository struct {
	mock.Mock
}

const (
	TestPost     = "Test Post"
	TestContent  = "Test Content"
	TestPlatform = "Test Platform"
	TestToken    = `{"token":"test_token"}`
	TestBot      = "test_bot"

	UpdatedTitle    = "Updated Title"
	UpdatedContent  = "Updated Content"
	UpdatedPlatform = "Updated Platform"
	UpdatedBot      = "updated_bot"
	UpdatedConfig   = "updated_config"

	OriginalTitle   = "Original Title"
	OriginalContent = "Original Content"
	Telegram        = "telegram"
	Content         = "Content"
)

func (m *MockPostRepository) CreatePost(ctx context.Context, post dto.CreatePostRequest) (int, time.Time, error) {
	args := m.Called(ctx, post)
	return args.Int(0), args.Get(1).(time.Time), args.Error(2)
}

func (m *MockPostRepository) GetPost(ctx context.Context, userID string) (dto.GetPostsResponse, error) {
	args := m.Called(ctx, userID)
	return args.Get(0).(dto.GetPostsResponse), args.Error(1)
}

func (m *MockPostRepository) GetPostByID(ctx context.Context, postID int, userID string) (dto.GetPostResponse, error) {
	args := m.Called(ctx, postID, userID)
	return args.Get(0).(dto.GetPostResponse), args.Error(1)
}

func (m *MockPostRepository) DeletePostByID(ctx context.Context, postID int) error {
	args := m.Called(ctx, postID)
	return args.Error(0)
}

func (m *MockPostRepository) UpdatePostByID(ctx context.Context, req dto.PutPostRequest) (dto.PutPostResponse, error) {
	args := m.Called(ctx, req)
	return args.Get(0).(dto.PutPostResponse), args.Error(1)
}

func (m *MockPostRepository) CreatePlatform(ctx context.Context, platform dto.CreatePlatformRequest) (int, time.Time, error) {
	args := m.Called(ctx, platform)
	return args.Int(0), args.Get(1).(time.Time), args.Error(2)
}

func (m *MockPostRepository) GetPlatform(ctx context.Context, userID string) (dto.GetPlatformResponse, error) {
	args := m.Called(ctx, userID)
	return args.Get(0).(dto.GetPlatformResponse), args.Error(1)
}

func (m *MockPostRepository) GetPlatformByID(ctx context.Context, platformID int, userID string) (domain.Platform, error) {
	args := m.Called(ctx, platformID, userID)
	return args.Get(0).(domain.Platform), args.Error(1)
}

func (m *MockPostRepository) DeletePlatformByID(ctx context.Context, platformID int) error {
	args := m.Called(ctx, platformID)
	return args.Error(0)
}

func (m *MockPostRepository) UpdatePlatformByID(ctx context.Context, req dto.PutPlatformRequest) (dto.PutPlatformResponse, error) {
	args := m.Called(ctx, req)
	return args.Get(0).(dto.PutPlatformResponse), args.Error(1)
}

func setupTest() (*gin.Engine, *MockPostRepository, *App) {
	gin.SetMode(gin.TestMode)
	os.Setenv("JWT_ACCESS_SECRET", "test-secret")
	mockRepo := new(MockPostRepository)
	app := &App{
		Ctx:  context.Background(),
		Repo: mockRepo,
	}
	router := gin.New()
	app.Routes(router)
	return router, mockRepo, app
}
func generateTestToken(userID string) string {
	// Access Token
	accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, auth.MyClaims{
		UserID: userID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(15 * time.Minute)),
		},
	})
	aToken, _ := accessToken.SignedString([]byte(os.Getenv("JWT_ACCESS_SECRET")))
	return aToken
}

// Вспомогательная функция для сравнения времени без учета монотонной части
func compareTime(t1, t2 time.Time) bool {
	return t1.UnixNano() == t2.UnixNano()
}

func TestCreatePost_Success(t *testing.T) {
	router, mockRepo, _ := setupTest()
	baseTime := time.Now().Add(24 * time.Hour).UTC().Truncate(time.Second)
	reqBody := dto.CreatePostRequest{
		IDUser:      "1",
		Title:       TestPost,
		Content:     TestContent,
		SheduledFor: baseTime,
	}
	expectedCreatedAt := time.Now().Add(3 * time.Hour).UTC().Truncate(time.Second)
	jsonBody, _ := json.Marshal(reqBody)
	mockRepo.On("CreatePost", mock.Anything, mock.MatchedBy(func(req dto.CreatePostRequest) bool {
		expectedTimeInRepo := baseTime.Add(-3 * time.Hour).Unix()

		return req.IDUser == "1" &&
			req.Title == TestPost &&
			req.Status == Scheduled &&
			req.SheduledFor.Unix() == expectedTimeInRepo
	})).Return(1, expectedCreatedAt, nil)
	req, _ := http.NewRequestWithContext(context.Background(), "POST", "/posts", bytes.NewBuffer(jsonBody))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+generateTestToken("1"))
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	assert.Equal(t, http.StatusOK, w.Code)
	var response dto.CreatePostResponse
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, 1, response.IDPost)
	assert.Equal(t, "1", response.IDUser)
	assert.Equal(t, expectedCreatedAt.Unix(), response.CreatedAt.Unix())
	mockRepo.AssertExpectations(t)
}

func TestCreatePost_InvalidJSON(t *testing.T) {
	router, mockRepo, _ := setupTest()
	req, _ := http.NewRequestWithContext(context.Background(), "POST", "/posts", bytes.NewBuffer([]byte("invalid json")))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+generateTestToken("1"))

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)

	var response map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Contains(t, response["error"], "invalid character")

	mockRepo.AssertNotCalled(t, "CreatePost")
}

func TestCreatePost_ValidationError(t *testing.T) {
	router, mockRepo, _ := setupTest()

	reqBody := dto.CreatePostRequest{}

	jsonBody, _ := json.Marshal(reqBody)
	req, _ := http.NewRequestWithContext(context.Background(), "POST", "/posts", bytes.NewBuffer(jsonBody))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+generateTestToken("1"))

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)
	mockRepo.AssertNotCalled(t, "CreatePost")
}

func TestCreatePost_RepositoryError(t *testing.T) {
	router, mockRepo, _ := setupTest()

	reqBody := dto.CreatePostRequest{
		IDUser:      "1",
		Title:       TestPost,
		Content:     TestContent,
		SheduledFor: time.Now().Add(24 * time.Hour),
	}

	mockRepo.On("CreatePost", mock.Anything, mock.AnythingOfType("dto.CreatePostRequest")).
		Return(0, time.Time{}, errors.New("database error"))

	jsonBody, _ := json.Marshal(reqBody)
	req, _ := http.NewRequestWithContext(context.Background(), "POST", "/posts", bytes.NewBuffer(jsonBody))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+generateTestToken("1"))

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusInternalServerError, w.Code)

	var response map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Contains(t, response["error"], "database error")

	mockRepo.AssertExpectations(t)
}

// Тесты для GetPosts
func TestGetPosts_Success(t *testing.T) {
	router, mockRepo, _ := setupTest()

	reqBody := dto.GetByUserIDRequest{
		IDUser: "1",
	}
	expectedResponse := dto.GetPostsResponse{
		Scheduled: []domain.Post{
			{
				IDPost:      1,
				IDUser:      "1",
				Title:       "Scheduled Post",
				Content:     "Content 1",
				Status:      Scheduled,
				CreatedAt:   time.Now().Round(0),
				SheduledFor: time.Now().Add(24 * time.Hour).Round(0),
			},
		},
		Processing: []domain.Post{
			{
				IDPost:      2,
				IDUser:      "1",
				Title:       "Processing Post",
				Content:     "Content 2",
				Status:      "processing",
				CreatedAt:   time.Now().Round(0),
				SheduledFor: time.Now().Add(1 * time.Hour).Round(0),
			},
		},
		Published: []domain.Post{
			{
				IDPost:    3,
				IDUser:    "1",
				Title:     "Published Post",
				Content:   "Content 3",
				Status:    "published",
				CreatedAt: time.Now().Add(-24 * time.Hour).Round(0),
			},
		},
		Failed: []domain.Post{
			{
				IDPost:       4,
				IDUser:       "1",
				Title:        "Failed Post",
				Content:      "Content 4",
				Status:       "failed",
				CreatedAt:    time.Now().Add(-48 * time.Hour).Round(0),
				ErrorMessage: stringPtr("Failed to publish"),
			},
		},
	}

	mockRepo.On("GetPost", mock.Anything, "1").Return(expectedResponse, nil)

	jsonBody, _ := json.Marshal(reqBody)
	req, _ := http.NewRequestWithContext(context.Background(), "GET", "/posts", bytes.NewBuffer(jsonBody))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+generateTestToken("1"))

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	var response dto.GetPostsResponse
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Len(t, response.Scheduled, 1)
	assert.Len(t, response.Processing, 1)
	assert.Len(t, response.Published, 1)
	assert.Len(t, response.Failed, 1)
	assert.Equal(t, "Scheduled Post", response.Scheduled[0].Title)
	assert.Equal(t, "Processing Post", response.Processing[0].Title)
	assert.Equal(t, "Published Post", response.Published[0].Title)
	assert.Equal(t, "Failed Post", response.Failed[0].Title)

	mockRepo.AssertExpectations(t)
}

func TestGetPosts_RepositoryError(t *testing.T) {
	router, mockRepo, _ := setupTest()

	reqBody := dto.GetByUserIDRequest{
		IDUser: "1",
	}

	mockRepo.On("GetPost", mock.Anything, "1").Return(dto.GetPostsResponse{}, errors.New("database error"))

	jsonBody, _ := json.Marshal(reqBody)
	req, _ := http.NewRequestWithContext(context.Background(), "GET", "/posts", bytes.NewBuffer(jsonBody))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+generateTestToken("1"))

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusInternalServerError, w.Code)

	var response map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Contains(t, response["error"], "database error")

	mockRepo.AssertExpectations(t)
}

// Тесты для GetPost
func TestGetPost_Success(t *testing.T) {
	router, mockRepo, _ := setupTest()

	reqBody := dto.GetByUserIDRequest{
		IDUser: "1",
	}

	scheduledTime := time.Now().Add(24 * time.Hour).Round(0)
	expectedPost := dto.GetPostResponse{
		Posts: []domain.Post{
			{
				IDPost:      1,
				IDUser:      "1",
				Title:       TestPost,
				Content:     TestContent,
				Status:      Scheduled,
				CreatedAt:   time.Now().Round(0),
				SheduledFor: scheduledTime,
			},
		},
	}

	mockRepo.On("GetPostByID", mock.Anything, 1, "1").Return(expectedPost, nil)

	jsonBody, _ := json.Marshal(reqBody)
	req, _ := http.NewRequestWithContext(context.Background(), "GET", "/posts/1", bytes.NewBuffer(jsonBody))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+generateTestToken("1"))

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	var response dto.GetPostResponse
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Len(t, response.Posts, 1)
	assert.Equal(t, TestPost, response.Posts[0].Title)

	mockRepo.AssertExpectations(t)
}

func TestGetPost_InvalidID(t *testing.T) {
	router, mockRepo, _ := setupTest()
	req, _ := http.NewRequestWithContext(context.Background(), "GET", "/posts/invalid", nil)
	req.Header.Set("Authorization", "Bearer "+generateTestToken("1"))
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)

	var response map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, "invalid id", response["error"])

	mockRepo.AssertNotCalled(t, "GetPostByID")
}

// Тесты для PutPost
func TestPutPost_Success(t *testing.T) {
	router, mockRepo, _ := setupTest()

	reqBody := dto.PutPostRequest{
		IDUser:  "1",
		Title:   UpdatedTitle,
		Content: UpdatedContent,
	}

	existingPost := dto.GetPostResponse{
		Posts: []domain.Post{
			{
				IDPost:      1,
				IDUser:      "1",
				Title:       OriginalTitle,
				Content:     OriginalContent,
				SheduledFor: time.Now().Add(24 * time.Hour),
			},
		},
	}

	expectedResponse := dto.PutPostResponse{
		IDPost:    1,
		IDUser:    "1",
		UpdatedAt: time.Now().Round(0),
	}

	mockRepo.On("GetPostByID", mock.Anything, 1, "1").Return(existingPost, nil)
	mockRepo.On("UpdatePostByID", mock.Anything, mock.MatchedBy(func(req dto.PutPostRequest) bool {
		return req.Title == UpdatedTitle && req.Content == UpdatedContent
	})).Return(expectedResponse, nil)

	jsonBody, _ := json.Marshal(reqBody)
	req, _ := http.NewRequestWithContext(context.Background(), "PUT", "/posts/1", bytes.NewBuffer(jsonBody))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+generateTestToken("1"))

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	mockRepo.AssertExpectations(t)
}

func TestPutPost_WithEmptyFields(t *testing.T) {
	router, mockRepo, _ := setupTest()

	reqBody := dto.PutPostRequest{
		IDUser: "1",
	}

	scheduledTime := time.Now().Add(24 * time.Hour).Round(0)
	existingPost := dto.GetPostResponse{
		Posts: []domain.Post{
			{
				IDPost:      1,
				IDUser:      "1",
				Title:       OriginalTitle,
				Content:     OriginalContent,
				SheduledFor: scheduledTime,
			},
		},
	}

	expectedResponse := dto.PutPostResponse{
		IDPost:    1,
		IDUser:    "1",
		UpdatedAt: time.Now().Round(0),
	}

	mockRepo.On("GetPostByID", mock.Anything, 1, "1").Return(existingPost, nil)
	mockRepo.On("UpdatePostByID", mock.Anything, mock.MatchedBy(func(req dto.PutPostRequest) bool {
		return req.IDUser == "1" &&
			req.Title == OriginalTitle &&
			req.Content == OriginalContent &&
			compareTime(req.SheduledFor, scheduledTime)
	})).Return(expectedResponse, nil)

	jsonBody, _ := json.Marshal(reqBody)
	req, _ := http.NewRequestWithContext(context.Background(), "PUT", "/posts/1", bytes.NewBuffer(jsonBody))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+generateTestToken("1"))

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	mockRepo.AssertExpectations(t)
}

func TestPutPost_InvalidID(t *testing.T) {
	router, mockRepo, _ := setupTest()

	reqBody := dto.PutPostRequest{
		IDUser:  "1",
		Title:   UpdatedTitle,
		Content: UpdatedContent,
	}

	jsonBody, _ := json.Marshal(reqBody)
	req, _ := http.NewRequestWithContext(context.Background(), "PUT", "/posts/invalid", bytes.NewBuffer(jsonBody))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+generateTestToken("1"))

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)

	var response map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, "invalid id", response["error"])

	mockRepo.AssertNotCalled(t, "GetPostByID")
	mockRepo.AssertNotCalled(t, "UpdatePostByID")
}

// Тесты для DeletePost
func TestDeletePost_Success(t *testing.T) {
	router, mockRepo, _ := setupTest()

	reqBody := dto.GetByUserIDRequest{
		IDUser: "1",
	}

	expectedPost := dto.GetPostResponse{
		Posts: []domain.Post{
			{IDPost: 1, IDUser: "1"},
		},
	}

	mockRepo.On("GetPostByID", mock.Anything, 1, "1").Return(expectedPost, nil)
	mockRepo.On("DeletePostByID", mock.Anything, 1).Return(nil)

	jsonBody, _ := json.Marshal(reqBody)
	req, _ := http.NewRequestWithContext(context.Background(), "DELETE", "/posts/1", bytes.NewBuffer(jsonBody))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+generateTestToken("1"))

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusNoContent, w.Code)
	mockRepo.AssertExpectations(t)
}

func TestDeletePost_NotFound(t *testing.T) {
	router, mockRepo, _ := setupTest()

	reqBody := dto.GetByUserIDRequest{
		IDUser: "1",
	}

	mockRepo.On("GetPostByID", mock.Anything, 1, "1").Return(dto.GetPostResponse{}, errors.New("not found"))

	jsonBody, _ := json.Marshal(reqBody)
	req, _ := http.NewRequestWithContext(context.Background(), "DELETE", "/posts/1", bytes.NewBuffer(jsonBody))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+generateTestToken("1"))

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusNotFound, w.Code)
	mockRepo.AssertExpectations(t)
	mockRepo.AssertNotCalled(t, "DeletePostByID")
}

func TestDeletePost_InvalidID(t *testing.T) {
	router, mockRepo, _ := setupTest()

	reqBody := dto.GetByUserIDRequest{
		IDUser: "1",
	}

	jsonBody, _ := json.Marshal(reqBody)
	req, _ := http.NewRequestWithContext(context.Background(), "DELETE", "/posts/invalid", bytes.NewBuffer(jsonBody))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+generateTestToken("1"))

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)

	var response map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, "invalid id", response["error"])

	mockRepo.AssertNotCalled(t, "GetPostByID")
	mockRepo.AssertNotCalled(t, "DeletePostByID")
}

// Тесты для CreatePlatform
func TestCreatePlatform_Success(t *testing.T) {
	router, mockRepo, _ := setupTest()

	reqBody := dto.CreatePlatformRequest{
		IDUser:       "1",
		PlatformName: TestPlatform,
		BotName:      "test_bot",
		Config:       "test_config",
	}

	expectedTime := time.Now().Round(0)
	mockRepo.On("CreatePlatform", mock.Anything, mock.MatchedBy(func(req dto.CreatePlatformRequest) bool {
		return req.IDUser == "1" &&
			req.PlatformName == TestPlatform &&
			req.BotName == "test_bot" &&
			req.Config == "test_config"
	})).Return(1, expectedTime, nil)

	jsonBody, _ := json.Marshal(reqBody)
	req, _ := http.NewRequestWithContext(context.Background(), "POST", "/platforms", bytes.NewBuffer(jsonBody))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+generateTestToken("1"))

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	var response dto.CreatePlatformResponse
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, 1, response.IDPlatform)
	assert.Equal(t, "1", response.IDUser)
	assert.True(t, compareTime(expectedTime, response.CreatedAt))

	mockRepo.AssertExpectations(t)
}

func TestCreatePlatform_ValidationError(t *testing.T) {
	router, mockRepo, _ := setupTest()

	reqBody := dto.CreatePlatformRequest{}

	jsonBody, _ := json.Marshal(reqBody)
	req, _ := http.NewRequestWithContext(context.Background(), "POST", "/platforms", bytes.NewBuffer(jsonBody))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+generateTestToken("1"))

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)
	mockRepo.AssertNotCalled(t, "CreatePlatform")
}

// Тесты для GetPlatforms
func TestGetPlatforms_Success(t *testing.T) {
	router, mockRepo, _ := setupTest()

	reqBody := dto.GetByUserIDRequest{
		IDUser: "1",
	}

	expectedResponse := dto.GetPlatformResponse{
		Platforms: []domain.Platform{
			{
				IDPlatform: 1,
				Name:       "Platform 1",
				APIConfig: map[string]string{
					"bot1": "config1",
				},
				IsActive:  true,
				CreatedAt: time.Now().Round(0),
				UpdatedAt: time.Now().Round(0),
			},
			{
				IDPlatform: 2,
				Name:       "Platform 2",
				APIConfig: map[string]string{
					"bot2": "config2",
				},
				IsActive:  true,
				CreatedAt: time.Now().Round(0),
				UpdatedAt: time.Now().Round(0),
			},
		},
	}

	mockRepo.On("GetPlatform", mock.Anything, "1").Return(expectedResponse, nil)

	jsonBody, _ := json.Marshal(reqBody)
	req, _ := http.NewRequestWithContext(context.Background(), "GET", "/platforms", bytes.NewBuffer(jsonBody))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+generateTestToken("1"))

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	var response dto.GetPlatformResponse
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Len(t, response.Platforms, 2)
	assert.Equal(t, "Platform 1", response.Platforms[0].Name)
	assert.Equal(t, "Platform 2", response.Platforms[1].Name)

	mockRepo.AssertExpectations(t)
}

func TestGetPlatforms_RepositoryError(t *testing.T) {
	router, mockRepo, _ := setupTest()

	reqBody := dto.GetByUserIDRequest{
		IDUser: "1",
	}

	mockRepo.On("GetPlatform", mock.Anything, "1").Return(dto.GetPlatformResponse{}, errors.New("database error"))

	jsonBody, _ := json.Marshal(reqBody)
	req, _ := http.NewRequestWithContext(context.Background(), "GET", "/platforms", bytes.NewBuffer(jsonBody))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+generateTestToken("1"))

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusInternalServerError, w.Code)

	var response map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Contains(t, response["error"], "database error")

	mockRepo.AssertExpectations(t)
}

// Тесты для GetPlatform
func TestGetPlatform_Success(t *testing.T) {
	router, mockRepo, _ := setupTest()

	reqBody := dto.GetByUserIDRequest{
		IDUser: "1",
	}

	expectedPlatform := domain.Platform{
		IDPlatform: 1,
		Name:       TestPlatform,
		APIConfig: map[string]string{
			"bot1": "config1",
		},
		IsActive:  true,
		CreatedAt: time.Now().Round(0),
		UpdatedAt: time.Now().Round(0),
	}

	mockRepo.On("GetPlatformByID", mock.Anything, 1, "1").Return(expectedPlatform, nil)

	jsonBody, _ := json.Marshal(reqBody)
	req, _ := http.NewRequestWithContext(context.Background(), "GET", "/platforms/1", bytes.NewBuffer(jsonBody))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+generateTestToken("1"))

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	var response domain.Platform
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, 1, response.IDPlatform)
	assert.Equal(t, TestPlatform, response.Name)

	mockRepo.AssertExpectations(t)
}

func TestGetPlatform_InvalidID(t *testing.T) {
	router, mockRepo, _ := setupTest()

	reqBody := dto.GetByUserIDRequest{
		IDUser: "1",
	}

	jsonBody, _ := json.Marshal(reqBody)
	req, _ := http.NewRequestWithContext(context.Background(), "GET", "/platforms/invalid", bytes.NewBuffer(jsonBody))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+generateTestToken("1"))

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)

	var response map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, "invalid id", response["error"])

	mockRepo.AssertNotCalled(t, "GetPlatformByID")
}

func TestGetPlatform_NotFound(t *testing.T) {
	router, mockRepo, _ := setupTest()

	reqBody := dto.GetByUserIDRequest{
		IDUser: "1",
	}

	mockRepo.On("GetPlatformByID", mock.Anything, 1, "1").Return(domain.Platform{}, errors.New("not found"))

	jsonBody, _ := json.Marshal(reqBody)
	req, _ := http.NewRequestWithContext(context.Background(), "GET", "/platforms/1", bytes.NewBuffer(jsonBody))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+generateTestToken("1"))

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusNotFound, w.Code)

	var response map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, "platform not found", response["error"])

	mockRepo.AssertExpectations(t)
}

// Тесты для PutPlatform
func TestPutPlatform_Success(t *testing.T) {
	router, mockRepo, _ := setupTest()

	reqBody := dto.PutPlatformRequest{
		IDUser:       "1",
		IDPlatform:   1,
		PlatformName: UpdatedPlatform,
		BotName:      UpdatedBot,
		Config:       UpdatedConfig,
	}

	existingPlatform := domain.Platform{
		IDPlatform: 1,
		Name:       "Old Platform",
		APIConfig: map[string]string{
			"old_bot": "old_config",
		},
		IsActive: true,
	}

	expectedResponse := dto.PutPlatformResponse{
		IDPlatform: 1,
		IDUser:     "1",
		UpdatedAt:  time.Now().Round(0),
	}

	mockRepo.On("GetPlatformByID", mock.Anything, 1, "1").Return(existingPlatform, nil)
	mockRepo.On("UpdatePlatformByID", mock.Anything, mock.MatchedBy(func(req dto.PutPlatformRequest) bool {
		return req.IDUser == "1" &&
			req.IDPlatform == 1 &&
			req.PlatformName == UpdatedPlatform &&
			req.BotName == UpdatedBot &&
			req.Config == UpdatedConfig
	})).Return(expectedResponse, nil)

	jsonBody, _ := json.Marshal(reqBody)
	req, _ := http.NewRequestWithContext(context.Background(), "PUT", "/platforms/1", bytes.NewBuffer(jsonBody))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+generateTestToken("1"))

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	mockRepo.AssertExpectations(t)
}

func TestPutPlatform_InvalidID(t *testing.T) {
	router, mockRepo, _ := setupTest()

	reqBody := dto.PutPlatformRequest{
		IDUser:       "1",
		IDPlatform:   1,
		PlatformName: UpdatedPlatform,
		BotName:      UpdatedBot,
		Config:       UpdatedConfig,
	}

	jsonBody, _ := json.Marshal(reqBody)
	req, _ := http.NewRequestWithContext(context.Background(), "PUT", "/platforms/invalid", bytes.NewBuffer(jsonBody))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+generateTestToken("1"))

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)

	var response map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, "invalid id", response["error"])

	mockRepo.AssertNotCalled(t, "GetPlatformByID")
	mockRepo.AssertNotCalled(t, "UpdatePlatformByID")
}

// Тесты для DeletePlatform
func TestDeletePlatform_Success(t *testing.T) {
	router, mockRepo, _ := setupTest()

	reqBody := dto.GetByUserIDRequest{
		IDUser: "1",
	}

	existingPlatform := domain.Platform{
		IDPlatform: 1,
		Name:       TestPlatform,
	}

	mockRepo.On("GetPlatformByID", mock.Anything, 1, "1").Return(existingPlatform, nil)
	mockRepo.On("DeletePlatformByID", mock.Anything, 1).Return(nil)

	jsonBody, _ := json.Marshal(reqBody)
	req, _ := http.NewRequestWithContext(context.Background(), "DELETE", "/platforms/1", bytes.NewBuffer(jsonBody))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+generateTestToken("1"))

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusNoContent, w.Code)
	mockRepo.AssertExpectations(t)
}

func TestDeletePlatform_NotFound(t *testing.T) {
	router, mockRepo, _ := setupTest()

	reqBody := dto.GetByUserIDRequest{
		IDUser: "1",
	}

	mockRepo.On("GetPlatformByID", mock.Anything, 1, "1").Return(domain.Platform{}, errors.New("not found"))

	jsonBody, _ := json.Marshal(reqBody)
	req, _ := http.NewRequestWithContext(context.Background(), "DELETE", "/platforms/1", bytes.NewBuffer(jsonBody))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+generateTestToken("1"))

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusNotFound, w.Code)
	mockRepo.AssertExpectations(t)
	mockRepo.AssertNotCalled(t, "DeletePlatformByID")
}

func TestDeletePlatform_InvalidID(t *testing.T) {
	router, mockRepo, _ := setupTest()

	reqBody := dto.GetByUserIDRequest{
		IDUser: "1",
	}

	jsonBody, _ := json.Marshal(reqBody)
	req, _ := http.NewRequestWithContext(context.Background(), "DELETE", "/platforms/invalid", bytes.NewBuffer(jsonBody))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+generateTestToken("1"))

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)

	var response map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, "invalid id", response["error"])

	mockRepo.AssertNotCalled(t, "GetPlatformByID")
	mockRepo.AssertNotCalled(t, "DeletePlatformByID")
}

// Тест для NoRoute
func TestNoRoute(t *testing.T) {
	router, _, _ := setupTest()

	req, _ := http.NewRequestWithContext(context.Background(), "GET", "/nonexistent", nil)

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusNotFound, w.Code)

	var response map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, "404 Not Found", response["error"])
	assert.Equal(t, "Not Found", response["message"])
	assert.Equal(t, "/nonexistent", response["path"])
	assert.Equal(t, "GET", response["method"])
}

func stringPtr(s string) *string {
	return &s
}
