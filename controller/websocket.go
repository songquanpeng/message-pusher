package controller

import (
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"message-pusher/channel"
	"message-pusher/model"
	"net/http"
)

var upgrader = websocket.Upgrader{} // use default options

func RegisterClient(c *gin.Context) {
	secret := c.Query("secret")
	if secret == "" {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "secret 为空",
		})
		return
	}
	user := model.User{Username: c.Param("username")}
	err := user.FillUserByUsername()
	if secret != user.ClientSecret {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "用户名与密钥不匹配",
		})
		return
	}
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}
	channel.RegisterClient(user.Id, conn)
	return
}
