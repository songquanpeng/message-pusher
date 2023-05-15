package model

import (
	"errors"
	"message-pusher/common"
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
	TypeOneBot            = "one_bot"
	TypeGroup             = "group"
	TypeLarkApp           = "lark_app"
	TypeCustom            = "custom"
	TypeTencentAlarm      = "tencent_alarm"
)

type Channel struct {
	Id          int    `json:"id"`
	Type        string `json:"type" gorm:"type:varchar(32)"`
	UserId      int    `json:"user_id" gorm:"uniqueIndex:name_user_id;index"`
	Name        string `json:"name" gorm:"type:varchar(32);uniqueIndex:name_user_id"`
	Description string `json:"description"`
	Status      int    `json:"status" gorm:"default:1"` // enabled, disabled
	Secret      string `json:"secret" gorm:"index"`
	AppId       string `json:"app_id"`
	AccountId   string `json:"account_id"`
	URL         string `json:"url" gorm:"column:url"`
	Other       string `json:"other"`
	CreatedTime int64  `json:"created_time" gorm:"bigint"`
}

type BriefChannel struct {
	Id          int    `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
}

func GetChannelById(id int, userId int, selectAll bool) (*Channel, error) {
	if id == 0 || userId == 0 {
		return nil, errors.New("id 或 userId 为空！")
	}
	c := Channel{Id: id, UserId: userId}
	var err error
	if selectAll {
		err = DB.Where(c).First(&c).Error
	} else {
		err = DB.Omit("secret").Where(c).First(&c).Error
	}
	return &c, err
}

func GetChannelByName(name string, userId int) (*Channel, error) {
	if name == "" || userId == 0 {
		return nil, errors.New("name 或 userId 为空！")
	}
	c := Channel{Name: name, UserId: userId}
	err := DB.Where(c).First(&c).Error
	return &c, err
}

func GetTokenStoreChannels() (channels []*Channel, err error) {
	err = DB.Where("type in ?", []string{TypeWeChatCorpAccount, TypeWeChatTestAccount, TypeLarkApp}).Find(&channels).Error
	return channels, err
}

func GetTokenStoreChannelsByUserId(userId int) (channels []*Channel, err error) {
	err = DB.Where("user_id = ?", userId).Where("type = ? or type = ?", TypeWeChatCorpAccount, TypeWeChatTestAccount).Find(&channels).Error
	return channels, err
}

func GetChannelsByUserId(userId int, startIdx int, num int) (channels []*Channel, err error) {
	err = DB.Omit("secret").Where("user_id = ?", userId).Order("id desc").Limit(num).Offset(startIdx).Find(&channels).Error
	return channels, err
}

func GetBriefChannelsByUserId(userId int) (channels []*BriefChannel, err error) {
	err = DB.Model(&Channel{}).Select("id", "name", "description").Where("user_id = ? and status = ?", userId, common.ChannelStatusEnabled).Find(&channels).Error
	return channels, err
}

func SearchChannels(userId int, keyword string) (channels []*Channel, err error) {
	err = DB.Omit("secret").Where("user_id = ?", userId).Where("id = ? or name LIKE ?", keyword, keyword+"%").Find(&channels).Error
	return channels, err
}

func DeleteChannelById(id int, userId int) (c *Channel, err error) {
	// Why we need userId here? In case user want to delete other's c.
	if id == 0 || userId == 0 {
		return nil, errors.New("id 或 userId 为空！")
	}
	c = &Channel{Id: id, UserId: userId}
	err = DB.Where(c).First(&c).Error
	if err != nil {
		return nil, err
	}
	return c, c.Delete()
}

func (channel *Channel) Insert() error {
	var err error
	err = DB.Create(channel).Error
	return err
}

func (channel *Channel) UpdateStatus(status int) error {
	err := DB.Model(channel).Update("status", status).Error
	return err
}

// Update Make sure your token's fields is completed, because this will update non-zero values
func (channel *Channel) Update() error {
	var err error
	err = DB.Model(channel).Select("type", "name", "description", "secret", "app_id", "account_id", "url", "other", "status").Updates(channel).Error
	return err
}

func (channel *Channel) Delete() error {
	err := DB.Delete(channel).Error
	return err
}
