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
	TypeDiscord           = "discord"
	TypeBark              = "bark"
	TypeClient            = "client"
	TypeNone              = "none"
)

func SendMessage(message *model.Message, user *model.User) error {
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
	case TypeDiscord:
		return SendDiscordMessage(message, user)
	case TypeNone:
		return nil
	default:
		return errors.New("不支持的消息通道：" + message.Channel)
	}
}
