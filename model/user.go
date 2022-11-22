package model

import (
	"errors"
	"message-pusher/common"
	"strings"
)

// User if you add sensitive fields, don't forget to clean them in setupLogin function.
// Otherwise, the sensitive information will be saved on local storage in plain text!
type User struct {
	Id                                 int    `json:"id"`
	Username                           string `json:"username" gorm:"unique;index" validate:"max=12"`
	Password                           string `json:"password" gorm:"not null;" validate:"min=8,max=20"`
	DisplayName                        string `json:"display_name" gorm:"index" validate:"max=20"`
	Role                               int    `json:"role" gorm:"type:int;default:1"`   // admin, common
	Status                             int    `json:"status" gorm:"type:int;default:1"` // enabled, disabled
	Token                              string `json:"token" gorm:"index"`
	Email                              string `json:"email" gorm:"index" validate:"max=50"`
	GitHubId                           string `json:"github_id" gorm:"column:github_id;index"`
	WeChatId                           string `json:"wechat_id" gorm:"column:wechat_id;index"`
	VerificationCode                   string `json:"verification_code" gorm:"-:all"` // this field is only for Email verification, don't save it to database!
	Channel                            string `json:"channel"`
	WeChatTestAccountId                string `json:"wechat_test_account_id" gorm:"column:wechat_test_account_id"`
	WeChatTestAccountSecret            string `json:"wechat_test_account_secret" gorm:"column:wechat_test_account_secret"`
	WeChatTestAccountTemplateId        string `json:"wechat_test_account_template_id" gorm:"column:wechat_test_account_template_id"`
	WeChatTestAccountOpenId            string `json:"wechat_test_account_open_id" gorm:"column:wechat_test_account_open_id"`
	WeChatTestAccountVerificationToken string `json:"wechat_test_account_verification_token" gorm:"column:wechat_test_account_verification_token"`
	WeChatCorpAccountId                string `json:"wechat_corp_account_id" gorm:"column:wechat_corp_account_id"`
	WeChatCorpAccountSecret            string `json:"wechat_corp_account_secret" gorm:"column:wechat_corp_account_secret"`
	WeChatCorpAccountAgentId           string `json:"wechat_corp_account_agent_id" gorm:"column:wechat_corp_account_agent_id"`
	WeChatCorpAccountUserId            string `json:"wechat_corp_account_user_id" gorm:"column:wechat_corp_account_user_id"`
	WeChatCorpAccountClientType        string `json:"wechat_corp_account_client_type" gorm:"wechat_corp_account_client_type;default=plugin"`
	LarkWebhookURL                     string `json:"lark_webhook_url"`
	LarkWebhookSecret                  string `json:"lark_webhook_secret"`
	DingWebhookURL                     string `json:"ding_webhook_url"`
	DingWebhookSecret                  string `json:"ding_webhook_secret"`
}

func GetMaxUserId() int {
	var user User
	DB.Last(&user)
	return user.Id
}

func GetAllUsers(startIdx int, num int) (users []*User, err error) {
	err = DB.Order("id desc").Limit(num).Offset(startIdx).Select([]string{"id", "username", "display_name", "role", "status", "email"}).Find(&users).Error
	return users, err
}

func GetAllUsersWithSecrets() (users []*User, err error) {
	err = DB.Find(&users).Error
	return users, err
}

func SearchUsers(keyword string) (users []*User, err error) {
	err = DB.Select([]string{"id", "username", "display_name", "role", "status", "email"}).Where("id = ? or username LIKE ? or email LIKE ? or display_name LIKE ?", keyword, keyword+"%", keyword+"%", keyword+"%").Find(&users).Error
	return users, err
}

func GetUserById(id int, selectAll bool) (*User, error) {
	user := User{Id: id}
	var err error = nil
	if selectAll {
		err = DB.First(&user, "id = ?", id).Error
	} else {
		err = DB.Select([]string{"id", "username", "display_name", "role", "status", "email", "wechat_id", "github_id"}).First(&user, "id = ?", id).Error
	}
	return &user, err
}

func DeleteUserById(id int) (err error) {
	user := User{Id: id}
	err = DB.Delete(&user).Error
	return err
}

func (user *User) Insert() error {
	var err error
	if user.Password != "" {
		user.Password, err = common.Password2Hash(user.Password)
		if err != nil {
			return err
		}
	}
	err = DB.Create(user).Error
	return err
}

func (user *User) Update(updatePassword bool) error {
	var err error
	if updatePassword {
		user.Password, err = common.Password2Hash(user.Password)
		if err != nil {
			return err
		}
	}
	err = DB.Model(user).Updates(user).Error
	return err
}

func (user *User) Delete() error {
	var err error
	err = DB.Delete(user).Error
	return err
}

// ValidateAndFill check password & user status
func (user *User) ValidateAndFill() (err error) {
	// When querying with struct, GORM will only query with non-zero fields,
	// that means if your field’s value is 0, '', false or other zero values,
	// it won’t be used to build query conditions
	password := user.Password
	if password == "" {
		return errors.New("密码为空")
	}
	DB.Where(User{Username: user.Username}).First(user)
	okay := common.ValidatePasswordAndHash(password, user.Password)
	if !okay || user.Status != common.UserStatusEnabled {
		return errors.New("用户名或密码错误，或用户已被封禁")
	}
	return nil
}

func (user *User) FillUserById() {
	DB.Where(User{Id: user.Id}).First(user)
}

func (user *User) FillUserByEmail() {
	DB.Where(User{Email: user.Email}).First(user)
}

func (user *User) FillUserByGitHubId() {
	DB.Where(User{GitHubId: user.GitHubId}).First(user)
}

func (user *User) FillUserByWeChatId() {
	DB.Where(User{WeChatId: user.WeChatId}).First(user)
}

func (user *User) FillUserByUsername() {
	DB.Where(User{Username: user.Username}).First(user)
}

func ValidateUserToken(token string) (user *User) {
	if token == "" {
		return nil
	}
	token = strings.Replace(token, "Bearer ", "", 1)
	user = &User{}
	if DB.Where("token = ?", token).First(user).RowsAffected == 1 {
		return user
	}
	return nil
}

func IsEmailAlreadyTaken(email string) bool {
	return DB.Where("email = ?", email).Find(&User{}).RowsAffected == 1
}

func IsWeChatIdAlreadyTaken(wechatId string) bool {
	return DB.Where("wechat_id = ?", wechatId).Find(&User{}).RowsAffected == 1
}

func IsGitHubIdAlreadyTaken(githubId string) bool {
	return DB.Where("github_id = ?", githubId).Find(&User{}).RowsAffected == 1
}

func IsUsernameAlreadyTaken(username string) bool {
	return DB.Where("username = ?", username).Find(&User{}).RowsAffected == 1
}

func ResetUserPasswordByEmail(email string, password string) error {
	hashedPassword, err := common.Password2Hash(password)
	if err != nil {
		return err
	}
	err = DB.Model(&User{}).Where("email = ?", email).Update("password", hashedPassword).Error
	return err
}
