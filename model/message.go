package model

import (
	"errors"
	"message-pusher/common"
	"time"
)

type Message struct {
	Id          int    `json:"id"`
	UserId      int    `json:"user_id" gorm:"index"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Desp        string `json:"desp" gorm:"-:all"` // alias for description
	Content     string `json:"content"`
	URL         string `json:"url" gorm:"column:url"`
	Channel     string `json:"channel"`
	Token       string `json:"token" gorm:"-:all"`
	HTMLContent string `json:"html_content"  gorm:"-:all"`
	Timestamp   int64  `json:"timestamp" gorm:"type:int64"`
	Link        string `json:"link" gorm:"unique;index"`
	To          string `json:"to" gorm:"column:to"`     // if specified, will send to this user(s)
	Status      int    `json:"status" gorm:"default:0"` // pending, sent, failed
}

func GetMessageById(id int, userId int) (*Message, error) {
	if id == 0 || userId == 0 {
		return nil, errors.New("id 或 userId 为空！")
	}
	message := Message{Id: id, UserId: userId}
	err := DB.Where(message).First(&message).Error
	return &message, err
}

func GetMessageByLink(link string) (*Message, error) {
	if link == "" {
		return nil, errors.New("link 为空！")
	}
	message := Message{Link: link}
	err := DB.Where(message).First(&message).Error
	return &message, err
}

func GetMessagesByUserId(userId int, startIdx int, num int) (messages []*Message, err error) {
	err = DB.Where("user_id = ?", userId).Order("id desc").Limit(num).Offset(startIdx).Find(&messages).Error
	return messages, err
}

func SearchMessages(keyword string) (messages []*Message, err error) {
	err = DB.Select([]string{"id", "title", "description", "content"}).Where("id = ? or title LIKE ? or description LIKE ? or content LIKE ?", keyword, keyword+"%", keyword+"%", keyword+"%").Find(&messages).Error
	return messages, err
}

func DeleteMessageById(id int, userId int) (err error) {
	// Why we need userId here? In case user want to delete other's message.
	if id == 0 || userId == 0 {
		return errors.New("id 或 userId 为空！")
	}
	message := Message{Id: id, UserId: userId}
	err = DB.Where(message).First(&message).Error
	if err != nil {
		return err
	}
	return message.Delete()
}

func DeleteAllMessages() error {
	return DB.Exec("DELETE FROM messages").Error
}

func (message *Message) UpdateAndInsert(userId int) error {
	message.Timestamp = time.Now().Unix()
	message.UserId = userId
	message.Status = common.MessageSendStatusPending
	var err error
	err = DB.Create(message).Error
	return err
}

func (message *Message) UpdateStatus(status int) error {
	err := DB.Model(message).Update("status", status).Error
	return err
}

func (message *Message) Delete() error {
	err := DB.Delete(message).Error
	return err
}
