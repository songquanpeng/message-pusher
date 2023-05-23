package controller

import (
	"message-pusher/channel"
	"message-pusher/common"
	"message-pusher/model"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func GetAllChannels(c *gin.Context) {
	if c.Query("brief") != "" {
		GetBriefChannels(c)
		return
	}
	userId := c.GetInt("id")
	p, _ := strconv.Atoi(c.Query("p"))
	if p < 0 {
		p = 0
	}
	channels, err := model.GetChannelsByUserId(userId, p*common.ItemsPerPage, common.ItemsPerPage)
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
		"data":    channels,
	})
	return
}

func GetBriefChannels(c *gin.Context) {
	userId := c.GetInt("id")
	channels, err := model.GetBriefChannelsByUserId(userId)
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
		"data":    channels,
	})
	return
}

func SearchChannels(c *gin.Context) {
	userId := c.GetInt("id")
	keyword := c.Query("keyword")
	channels, err := model.SearchChannels(userId, keyword)
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
		"data":    channels,
	})
	return
}

func GetChannel(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	userId := c.GetInt("id")
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}
	channel_, err := model.GetChannelById(id, userId, false)
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
		"data":    channel_,
	})
	return
}

func AddChannel(c *gin.Context) {
	channel_ := model.Channel{}
	err := c.ShouldBindJSON(&channel_)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}
	if len(channel_.Name) == 0 || len(channel_.Name) > 20 {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "通道名称长度必须在1-20之间",
		})
		return
	}
	if channel_.Name == "email" {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "不能使用系统保留名称",
		})
		return
	}
	cleanChannel := model.Channel{
		Type:        channel_.Type,
		UserId:      c.GetInt("id"),
		Name:        channel_.Name,
		Description: channel_.Description,
		Status:      common.ChannelStatusEnabled,
		Secret:      channel_.Secret,
		AppId:       channel_.AppId,
		AccountId:   channel_.AccountId,
		URL:         channel_.URL,
		Other:       channel_.Other,
		CreatedTime: common.GetTimestamp(),
	}
	err = cleanChannel.Insert()
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}
	channel.TokenStoreAddChannel(&cleanChannel)
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
	})
	return
}

func DeleteChannel(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	userId := c.GetInt("id")
	channel_, err := model.DeleteChannelById(id, userId)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}
	channel.TokenStoreRemoveChannel(channel_)
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
	})
	return
}

func UpdateChannel(c *gin.Context) {
	userId := c.GetInt("id")
	statusOnly := c.Query("status_only")
	channel_ := model.Channel{}
	err := c.ShouldBindJSON(&channel_)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}
	oldChannel, err := model.GetChannelById(channel_.Id, userId, true)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}
	cleanChannel := *oldChannel
	if statusOnly != "" {
		cleanChannel.Status = channel_.Status
	} else {
		// If you add more fields, please also update channel_.Update()
		cleanChannel.Type = channel_.Type
		cleanChannel.Name = channel_.Name
		cleanChannel.Description = channel_.Description
		if channel_.Secret != "" {
			cleanChannel.Secret = channel_.Secret
		}
		cleanChannel.AppId = channel_.AppId
		cleanChannel.AccountId = channel_.AccountId
		cleanChannel.URL = channel_.URL
		cleanChannel.Other = channel_.Other
	}
	err = cleanChannel.Update()
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}
	channel.TokenStoreUpdateChannel(&cleanChannel, oldChannel)
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data":    cleanChannel,
	})
	return
}
