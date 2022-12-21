package channel

import (
	"errors"
	"message-pusher/model"
)

const (
	TypeEmail             = "email"
	TypeWeChatTestAccount = "test"
	TypeWeChatCorpAccount = "corp_app"
	TypeCorp              = "corp"
	TypeLark              = "lark"
	TypeDing              = "ding"
	TypeTelegram          = "telegram"
	TypeBark              = "bark"
	TypeClient            = "client"
)

type Message struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	Desp        string `json:"desp"` // alias for description
	Content     string `json:"content"`
	URL         string `json:"url"`
	Channel     string `json:"channel"`
	Token       string `json:"token"`
	HTMLContent string `json:"html_content"`
}

func (message *Message) Send(user *model.User) error {
	switch message.Channel {
	case TypeEmail:
		return SendEmailMessage(message, user)
	case TypeWeChatTestAccount:
		return SendWeChatTestMessage(message, user)
	case TypeWeChatCorpAccount:
		return SendWeChatCorpMessage(message, user)
	case TypeCorp:
		return SendCorpMessage(message, user)
	case TypeLark:
		return SendLarkMessage(message, user)
	case TypeDing:
		return SendDingMessage(message, user)
	case TypeBark:
		return SendBarkMessage(message, user)
	case TypeClient:
		return SendClientMessage(message, user)
	case TypeTelegram:
		return SendTelegramMessage(message, user)
	default:
		return errors.New("不支持的消息通道：" + message.Channel)
	}
}
