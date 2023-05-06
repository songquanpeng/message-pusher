package channel

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"message-pusher/model"
	"net/http"
	"strings"
)

type corpMessageRequest struct {
	MessageType string `json:"msgtype"`
	Text        struct {
		Content string `json:"content"`
	} `json:"text"`
	Markdown struct {
		Content string `json:"content"`
	} `json:"markdown"`
	MentionedList []string `json:"mentioned_list"`
}

type corpMessageResponse struct {
	Code    int    `json:"errcode"`
	Message string `json:"errmsg"`
}

func SendCorpMessage(message *model.Message, user *model.User, channel_ *model.Channel) error {
	// https://developer.work.weixin.qq.com/document/path/91770
	messageRequest := corpMessageRequest{
		MessageType: "text",
	}
	if message.Content == "" {
		messageRequest.MessageType = "text"
		messageRequest.Text.Content = message.Description
	} else {
		messageRequest.MessageType = "markdown"
		messageRequest.Markdown.Content = message.Content
	}
	if message.To != "" {
		messageRequest.MentionedList = strings.Split(message.To, "|")
	}
	jsonData, err := json.Marshal(messageRequest)
	if err != nil {
		return err
	}
	resp, err := http.Post(fmt.Sprintf("%s", channel_.URL), "application/json",
		bytes.NewBuffer(jsonData))
	if err != nil {
		return err
	}
	var res corpMessageResponse
	err = json.NewDecoder(resp.Body).Decode(&res)
	if err != nil {
		return err
	}
	if res.Code != 0 {
		return errors.New(res.Message)
	}
	return nil
}
