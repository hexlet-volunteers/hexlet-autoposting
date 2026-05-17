package main

import (
	"context"
	"hexlet/internal/app"
	"hexlet/internal/auth"
	"hexlet/internal/config"
	storage "hexlet/internal/storage"
	"log"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/segmentio/kafka-go"
	"go.uber.org/zap"
)

// @title           Autoposting API
// @version         1.0
// @description     This is a project of autoposting in Telegramm and VK.

// @host      localhost:8080
// @BasePath  /

// @securityDefinitions.basic  BasicAuth

func main() {

	r := gin.Default()
	ctx := context.Background()
	logger, err := zap.NewProduction()
	if err != nil {
		log.Fatalf("failed to init logger: %v", err) // не знаю как правильно сделать если логер не смог запуститься
	}
	defer func() { _ = logger.Sync() }()
	logger.Info("Logger configured successfully")
	mastercfg, err := config.LoadConfigMaster()
	if err != nil {
		logger.Fatal("Cannot load master config:", zap.Error(err))
	}
	dbpoolmaster, err := storage.InitDBConn(ctx, mastercfg, logger)
	if err != nil {
		logger.Fatal("Failed to init master DB connection:", zap.Error(err))
	}
	logger.Info("Succes master DB conection")
	defer dbpoolmaster.Close()
	slavecfg, err := config.LoadConfigSlave()
	if err != nil {
		logger.Fatal("Cannot load slave config:", zap.Error(err))
	}
	dbpoolslave, err := storage.InitDBConn(ctx, slavecfg, logger)
	if err != nil {
		logger.Fatal("Failed to init slave DB connection:", zap.Error(err))
	}
	logger.Info("Succes slave DB conection")
	defer dbpoolslave.Close()

	a := app.NewApp(ctx, dbpoolmaster, dbpoolslave, logger)
	a.StartScheduler(logger)
	err = auth.NewAuth()
	if err != nil {
		logger.Fatal("Failed to do auth system:", zap.Error(err))
	}
	go func() {
		time.Sleep(30 * time.Second)
		readerConfig := kafka.ReaderConfig{
			Brokers:     []string{"kafka:9092"},
			Topic:       "publications.pending",
			GroupID:     "hexlet-publications-worker",
			MinBytes:    10e3,
			MaxBytes:    10e6,
			MaxWait:     5 * time.Second,
			StartOffset: kafka.FirstOffset,
		}
		reader := kafka.NewReader(readerConfig)
		defer reader.Close()
		logger.Info("Kafka consumer started. Waiting for messages...")
		for {
			msg, err := reader.ReadMessage(ctx)
			if err != nil {
				if err == context.Canceled {
					logger.Info("Kafka consumer stopped")
					return
				}
				logger.Error("Error reading from Kafka: %v", zap.Error(err))
				time.Sleep(2 * time.Second)
				continue
			}
			logger.Info("Received Kafka message", zap.String("payload", string(msg.Value)))
			a.StartBackgroundWorker(ctx, msg, logger)
		}
	}()
	logger.Info("Kafka scheduler started")
	a.Routes(r)
	go func() {
		logger.Info("HTTP server starting on :8080")
		err := r.Run(":8080")
		if err != nil {
			logger.Error("Error starting server: %v", zap.Error(err))
		}
	}()
	a.WaitForShutdown(logger)
}
