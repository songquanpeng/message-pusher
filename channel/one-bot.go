package channel

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"message-pusher/model"
	"net/http"
	"strconv"
	"strings"
)

type oneBotMessageRequest struct {
	MessageType string `json:"message_type"`
	UserId      int64  `json:"user_id"`
	GroupId     int64  `json:"group_id"`
	Message     string `json:"message"`
	AutoEscape  bool   `json:"auto_escape"`
}

type oneBotMessageResponse struct {
	Message string `json:"message"`
	Status  string `json:"status"`
	RetCode int    `json:"retcode"`
}

func SendOneBotMessage(message *model.Message, user *model.User, channel_ *model.Channel) error {
	url := fmt.Sprintf("%s/send_msg", channel_.URL)
	req := oneBotMessageRequest{
		Message: message.Content,
	}
	if message.Content == "" {
		req.Message = message.Description
	}
	target := channel_.AccountId
	if message.To != "" {
		target = message.To
	}
	parts := strings.Split(target, "_")
	var idStr string
	var type_ string
	if len(parts) == 1 {
		type_ = "user"
		idStr = parts[0]
	} else if len(parts) == 2 {
		type_ = parts[0]
		idStr = parts[1]
	} else {
		return errors.New("无效的 OneBot 配置")
	}
	id, _ := strconv.ParseInt(idStr, 10, 64)
	if type_ == "user" {
		req.UserId = id
		req.MessageType = "private"
	} else if type_ == "group" {
		req.GroupId = id
		req.MessageType = "group"
	} else {
		return errors.New("无效的 OneBot 配置")
	}
	reqBody, err := json.Marshal(req)
	if err != nil {
		return err
	}
	request, _ := http.NewRequest("POST", url, bytes.NewReader(reqBody))
	request.Header.Set("Authorization", "Bearer "+channel_.Secret)
	request.Header.Set("Content-Type", "application/json")
	resp, err := http.DefaultClient.Do(request)
	if err != nil {
		return err
	}
	if resp.StatusCode != 200 {
		return errors.New(resp.Status)
	}
	var res oneBotMessageResponse
	err = json.NewDecoder(resp.Body).Decode(&res)
	if err != nil {
		return err
	}
	if res.RetCode != 0 {
		return errors.New(res.Message)
	}
	return nil
}
