package main

import (
	"context"
	"hexlet/internal/app"
	"hexlet/internal/auth"
	"hexlet/internal/config"
	"hexlet/internal/migrator"
	storage "hexlet/internal/storage"
	"log"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/segmentio/kafka-go"
	"go.uber.org/zap"
)

// @title           Autoposing API
// @version         1.0
// @description     This is a project of autoposting in Telegramm and VK.

// @host      localhost:8080
// @BasePath  /

// @securityDefinitions.basic  BasicAuth

func main() {
	if len(os.Args) > 1 && os.Args[1] == "migrate" {
		migrator.Run(os.Args[2:])
		return
	}

	r := gin.Default()
	ctx := context.Background()
	mastercfg, err := config.LoadConfigMaster()
	if err != nil {
		log.Fatal("Cannot load master config:", err)
	}

	dbpoolmaster, err := storage.InitDBConn(ctx, mastercfg)
	if err != nil {
		log.Fatalf("failed to init master DB connection: %v", err)
	}
	log.Println("Succes master DB conection")
	defer dbpoolmaster.Close()
	slavecfg, err := config.LoadConfigSlave()
	if err != nil {
		log.Fatal("Cannot load slave config:", err)
	}
	dbpoolslave, err := storage.InitDBConn(ctx, slavecfg)
	if err != nil {
		log.Fatalf("failed to init slave DB connection: %v", err)
	}
	log.Println("Succes slave DB conection")
	defer dbpoolslave.Close()
	logger, err := zap.NewProduction()
	if err != nil {
		log.Fatalf("failed to init logger: %v", err)
	}
	defer logger.Sync()
	a := app.NewApp(ctx, dbpoolmaster, dbpoolslave, logger)
	a.StartScheduler()
	auth.NewAuth()
	go func() {
		time.Sleep(30 * time.Second)
		readerConfig := kafka.ReaderConfig{
			Brokers:     app.GetKafkaBrokers(),
			Topic:       "publications.pending",
			GroupID:     "hexlet-publications-worker",
			MinBytes:    10e3,
			MaxBytes:    10e6,
			MaxWait:     5 * time.Second,
			StartOffset: kafka.FirstOffset,
		}
		reader := kafka.NewReader(readerConfig)
		defer reader.Close()
		log.Println("Kafka consumer started. Waiting for messages...")
		for {
			msg, err := reader.ReadMessage(ctx)
			if err != nil {
				if err == context.Canceled {
					log.Println("Kafka consumer stopped")
					return
				}
				log.Printf("Error reading from Kafka: %v", err)
				time.Sleep(2 * time.Second)
				continue
			}
			log.Printf("Received Kafka message: %s", string(msg.Value))
			a.StartBackgroundWorker(msg)
		}
	}()

	log.Println("Kafka scheduler started")
	a.Routes(r)
	appPort := os.Getenv("APP_PORT")
	if appPort == "" {
		appPort = "8080"
	}
	go func() {
		log.Printf("HTTP server starting on :%s", appPort)
		err := r.Run(":" + appPort)
		if err != nil {
			log.Fatal(err)
		}
	}()
	a.WaitForShutdown()
}
