package channel

import (
	"errors"
	"message-pusher/common"
	"message-pusher/model"
)

func SendEmailMessage(message *Message, user *model.User) error {
	if user.Email == "" {
		return errors.New("未配置邮箱地址")
	}
	subject := message.Description
	if subject == "" {
		subject = message.Title
	}
	return common.SendEmail(subject, user.Email, message.HTMLContent)
}
