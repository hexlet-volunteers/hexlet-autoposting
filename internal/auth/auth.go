package auth

import (
	"errors"
	"net/http"
	"os"

	"github.com/gorilla/sessions"
	"github.com/markbates/goth"
	"github.com/markbates/goth/gothic"
	"github.com/markbates/goth/providers/google"
)

const (
	key    = "randomString"
	MaxAge = 86400
	IsProd = false
)

func NewAuth() error {
	store := sessions.NewCookieStore([]byte(key))
	store.MaxAge(MaxAge)
	store.Options.Path = "/"
	store.Options.HttpOnly = true
	store.Options.Secure = IsProd
	store.Options.SameSite = http.SameSiteLaxMode
	gothic.Store = store
	key := getEnv("GOOGLE_KEY")
	secret := getEnv("GOOGLE_SECRET")
	if key == " " {
		return errors.New("Can not read GOOGLE_KEY")
	}
	if secret == " " {
		return errors.New("Can not read GOOGLE_SECRET")
	}
	goth.UseProviders(
		google.New(key, secret, "http://localhost:8080/auth/google/callback"),
	)
	return nil
}

func getEnv(key string) string {
	value, exists := os.LookupEnv(key)
	if !exists || value == "" {
		return " "
	}
	return value
}
