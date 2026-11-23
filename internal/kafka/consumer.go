package kafka

import (
	"context"
	"errors"
	"time"

	"github.com/segmentio/kafka-go"
	"go.uber.org/zap"
)

// MessageHandler описывает функцию обработки входящего сообщения из Kafka.
type MessageHandler func(ctx context.Context, msg kafka.Message, logger *zap.Logger)

// Consumer инкапсулирует чтение сообщений из топика Kafka.
type Consumer struct {
	reader  *kafka.Reader
	handler MessageHandler
	logger  *zap.Logger
}

// NewConsumer инициализирует Kafka-консьюмер с заданными параметрами.
func NewConsumer(brokers []string, topic, groupID string, handler MessageHandler, logger *zap.Logger) *Consumer {
	readerConfig := kafka.ReaderConfig{
		Brokers:     brokers,
		Topic:       topic,
		GroupID:     groupID,
		MinBytes:    10e3,
		MaxBytes:    10e6,
		MaxWait:     5 * time.Second,
		StartOffset: kafka.FirstOffset,
	}

	return &Consumer{
		reader:  kafka.NewReader(readerConfig),
		handler: handler,
		logger:  logger,
	}
}

// Run запускает цикл чтения сообщений до отмены контекста.
func (c *Consumer) Run(ctx context.Context) {
	defer func() {
		if err := c.reader.Close(); err != nil {
			c.logger.Error("Failed to close Kafka reader", zap.Error(err))
		}
	}()

	c.logger.Info("Kafka consumer started. Waiting for messages...")

	for {
		msg, err := c.reader.ReadMessage(ctx)
		if err != nil {
			if errors.Is(err, context.Canceled) || errors.Is(err, context.DeadlineExceeded) {
				c.logger.Info("Kafka consumer stopped")
				return
			}
			c.logger.Error("Error reading from Kafka", zap.Error(err))

			select {
			case <-ctx.Done():
				c.logger.Info("Kafka consumer stopped during retry backoff")
				return
			case <-time.After(2 * time.Second):
				continue
			}
		}

		c.logger.Info("Received Kafka message", zap.String("payload", string(msg.Value)))
		c.handler(ctx, msg, c.logger)
	}
}
