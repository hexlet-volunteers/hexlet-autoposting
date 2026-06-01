# Hexlet Autoposting

Service for posting in social networks.

## Local environment

The project uses Docker Compose to run local infrastructure:

- PostgreSQL 16 for storing application data
- Apache Kafka 3.9.1 as a message broker without a separate ZooKeeper service

## Docker Compose commands

Start the services:

```bash
make up
```

Check container status:

```bash
make ps
```

Both services should have the `healthy` status.

Stop the services:

```bash
make down
```

Stop the services and remove volumes:

```bash
make clean
```

After `make clean`, the next startup creates a clean environment without data from the previous run.

## PostgreSQL

Connect to PostgreSQL:

```bash
make postgres
```

The connection uses the database credentials from `.env`.

## Kafka

Check broker availability:

```bash
make kafka-api
```

List Kafka topics:

```bash
make kafka-topics
```

An empty output from `make kafka-topics` means that no topics have been created yet. If the command finishes without an error, Kafka is working.

## Logs

Show logs from all services:

```bash
make logs
```

Show PostgreSQL logs:

```bash
make logs-postgres
```

Show Kafka logs:

```bash
make logs-kafka
```

## Go commands

Update dependencies, format code, and run `go vet`:

```bash
make tidy
```

Run tests:

```bash
make test
```

Run the linter:

```bash
make lint
```

Run the linter with automatic fixes:

```bash
make lint-fix
```
