FROM golang:1.24.0-alpine AS builder

WORKDIR /app

COPY application/go.mod application/go.sum ./
RUN go mod download

COPY application/ .

# Статический бинарь, со стрипом отладочной инфы и без путей сборки.
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o main .

FROM alpine:3.21

RUN apk --no-cache add ca-certificates \
 && adduser -D -u 10001 app

WORKDIR /home/app
COPY --from=builder /app/main .

USER app
EXPOSE 8080

CMD ["./main"]
