package router

import (
	"embed"
	"github.com/gin-gonic/contrib/static"
	"github.com/gin-gonic/gin"
	"message-pusher/common"
	"message-pusher/middleware"
	"net/http"
)

func setWebRouter(router *gin.Engine, buildFS embed.FS, indexPage []byte) {
	router.Use(middleware.GlobalWebRateLimit())
	router.Use(static.Serve("/", common.EmbedFolder(buildFS, "web/build")))
	router.NoRoute(func(c *gin.Context) {
		c.Data(http.StatusOK, "text/html; charset=utf-8", indexPage)
	})
}
