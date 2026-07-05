tidy:
	go mod tidy
	go fmt ./...
	go vet ./...

test:
	go test ./...

lint:
	golangci-lint run

lint-fix:
	golangci-lint run --fix

up:
	docker compose up -d

down:
	docker compose down

clean:
	docker compose down -v

ps:
	docker compose ps

logs:
	docker compose logs -f

logs-postgres:
	docker compose logs -f postgres

logs-kafka:
	docker compose logs -f kafka

postgres:
	docker compose exec postgres psql -U postgres -d social_post_scheduler

kafka-api:
	docker compose exec kafka \
		/opt/kafka/bin/kafka-broker-api-versions.sh \
		--bootstrap-server localhost:9092

kafka-topics:
	docker compose exec kafka \
		/opt/kafka/bin/kafka-topics.sh \
		--bootstrap-server localhost:9092 \
		--list