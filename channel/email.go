package channel

import (
	"errors"
	"message-pusher/common"
	"message-pusher/model"
)

func SendEmailMessage(message *model.Message, user *model.User, channel_ *model.Channel) error {
	if message.To != "" {
		if user.SendEmailToOthers != common.SendEmailToOthersAllowed && user.Role < common.RoleAdminUser {
			return errors.New("没有权限发送邮件给其他人，请联系管理员为你添加该权限")
		}
		user.Email = message.To
	}
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
