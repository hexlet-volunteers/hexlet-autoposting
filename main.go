package main

import (
	"context"
	"hexlet/internal/app"
	"hexlet/internal/auth"
	"hexlet/internal/config"
	storage "hexlet/internal/storage"
	"log"

	"github.com/gin-gonic/gin"
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
		log.Fatalf("failed to init logger: %v", err)
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
	a.StartConsumer(logger)

	err = auth.NewAuth()
	if err != nil {
		logger.Fatal("Failed to do auth system:", zap.Error(err))
	}

	a.Routes(r)
	go func() {
		logger.Info("HTTP server starting on :8080")
		if err := r.Run(":8080"); err != nil {
			logger.Error("Error starting server", zap.Error(err))
		}
	}()

	a.WaitForShutdown(logger)
}
