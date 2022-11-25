package controller

import (
	"encoding/json"
	"github.com/gin-gonic/gin"
	"message-pusher/channel"
	"message-pusher/common"
	"message-pusher/model"
	"net/http"
)

func GetPushMessage(c *gin.Context) {
	message := channel.Message{
		Title:       c.Query("title"),
		Description: c.Query("description"),
		Content:     c.Query("content"),
		URL:         c.Query("url"),
		Channel:     c.Query("channel"),
		Token:       c.Query("token"),
	}
	if message.Description == "" {
		// Keep compatible with ServerChan
		message.Description = c.Query("desp")
	}
	if message.Channel == "" {
		// Keep compatible with old version
		message.Channel = c.Query("type")
	}
	pushMessageHelper(c, &message)
}

func PostPushMessage(c *gin.Context) {
	message := channel.Message{}
	err := json.NewDecoder(c.Request.Body).Decode(&message)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "无法解析请求体，请检查其是否为合法 JSON",
		})
		return
	}
	pushMessageHelper(c, &message)
}

func pushMessageHelper(c *gin.Context, message *channel.Message) {
	user := model.User{Username: c.Param("username")}
	err := user.FillUserByUsername()
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}
	if user.Status == common.UserStatusNonExisted {
		c.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"message": "用户不存在",
		})
		return
	}
	if user.Status == common.UserStatusDisabled {
		c.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"message": "用户已被封禁",
		})
		return
	}
	if user.Token != "" && user.Token != " " {
		if message.Token == "" {
			message.Token = c.Request.Header.Get("Authorization")
			if message.Token == "" {
				c.JSON(http.StatusForbidden, gin.H{
					"success": false,
					"message": "token 为空",
				})
				return
			}
		}
		if user.Token != message.Token {
			c.JSON(http.StatusForbidden, gin.H{
				"success": false,
				"message": "无效的 token",
			})
			return
		}
	}
	if message.Title == "" {
		message.Title = common.SystemName
	}
	if message.Channel == "" {
		message.Channel = user.Channel
		if message.Channel == "" {
			message.Channel = channel.TypeEmail
		}
	}
	err = message.Send(&user)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "ok",
	})
	return
}
