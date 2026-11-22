package kafka

// Config представляет конфигурацию подключения к Kafka.
type Config struct {
	Brokers []string `json:"brokers"`
	Topic   string   `json:"topic"`
}

// NewConfig создаёт и возвращает новый экземпляр конфигурации Kafka.
func NewConfig(brokers []string, topic string) *Config {
	return &Config{
		Brokers: brokers,
		Topic:   topic,
	}
}
