package channel

import (
	"bytes"
	"errors"
	"github.com/yuin/goldmark"
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
		var buf bytes.Buffer
		err := goldmark.Convert([]byte(message.Content), &buf)
		if err != nil {
			common.SysLog(err.Error())
		} else {
			message.HTMLContent = buf.String()
		}
	}
	return common.SendEmail(subject, user.Email, message.HTMLContent)
}
