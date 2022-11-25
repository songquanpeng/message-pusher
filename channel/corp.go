package channel

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"message-pusher/model"
	"net/http"
)

type corpMessageRequest struct {
	MessageType string `json:"msgtype"`
	Text        struct {
		Content string `json:"content"`
	} `json:"text"`
	Markdown struct {
		Content string `json:"content"`
	} `json:"markdown"`
}

type corpMessageResponse struct {
	Code    int    `json:"errcode"`
	Message string `json:"errmsg"`
}

func SendCorpMessage(message *Message, user *model.User) error {
	if user.CorpWebhookURL == "" {
		return errors.New("未配置企业微信群机器人消息推送方式")
	}
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

	jsonData, err := json.Marshal(messageRequest)
	if err != nil {
		return err
	}
	resp, err := http.Post(fmt.Sprintf("%s", user.CorpWebhookURL), "application/json",
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
