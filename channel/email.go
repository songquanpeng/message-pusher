package channel

import (
	"errors"
	"message-pusher/common"
	"message-pusher/model"
)

func SendEmailMessage(message *model.Message, user *model.User) error {
	if user.Email == "" {
		return errors.New("未配置邮箱地址")
	}
	subject := message.Description
	if subject == "" {
		subject = message.Title
	}
	if message.Content != "" {
		var err error
		message.HTMLContent, err = common.Markdown2HTML(message.Content)
		if err != nil {
			common.SysLog(err.Error())
		}
	}
	return common.SendEmail(subject, user.Email, message.HTMLContent)
}
