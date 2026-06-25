// Package migrator применяет миграции БД (golang-migrate) и вызывается как
// подкоманда основного бинаря: `main migrate <up|down|steps N|force V|version>`.
//
// Подключение берётся из тех же переменных окружения, что и приложение (master-узел):
// MASTER_HOST, MASTER_PORT, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB,
// DB_SSLMODE (по умолчанию disable).
package migrator

import (
	"errors"
	"fmt"
	"log"
	"net"
	"net/url"
	"os"
	"strconv"

	"hexlet/internal/config"
	"hexlet/migrations"

	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/pgx"
	"github.com/golang-migrate/migrate/v4/source/iofs"
)

// Run выполняет команду миграции. args — аргументы после "migrate"
// (up | down | steps N | force V | version).
func Run(args []string) {
	if len(args) < 1 {
		usage()
	}
	cmd := args[0]

	m, err := newMigrator()
	if err != nil {
		log.Fatalf("migrate: %v", err)
	}
	defer m.Close()

	switch cmd {
	case "up":
		err = m.Up()
	case "down":
		err = m.Down()
	case "steps":
		if len(args) < 2 {
			usage()
		}
		n, perr := strconv.Atoi(args[1])
		if perr != nil {
			log.Fatalf("migrate: invalid steps value %q", args[1])
		}
		err = m.Steps(n)
	case "force":
		if len(args) < 2 {
			usage()
		}
		v, perr := strconv.Atoi(args[1])
		if perr != nil {
			log.Fatalf("migrate: invalid version %q", args[1])
		}
		err = m.Force(v)
	case "version":
		v, dirty, verr := m.Version()
		if verr != nil {
			log.Fatalf("migrate: %v", verr)
		}
		fmt.Printf("version=%d dirty=%t\n", v, dirty)
		return
	default:
		usage()
	}

	if err != nil && !errors.Is(err, migrate.ErrNoChange) {
		log.Fatalf("migrate %s: %v", cmd, err)
	}
	log.Printf("migrate %s: ok", cmd)
}

func newMigrator() (*migrate.Migrate, error) {
	cfg, err := config.LoadConfigMaster()
	if err != nil {
		return nil, fmt.Errorf("load config: %w", err)
	}

	sslmode := os.Getenv("DB_SSLMODE")
	if sslmode == "" {
		sslmode = "disable"
	}

	dbURL := url.URL{
		Scheme:   "pgx",
		User:     url.UserPassword(cfg.DBUser, cfg.DBPassword),
		Host:     net.JoinHostPort(cfg.DBHost, cfg.DBPort),
		Path:     "/" + cfg.DBName,
		RawQuery: "sslmode=" + sslmode,
	}

	src, err := iofs.New(migrations.FS, ".")
	if err != nil {
		return nil, fmt.Errorf("load migrations: %w", err)
	}

	m, err := migrate.NewWithSourceInstance("iofs", src, dbURL.String())
	if err != nil {
		return nil, fmt.Errorf("init migrate: %w", err)
	}
	return m, nil
}

func usage() {
	log.Fatalf("usage: main migrate <up|down|steps N|force V|version>")
}
