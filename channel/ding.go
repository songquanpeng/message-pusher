package channel

import (
	"bytes"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"message-pusher/model"
	"net/http"
	"net/url"
	"time"
)

type dingMessageRequest struct {
	MessageType string `json:"msgtype"`
	Text        struct {
		Content string `json:"content"`
	} `json:"text"`
	Markdown struct {
		Title string `json:"title"`
		Text  string `json:"text"`
	} `json:"markdown"`
}

type dingMessageResponse struct {
	Code    int    `json:"errcode"`
	Message string `json:"errmsg"`
}

func SendDingMessage(message *model.Message, user *model.User) error {
	if user.DingWebhookURL == "" {
		return errors.New("未配置钉钉群机器人消息推送方式")
	}
	messageRequest := dingMessageRequest{
		MessageType: "text",
	}
	if message.Content == "" {
		messageRequest.MessageType = "text"
		messageRequest.Text.Content = message.Description
	} else {
		messageRequest.MessageType = "markdown"
		messageRequest.Markdown.Title = message.Title
		messageRequest.Markdown.Text = message.Content
	}

	timestamp := time.Now().UnixMilli()
	sign, err := dingSign(user.DingWebhookSecret, timestamp)
	if err != nil {
		return err
	}
	jsonData, err := json.Marshal(messageRequest)
	if err != nil {
		return err
	}
	resp, err := http.Post(fmt.Sprintf("%s&timestamp=%d&sign=%s", user.DingWebhookURL, timestamp, sign), "application/json",
		bytes.NewBuffer(jsonData))
	if err != nil {
		return err
	}
	var res dingMessageResponse
	err = json.NewDecoder(resp.Body).Decode(&res)
	if err != nil {
		return err
	}
	if res.Code != 0 {
		return errors.New(res.Message)
	}
	return nil
}

func dingSign(secret string, timestamp int64) (string, error) {
	// https://open.dingtalk.com/document/robots/customize-robot-security-settings
	// timestamp + key -> sha256 -> URL encode
	stringToSign := fmt.Sprintf("%d\n%s", timestamp, secret)
	h := hmac.New(sha256.New, []byte(secret))
	_, err := h.Write([]byte(stringToSign))
	if err != nil {
		return "", err
	}
	signature := base64.StdEncoding.EncodeToString(h.Sum(nil))
	signature = url.QueryEscape(signature)
	return signature, nil
}
