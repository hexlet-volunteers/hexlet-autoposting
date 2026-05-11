package kafka

import (
	"context"
	"encoding/json"
	"fmt"
	"strconv"
	"time"

	"hexlet/internal/domain"

	"github.com/segmentio/kafka-go"
	"go.uber.org/zap"
)

type Producer struct {
	writer *kafka.Writer
	topic  string
}

func NewProducer(cfg *Config) *Producer {
	writer := &kafka.Writer{
		Addr:         kafka.TCP(cfg.Brokers...),
		Topic:        cfg.Topic,
		Balancer:     &kafka.LeastBytes{},
		BatchTimeout: 10 * time.Millisecond,
		RequiredAcks: kafka.RequireOne,
	}

	return &Producer{
		writer: writer,
		topic:  cfg.Topic,
	}
}

func (p *Producer) SendPublicationEvent(ctx context.Context, event domain.PublicationEvent, logger *zap.Logger) error {
	eventJSON, err := json.Marshal(event)
	if err != nil {
		return fmt.Errorf("failed to marshal event: %w", err)
	}

	message := kafka.Message{
		Key:   []byte(strconv.Itoa(event.PostID)),
		Value: eventJSON,
		Time:  time.Now(),
	}
	err = p.writer.WriteMessages(ctx, message)
	if err != nil {
		return fmt.Errorf("failed to write message to kafka: %w", err)
	}
	logger.Info("Successfully sent publication event to Kafka topic",
		zap.String("topic", p.topic),
		zap.String("eventJSON", string(eventJSON)),
	)
	return nil
}

func (p *Producer) Close() error {
	return p.writer.Close()
}
