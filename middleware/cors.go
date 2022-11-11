package middleware

import (
	"github.com/gin-gonic/contrib/cors"
	"github.com/gin-gonic/gin"
	"time"
)

func CORS() gin.HandlerFunc {
	config := cors.DefaultConfig()
	config.AllowedHeaders = []string{"Authorization", "Content-Type", "Origin",
		"Connection", "Accept-Encoding", "Accept-Language", "Host"}
	config.AllowedMethods = []string{"GET", "POST", "DELETE", "OPTIONS", "PUT"}
	config.AllowCredentials = true
	config.MaxAge = 12 * time.Hour
	// if you want to allow all origins, comment the following two lines
	config.AllowAllOrigins = false
	config.AllowedOrigins = []string{"https://message-pusher.vercel.app"}
	return cors.New(config)
}
