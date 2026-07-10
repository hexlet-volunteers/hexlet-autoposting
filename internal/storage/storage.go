package repository

import (
	"context"
	"fmt"
	"hexlet/internal/config"
	"net"
	"time"

	"github.com/jackc/pgx/v4/pgxpool"
	"go.uber.org/zap"
)

type DBConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	DBName   string
	SSLMode  string
}

func InitDBConn(ctx context.Context, cfgenv *config.Config, logger *zap.Logger) (dbpool *pgxpool.Pool, err error) {
	config := loadDBConfig(cfgenv)
	if err := waitForDB(ctx, config, logger); err != nil {
		return nil, fmt.Errorf("failed to wait for database: %v", err)
	}
	url := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		config.Host, config.Port, config.User, config.Password, config.DBName, config.SSLMode)
	logger.Info("Connecting to database",
		zap.String("host", config.Host),
		zap.String("port", config.Port),
	)
	cfg, err := pgxpool.ParseConfig(url)
	if err != nil {
		return nil, fmt.Errorf("failed to parse pg config: %v", err)
	}

	cfg.MaxConns = int32(25)
	cfg.MinConns = int32(5)
	cfg.HealthCheckPeriod = 1 * time.Minute
	cfg.MaxConnLifetime = 24 * time.Hour
	cfg.MaxConnIdleTime = 30 * time.Minute
	cfg.ConnConfig.ConnectTimeout = 30 * time.Second
	cfg.ConnConfig.DialFunc = (&net.Dialer{
		KeepAlive: cfg.HealthCheckPeriod,
		Timeout:   cfg.ConnConfig.ConnectTimeout,
	}).DialContext
	for i := 0; i < 10; i++ {
		dbpool, err = pgxpool.ConnectConfig(ctx, cfg)
		if err != nil {
			logger.Error("Failed to connect database",
				zap.Int("attempt", i+1),
				zap.Error(err),
			)
			time.Sleep(2 * time.Second)
			continue
		}

		if err = dbpool.Ping(ctx); err != nil {
			logger.Error("Failed to ping database",
				zap.Int("attempt", i+1),
				zap.Error(err),
			)
			dbpool.Close()
			time.Sleep(2 * time.Second)
			continue
		}
		logger.Info("Database connection established")
		return dbpool, nil
	}

	return nil, fmt.Errorf("failed to connect to database after 10 attempts: %v", err)
}

func waitForDB(ctx context.Context, config DBConfig, logger *zap.Logger) error {
	url := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		config.Host, config.Port, config.User, config.Password, config.DBName, config.SSLMode)
	logger.Info("Waiting for database to be ready...")

	for i := 0; i < 30; i++ {
		cfg, err := pgxpool.ParseConfig(url)
		if err != nil {
			return err
		}

		cfg.ConnConfig.ConnectTimeout = 5 * time.Second

		dbpool, err := pgxpool.ConnectConfig(ctx, cfg)
		if err != nil {
			logger.Error("Database not ready yet",
				zap.Int("attempt", i+1),
				zap.Error(err),
			)
			time.Sleep(2 * time.Second)
			continue
		}

		if err := dbpool.Ping(ctx); err != nil {
			logger.Error("Failed to ping database",
				zap.Int("attempt", i+1),
				zap.Error(err),
			)
			dbpool.Close()
			time.Sleep(2 * time.Second)
			continue
		}

		dbpool.Close()
		logger.Info("Database is ready!")
		return nil
	}

	return fmt.Errorf("database not ready after 30 attempts")
}

func loadDBConfig(cfgenv *config.Config) DBConfig {
	return DBConfig{
		Host:     cfgenv.DBHost,
		Port:     cfgenv.DBPort,
		User:     cfgenv.DBUser,
		Password: cfgenv.DBPassword,
		DBName:   cfgenv.DBName,
		SSLMode:  "disable",
	}
}
