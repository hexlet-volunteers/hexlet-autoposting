package app

import (
	"context"
	"encoding/json"
	"hexlet/internal/domain"
	"hexlet/internal/handler" //docker-compose logs hexlet-project -f
	"hexlet/internal/kafka"   //docker-compose up -d --build
	"hexlet/internal/repository"
	"hexlet/internal/service"
	"net/http"
	"net/url"
	"os"
	"os/signal"
	"strings"
	"sync"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	tgbotapi "github.com/go-telegram-bot-api/telegram-bot-api/v5"
	"github.com/jackc/pgx/v4/pgxpool"
	kf "github.com/segmentio/kafka-go"
	"go.uber.org/zap"
)

type App struct {
	Ctx       context.Context
	Repo      *repository.Repository
	Handler   *handler.App
	Scheduler *service.SchedulerService
	Counter   int
	Wg        sync.WaitGroup
	Cancel    context.CancelFunc
}

func NewApp(ctx context.Context, masterdbpool *pgxpool.Pool, slavedbpool *pgxpool.Pool, logger *zap.Logger) *App {
	repo := repository.NewRepository(masterdbpool, slavedbpool, logger)
	handlerApp := &handler.App{
		Ctx:  ctx,
		Repo: repo,
	}
	var scheduler *service.SchedulerService
	kafkaBrokers := getKafkaBrokers()

	if len(kafkaBrokers) > 0 {
		kafkaConfig := kafka.NewConfig(
			kafkaBrokers,
			"publications.pending",
		)
		kafkaProducer := kafka.NewProducer(kafkaConfig)
		scheduler = service.NewSchedulerService(
			repo,
			kafkaProducer,
			1*time.Minute,
			100,
		)
	}
	_, cancel := context.WithCancel(context.Background())

	return &App{
		Ctx:       ctx,
		Repo:      repo,
		Handler:   handlerApp,
		Scheduler: scheduler,
		Cancel:    cancel,
		Counter:   1,
	}
}

func (a *App) Routes(r *gin.Engine) {
	a.Handler.Routes(r)
}

func (a *App) StartScheduler(logger *zap.Logger) {
	if a.Scheduler != nil {
		go a.Scheduler.Start(a.Ctx, logger)
		logger.Info("Kafka scheduler started")
	} else {
		logger.Info("Kafka scheduler not configured")
	}
}

func getKafkaBrokers() []string {
	brokersEnv := os.Getenv("KAFKA_BROKERS")
	if brokersEnv == "" {
		return []string{"localhost:29092"}
	}

	brokers := strings.Split(brokersEnv, ",")
	for i, broker := range brokers {
		brokers[i] = strings.TrimSpace(broker)
	}

	return brokers
}

func (a *App) StartBackgroundWorker(msg kf.Message, logger *zap.Logger) {
	a.Wg.Add(1)
	go a.backgroundWorker(msg, logger)
}

func (a *App) backgroundWorker(msg kf.Message, logger *zap.Logger) {
	defer a.Wg.Done()

	ticker := time.NewTicker(10 * time.Second)
	defer ticker.Stop()

	logger.Info("Worker started")

	select {
	case <-a.Ctx.Done():
		logger.Info("Worker stoped")
		return
	case <-ticker.C:
		a.proccesProcessing(msg, logger)
	}
}

func (a *App) proccesProcessing(msg kf.Message, logger *zap.Logger) {
	value := string(msg.Value)
	var msg1 domain.PublicationEvent
	err := json.Unmarshal([]byte(value), &msg1)
	if err != nil {
		logger.Error("Failed to unmarshal msg", zap.Error(err))
		return
	}
	message, err3 := a.Repo.GetTitleANDContent(a.Ctx, msg1.PostID)
	if err3 != nil {
		logger.Error("Failed to get title and content",
			zap.String("user_id", msg1.UserID),
			zap.Error(err3),
		)
		return
	}
	text := message.Title + "\n" + message.Content
	platformTG, err2 := a.Repo.GetPlatformsByUserID(a.Ctx, "Telegram", msg1.UserID)
	if err2 != nil {
		logger.Error("Failed to get platform telegramm",
			zap.String("user_id", msg1.UserID),
			zap.Error(err2),
		)
	} else {
		for chatID, botToken := range platformTG.APIConfig {
			err := SentToTelegram(chatID, botToken, text)
			if err != nil {
				err1 := a.Repo.ErrorMessage(a.Ctx, msg1.DestinationID, err)
				if err1 != nil {
					logger.Error("Failed to publicate telegramm post",
						zap.String("user_id", msg1.UserID),
						zap.Error(err1),
					)
				}
			}
		}
	}
	platformVK, err2 := a.Repo.GetPlatformsByUserID(a.Ctx, "VK", msg1.UserID)
	if err2 != nil {
		logger.Error("Failed to get platform VK",
			zap.String("user_id", msg1.UserID),
			zap.Error(err2),
		)
	} else {
		for groupID, token := range platformVK.APIConfig {
			err := SentToVK(groupID, token, text)
			if err != nil {
				err1 := a.Repo.ErrorMessage(a.Ctx, msg1.DestinationID, err)
				if err1 != nil {
					logger.Error("Failed to publicate telegramm post",
						zap.String("user_id", msg1.UserID),
						zap.Error(err1),
					)
				}
			}
		}
	}
	err4 := a.Repo.MarkAsSent(a.Ctx, msg1.DestinationID)
	if err4 != nil {
		logger.Error("Failed to mark post as sent",
			zap.String("user_id", msg1.UserID),
			zap.Error(err4),
		)
	}
}

func (a *App) WaitForShutdown(logger *zap.Logger) {
	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM)
	<-stop
	logger.Info("Shutdown")
	a.Cancel()
	a.Wg.Wait()
	logger.Info("Shutdown complete")
}

func SentToTelegram(chatID string, botToken string, text string) error {
	bot, err := tgbotapi.NewBotAPI(botToken)
	if err != nil {
		return err
	}
	msg := tgbotapi.NewMessageToChannel(chatID, text)
	_, err = bot.Send(msg)
	if err != nil {
		return err
	}
	return nil
}

func SentToVK(groupID string, token string, text string) error {
	apiURL := "https://api.vk.com/method/wall.post"
	params := url.Values{}
	params.Add("owner_id", groupID)
	params.Add("message", text)
	params.Add("access_token", token)
	params.Add("v", "5.131")
	resp, err := http.PostForm(apiURL, params)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	return nil
}
