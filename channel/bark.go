package channel

import (
	"encoding/json"
	"errors"
	"fmt"
	"message-pusher/model"
	"net/http"
)

type barkMessageResponse struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
}

func SendBarkMessage(message *Message, user *model.User) error {
	if user.BarkServer == "" || user.BarkSecret == "" {
		return errors.New("未配置 Bark 消息推送方式")
	}
	url := ""
	if message.Title != "" {
		url = fmt.Sprintf("%s/%s/%s/%s", user.BarkServer, user.BarkSecret, message.Title, message.Description)
	} else {
		url = fmt.Sprintf("%s/%s/%s", user.BarkServer, user.BarkSecret, message.Description)
	}
	resp, err := http.Get(url)
	if err != nil {
		return err
	}
	var res barkMessageResponse
	err = json.NewDecoder(resp.Body).Decode(&res)
	if err != nil {
		return err
	}
	if res.Code != 200 {
		return errors.New(res.Message)
	}
	return nil
}
