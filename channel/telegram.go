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

func SendTelegramMessage(message *model.Message, user *model.User, channel_ *model.Channel) error {
	// https://core.telegram.org/bots/api#sendmessage
	messageRequest := telegramMessageRequest{
		ChatId: channel_.AccountId,
	}
	if message.To != "" {
		messageRequest.ChatId = message.To
	}
	if message.Content == "" {
		messageRequest.Text = message.Description
	} else {
		messageRequest.Text = message.Content
		messageRequest.ParseMode = "markdown"
	}
	jsonData, err := json.Marshal(messageRequest)
	if err != nil {
		return err
	}
	resp, err := http.Post(fmt.Sprintf("https://api.telegram.org/bot%s/sendMessage", channel_.Secret), "application/json",
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
