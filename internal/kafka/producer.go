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

// Producer представляет продюсер для отправки сообщений о публикациях в топик Kafka.
type Producer struct {
	writer *kafka.Writer
	topic  string
}

// NewProducer создаёт и инициализирует новый экземпляр Producer с заданной конфигурацией.
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

// SendPublicationEvent сериализует событие публикации в JSON и отправляет его в Kafka.
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

// Close закрывает соединение продюсера с Kafka и освобождает ресурсы.
func (p *Producer) Close() error {
	return p.writer.Close()
}
