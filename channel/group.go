package channel

import (
	"errors"
	"fmt"
	"message-pusher/model"
	"strings"
)

func SendGroupMessage(message *model.Message, user *model.User, channel_ *model.Channel) error {
	subChannels := strings.Split(channel_.AppId, "|")
	subTargets := strings.Split(channel_.AccountId, "|")
	if len(subChannels) != len(subTargets) {
		return errors.New("无效的群组消息配置，子通道数量与子目标数量不一致")
	}
	errMessage := ""
	for i := 0; i < len(subChannels); i++ {
		message.To = subTargets[i]
		message.Channel = subChannels[i]
		subChannel, err := model.GetChannelByName(subChannels[i], user.Id)
		if err != nil {
			return errors.New("获取群组消息子通道失败：" + err.Error())
		}
		if subChannel.Type == model.TypeGroup {
			return errors.New("群组消息子通道不能是群组消息")
		}
		err = SendMessage(message, user, subChannel)
		if err != nil {
			errMessage += fmt.Sprintf("发送群组消息子通道 %s 失败：%s\n", subChannels[i], err.Error())
		}
	}
	if errMessage != "" {
		return errors.New(errMessage)
	}
	return nil
}
