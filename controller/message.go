package controller

import (
	"encoding/json"
	"fmt"
	"github.com/gin-gonic/gin"
	"message-pusher/channel"
	"message-pusher/common"
	"message-pusher/model"
	"net/http"
	"strconv"
	"time"
)

func GetPushMessage(c *gin.Context) {
	message := model.Message{
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
	message := model.Message{
		Title:       c.PostForm("title"),
		Description: c.PostForm("description"),
		Content:     c.PostForm("content"),
		URL:         c.PostForm("url"),
		Channel:     c.PostForm("channel"),
		Token:       c.PostForm("token"),
		Desp:        c.PostForm("desp"),
	}
	if message == (model.Message{}) {
		// Looks like the user is using JSON
		err := json.NewDecoder(c.Request.Body).Decode(&message)
		if err != nil {
			c.JSON(http.StatusOK, gin.H{
				"success": false,
				"message": "无法解析请求体，请检查其是否为合法 JSON",
			})
			return
		}
	}
	if message.Description == "" {
		message.Description = message.Desp
	}
	pushMessageHelper(c, &message)
}

func pushMessageHelper(c *gin.Context, message *model.Message) {
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
	link := "unsaved"
	if common.MessagePersistenceEnabled {
		err = message.UpdateAndInsert(user.Id)
		if err != nil {
			c.JSON(http.StatusOK, gin.H{
				"success": false,
				"message": err.Error(),
			})
			return
		}
		link = message.Link
	}
	if message.URL == "" {
		message.URL = fmt.Sprintf("%s/message/%s", common.ServerAddress, link)
	}
	err = channel.SendMessage(message, &user)
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

func GetStaticFile(c *gin.Context) {
	path := c.Param("file")
	c.FileFromFS("public/static/"+path, http.FS(common.FS))
}

func RenderMessage(c *gin.Context) {
	if !common.MessageRenderEnabled {
		c.HTML(http.StatusOK, "message.html", gin.H{
			"title":       "无法渲染",
			"time":        time.Now().Format("2006-01-02 15:04:05"),
			"description": "超级管理员禁用了消息渲染",
			"content":     "很抱歉，您所使用的消息推送服务的管理员禁用了消息渲染功能，因此您的消息无法渲染。",
		})
		return
	}
	link := c.Param("link")
	if link == "unsaved" {
		c.HTML(http.StatusOK, "message.html", gin.H{
			"title":       "无法渲染",
			"time":        time.Now().Format("2006-01-02 15:04:05"),
			"description": "超级管理员禁用了消息持久化",
			"content":     "很抱歉，您所使用的消息推送服务的管理员禁用了消息持久化功能，您的消息并没有存储到数据库中，因此无法渲染。",
		})
		return
	}
	message, err := model.GetMessageByLink(link)
	if err != nil {
		c.Status(http.StatusNotFound)
		return
	}
	if message.Description != "" {
		message.Description, err = common.Markdown2HTML(message.Description)
		if err != nil {
			common.SysLog(err.Error())
		}
	}
	if message.Content != "" {
		message.HTMLContent, err = common.Markdown2HTML(message.Content)
		if err != nil {
			common.SysLog(err.Error())
		}
	}
	c.HTML(http.StatusOK, "message.html", gin.H{
		"title":       message.Title,
		"time":        time.Unix(message.Timestamp, 0).Format("2006-01-02 15:04:05"),
		"description": message.Description,
		"content":     message.HTMLContent,
	})
	return
}

func GetUserMessages(c *gin.Context) {
	userId := c.GetInt("id")
	p, _ := strconv.Atoi(c.Query("p"))
	if p < 0 {
		p = 0
	}
	messages, err := model.GetMessagesByUserId(userId, p*common.ItemsPerPage, common.ItemsPerPage)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data":    messages,
	})
	return
}

func GetMessage(c *gin.Context) {
	messageId, _ := strconv.Atoi(c.Param("id"))
	userId := c.GetInt("id")
	message, err := model.GetMessageById(messageId, userId)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data":    message,
	})
	return
}

func DeleteMessage(c *gin.Context) {
	messageId, _ := strconv.Atoi(c.Param("id"))
	userId := c.GetInt("id")
	err := model.DeleteMessageById(messageId, userId)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
	})
	return
}

func DeleteAllMessages(c *gin.Context) {
	err := model.DeleteAllMessages()
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
	})
	return
}
