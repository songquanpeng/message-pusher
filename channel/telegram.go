package channel

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"message-pusher/model"
	"net/http"
)

type telegramMessageRequest struct {
	ChatId    string `json:"chat_id"`
	Text      string `json:"text"`
	ParseMode string `json:"parse_mode"`
}

type telegramMessageResponse struct {
	Ok          bool   `json:"ok"`
	Description string `json:"description"`
}

func SendTelegramMessage(message *model.Message, user *model.User) error {
	if user.TelegramBotToken == "" || user.TelegramChatId == "" {
		return errors.New("未配置 Telegram 机器人消息推送方式")
	}
	messageRequest := telegramMessageRequest{
		ChatId:    user.TelegramChatId,
		Text:      message.Content,
		ParseMode: "markdown",
	}
	if messageRequest.Text == "" {
		messageRequest.Text = message.Description
	}
	jsonData, err := json.Marshal(messageRequest)
	if err != nil {
		return err
	}
	resp, err := http.Post(fmt.Sprintf("https://api.telegram.org/bot%s/sendMessage", user.TelegramBotToken), "application/json",
		bytes.NewBuffer(jsonData))
	if err != nil {
		return err
	}
	var res telegramMessageResponse
	err = json.NewDecoder(resp.Body).Decode(&res)
	if err != nil {
		return err
	}
	if !res.Ok {
		return errors.New(res.Description)
	}
	return nil
}
