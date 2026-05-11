package service

import (
	"context"
	"fmt"
	"time"

	"hexlet/internal/domain"
	"hexlet/internal/kafka"
	"hexlet/internal/repository"

	"go.uber.org/zap"
)

type SchedulerService struct {
	repo      *repository.Repository
	kafkaProd *kafka.Producer
	interval  time.Duration
	batchSize int
}

func NewSchedulerService(
	repo *repository.Repository,
	kafkaProd *kafka.Producer,
	interval time.Duration,
	batchSize int,
) *SchedulerService {
	return &SchedulerService{
		repo:      repo,
		kafkaProd: kafkaProd,
		interval:  interval,
		batchSize: batchSize,
	}
}

func (s *SchedulerService) Start(ctx context.Context, logger *zap.Logger) {
	ticker := time.NewTicker(s.interval)
	defer ticker.Stop()
	logger.Info("Scheduler started with interval:", zap.Duration("interval", s.interval))
	s.processScheduledPublications(ctx, logger)

	for {
		select {
		case <-ticker.C:
			s.processScheduledPublications(ctx, logger)
		case <-ctx.Done():
			logger.Info("Scheduler stopped")
			return
		}
	}
}

func (s *SchedulerService) processScheduledPublications(ctx context.Context, logger *zap.Logger) {
	logger.Info("Checking for scheduled publications...")

	publications, err := s.repo.GetReadyForPublication(ctx, s.batchSize)
	if err != nil {
		logger.Error("Error getting scheduled publications:", zap.Error(err))
		return
	}

	if len(publications) == 0 {
		logger.Info("No scheduled publications found")
		return
	}

	logger.Info("Found scheduled publications to process", zap.Int("quantity", len(publications)))

	successfulCount := 0

	for _, pub := range publications {
		if err := s.processPublication(ctx, pub, logger); err != nil {
			logger.Error("Error processing publication:", zap.Int("id_destination", pub.ID_destination), zap.Error(err))
			continue
		}
		successfulCount++
	}
	logger.Info("Successfully processed publications", zap.Int("quantity", successfulCount))
}

func (s *SchedulerService) processPublication(ctx context.Context, pub domain.ScheduledPublication, logger *zap.Logger) error {
	event := domain.PublicationEvent{
		DestinationID: pub.ID_destination,
		PostID:        pub.ID_post,
		PlatformID:    pub.ID_platform,
		UserID:        pub.ID_user,
	}
	if err := s.kafkaProd.SendPublicationEvent(ctx, event,logger); err != nil {
		return fmt.Errorf("failed to send event to kafka: %w", err)
	}
	logger.Info("Publication sent to Kafka",
		zap.Int("quantity", pub.ID_destination),
		zap.Int("quantity", pub.ID_post),
		zap.Int("quantity", pub.ID_platform),
	)
	return nil
}
