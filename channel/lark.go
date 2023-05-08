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
	"strconv"
	"strings"
	"time"
)

type larkMessageRequestCardElementText struct {
	Content string `json:"content"`
	Tag     string `json:"tag"`
}

type larkMessageRequestCardElement struct {
	Tag  string                            `json:"tag"`
	Text larkMessageRequestCardElementText `json:"text"`
}

type larkTextContent struct {
	Text string `json:"text"`
}

type larkCardContent struct {
	Config struct {
		WideScreenMode bool `json:"wide_screen_mode"`
		EnableForward  bool `json:"enable_forward"`
	}
	Elements []larkMessageRequestCardElement `json:"elements"`
}

type larkMessageRequest struct {
	MessageType string          `json:"msg_type"`
	Timestamp   string          `json:"timestamp"`
	Sign        string          `json:"sign"`
	Content     larkTextContent `json:"content"`
	Card        larkCardContent `json:"card"`
}

type larkMessageResponse struct {
	Code    int    `json:"code"`
	Message string `json:"msg"`
}

func getLarkAtPrefix(message *model.Message) string {
	atPrefix := ""
	if message.To != "" {
		if message.To == "@all" {
			atPrefix = "<at user_id=\"all\">所有人</at>"
		} else {
			ids := strings.Split(message.To, "|")
			for _, id := range ids {
				atPrefix += fmt.Sprintf("<at user_id=\"%s\"> </at>", id)
			}
		}
	}
	return atPrefix
}

func SendLarkMessage(message *model.Message, user *model.User, channel_ *model.Channel) error {
	// https://open.feishu.cn/document/ukTMukTMukTM/ucTM5YjL3ETO24yNxkjN#e1cdee9f
	messageRequest := larkMessageRequest{
		MessageType: "text",
	}
	atPrefix := getLarkAtPrefix(message)
	if message.Content == "" {
		messageRequest.MessageType = "text"
		messageRequest.Content.Text = atPrefix + message.Description
	} else {
		messageRequest.MessageType = "interactive"
		messageRequest.Card.Config.WideScreenMode = true
		messageRequest.Card.Config.EnableForward = true
		messageRequest.Card.Elements = append(messageRequest.Card.Elements, larkMessageRequestCardElement{
			Tag: "div",
			Text: larkMessageRequestCardElementText{
				Content: atPrefix + message.Content,
				Tag:     "lark_md",
			},
		})
	}

	now := time.Now()
	timestamp := now.Unix()
	sign, err := larkSign(channel_.Secret, timestamp)
	if err != nil {
		return err
	}
	messageRequest.Sign = sign
	messageRequest.Timestamp = strconv.FormatInt(timestamp, 10)
	jsonData, err := json.Marshal(messageRequest)
	if err != nil {
		return err
	}
	resp, err := http.Post(channel_.URL, "application/json",
		bytes.NewBuffer(jsonData))
	if err != nil {
		return err
	}
	var res larkMessageResponse
	err = json.NewDecoder(resp.Body).Decode(&res)
	if err != nil {
		return err
	}
	if res.Code != 0 {
		return errors.New(res.Message)
	}
	return nil
}

func larkSign(secret string, timestamp int64) (string, error) {
	// https://open.feishu.cn/document/ukTMukTMukTM/ucTM5YjL3ETO24yNxkjN?lang=zh-CN
	// timestamp + key -> sha256 -> base64 encode
	stringToSign := fmt.Sprintf("%v", timestamp) + "\n" + secret
	var data []byte
	h := hmac.New(sha256.New, []byte(stringToSign))
	_, err := h.Write(data)
	if err != nil {
		return "", err
	}
	signature := base64.StdEncoding.EncodeToString(h.Sum(nil))
	return signature, nil
}
