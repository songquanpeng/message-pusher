package main

import (
	"embed"
	"github.com/gin-contrib/sessions"
	"github.com/gin-contrib/sessions/cookie"
	"github.com/gin-contrib/sessions/redis"
	"github.com/gin-gonic/gin"
	"log"
	"message-pusher/common"
	"message-pusher/middleware"
	"message-pusher/model"
	"message-pusher/router"
	"os"
	"strconv"
)

//go:embed web/build
var buildFS embed.FS

//go:embed web/build/index.html
var indexPage []byte

func main() {
	common.SetupGinLog()
	common.SysLog("system started")
	if os.Getenv("GIN_MODE") != "debug" {
		gin.SetMode(gin.ReleaseMode)
	}
	// Initialize SQL Database
	err := model.InitDB()
	if err != nil {
		common.FatalLog(err)
	}
	defer func() {
		err := model.CloseDB()
		if err != nil {
			common.FatalLog(err)
		}
	}()

	// Initialize Redis
	err = common.InitRedisClient()
	if err != nil {
		common.FatalLog(err)
	}

	// Initialize options
	model.InitOptionMap()

	// Initialize HTTP server
	server := gin.Default()
	server.Use(middleware.CORS())

	// Initialize session store
	if common.RedisEnabled {
		opt := common.ParseRedisOption()
		store, _ := redis.NewStore(opt.MinIdleConns, opt.Network, opt.Addr, opt.Password, []byte(common.SessionSecret))
		server.Use(sessions.Sessions("session", store))
	} else {
		store := cookie.NewStore([]byte(common.SessionSecret))
		server.Use(sessions.Sessions("session", store))
	}

	router.SetRouter(server, buildFS, indexPage)
	var port = os.Getenv("PORT")
	if port == "" {
		port = strconv.Itoa(*common.Port)
	}
	//if *common.Host == "localhost" {
	//	ip := common.GetIp()
	//	if ip != "" {
	//		*common.Host = ip
	//	}
	//}
	//serverUrl := "http://" + *common.Host + ":" + port + "/"
	//if !*common.NoBrowser {
	//	common.OpenBrowser(serverUrl)
	//}
	err = server.Run(":" + port)
	if err != nil {
		log.Println(err)
	}
}
