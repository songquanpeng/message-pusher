package model

import (
	"errors"
)

// WebhookConstructRule Keep compatible with Message
type WebhookConstructRule struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	Content     string `json:"content"`
	URL         string `json:"url"`
}

type Webhook struct {
	Id            int    `json:"id"`
	UserId        int    `json:"user_id" gorm:"index"`
	Name          string `json:"name" gorm:"type:varchar(32);index"`
	Status        int    `json:"status" gorm:"default:1"` // enabled, disabled
	Link          string `json:"link" gorm:"type:char(32);uniqueIndex"`
	CreatedTime   int64  `json:"created_time" gorm:"bigint"`
	ExtractRule   string `json:"extract_rule" gorm:"not null"`              // how we extract key info from the request
	ConstructRule string `json:"construct_rule" gorm:"not null"`            // how we construct message with the extracted info
	Channel       string `json:"channel" gorm:"type:varchar(32); not null"` // which channel to send our message
}

func GetWebhookById(id int, userId int) (*Webhook, error) {
	if id == 0 || userId == 0 {
		return nil, errors.New("id 或 userId 为空！")
	}
	c := Webhook{Id: id, UserId: userId}
	err := DB.Where(c).First(&c).Error
	return &c, err
}

func GetWebhookByLink(link string) (*Webhook, error) {
	if link == "" {
		return nil, errors.New("link 为空！")
	}
	c := Webhook{Link: link}
	err := DB.Where(c).First(&c).Error
	return &c, err
}

func GetWebhooksByUserId(userId int, startIdx int, num int) (webhooks []*Webhook, err error) {
	err = DB.Where("user_id = ?", userId).Order("id desc").Limit(num).Offset(startIdx).Find(&webhooks).Error
	return webhooks, err
}

func SearchWebhooks(userId int, keyword string) (webhooks []*Webhook, err error) {
	err = DB.Where("user_id = ?", userId).Where("id = ? or link = ? or name LIKE ?", keyword, keyword, keyword+"%").Find(&webhooks).Error
	return webhooks, err
}

func DeleteWebhookById(id int, userId int) (c *Webhook, err error) {
	// Why we need userId here? In case user want to delete other's c.
	if id == 0 || userId == 0 {
		return nil, errors.New("id 或 userId 为空！")
	}
	c = &Webhook{Id: id, UserId: userId}
	err = DB.Where(c).First(&c).Error
	if err != nil {
		return nil, err
	}
	return c, c.Delete()
}

func (webhook *Webhook) Insert() error {
	var err error
	err = DB.Create(webhook).Error
	return err
}

func (webhook *Webhook) UpdateStatus(status int) error {
	err := DB.Model(webhook).Update("status", status).Error
	return err
}

// Update Make sure your token's fields is completed, because this will update zero values
func (webhook *Webhook) Update() error {
	var err error
	err = DB.Model(webhook).Select("status", "name", "extract_rule", "construct_rule", "channel").Updates(webhook).Error
	return err
}

func (webhook *Webhook) Delete() error {
	err := DB.Delete(webhook).Error
	return err
}
