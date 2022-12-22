package router

import (
	"embed"
	"github.com/gin-contrib/static"
	"github.com/gin-gonic/gin"
	"message-pusher/common"
	"message-pusher/controller"
	"message-pusher/middleware"
	"net/http"
)

func setWebRouter(router *gin.Engine, buildFS embed.FS, indexPage []byte) {
	router.Use(middleware.GlobalWebRateLimit())
	router.Use(middleware.Cache())
	router.GET("/public/static/:file", controller.GetStaticFile)
	router.GET("/message/:link", controller.RenderMessage)
	router.Use(static.Serve("/", common.EmbedFolder(buildFS, "web/build")))
	router.NoRoute(func(c *gin.Context) {
		c.Data(http.StatusOK, "text/html; charset=utf-8", indexPage)
	})
}
