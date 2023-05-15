package channel

import (
	"errors"
	"message-pusher/model"
)

func SendMessage(message *model.Message, user *model.User, channel_ *model.Channel) error {
	switch channel_.Type {
	case model.TypeEmail:
		return SendEmailMessage(message, user, channel_)
	case model.TypeWeChatTestAccount:
		return SendWeChatTestMessage(message, user, channel_)
	case model.TypeWeChatCorpAccount:
		return SendWeChatCorpMessage(message, user, channel_)
	case model.TypeCorp:
		return SendCorpMessage(message, user, channel_)
	case model.TypeLark:
		return SendLarkMessage(message, user, channel_)
	case model.TypeDing:
		return SendDingMessage(message, user, channel_)
	case model.TypeBark:
		return SendBarkMessage(message, user, channel_)
	case model.TypeClient:
		return SendClientMessage(message, user, channel_)
	case model.TypeTelegram:
		return SendTelegramMessage(message, user, channel_)
	case model.TypeDiscord:
		return SendDiscordMessage(message, user, channel_)
	case model.TypeNone:
		return nil
	case model.TypeOneBot:
		return SendOneBotMessage(message, user, channel_)
	case model.TypeGroup:
		return SendGroupMessage(message, user, channel_)
	case model.TypeLarkApp:
		return SendLarkAppMessage(message, user, channel_)
	case model.TypeCustom:
		return SendCustomMessage(message, user, channel_)
	case model.TypeTencentAlarm:
		return SendTencentAlarmMessage(message, user, channel_)
	default:
		return errors.New("不支持的消息通道：" + channel_.Type)
	}
}
