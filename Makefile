-include .env
export

.PHONY: init up down clean ps logs psql topics docs

init:
ifeq (,$(wildcard .env))
	cp .env.example .env
	@echo "Created .env from .env.example - fill in the values."
else
	@echo ".env already exists - skipping."
endif

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

psql:
	docker compose exec master psql -U $(POSTGRES_USER) -d $(POSTGRES_DB)

topics:
	docker compose exec kafka kafka-topics --bootstrap-server localhost:$(KAFKA_PORT) --list

docs:
	cd application && go run github.com/swaggo/swag/cmd/swag@v1.16.6 init -g main.go -o docs
