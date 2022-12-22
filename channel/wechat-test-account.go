package channel

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"message-pusher/common"
	"message-pusher/model"
	"net/http"
	"time"
)

type wechatTestAccountResponse struct {
	ErrorCode    int    `json:"errcode"`
	ErrorMessage string `json:"errmsg"`
	AccessToken  string `json:"access_token"`
	ExpiresIn    int    `json:"expires_in"`
}

type WeChatTestAccountTokenStoreItem struct {
	AppID       string
	AppSecret   string
	AccessToken string
}

func (i *WeChatTestAccountTokenStoreItem) Key() string {
	return i.AppID + i.AppSecret
}

func (i *WeChatTestAccountTokenStoreItem) IsShared() bool {
	return model.DB.Where("wechat_test_account_id = ? and wechat_test_account_secret = ?",
		i.AppID, i.AppSecret).Find(&model.User{}).RowsAffected != 1
}

func (i *WeChatTestAccountTokenStoreItem) IsFilled() bool {
	return i.AppID != "" && i.AppSecret != ""
}

func (i *WeChatTestAccountTokenStoreItem) Token() string {
	return i.AccessToken
}

func (i *WeChatTestAccountTokenStoreItem) Refresh() {
	// https://developers.weixin.qq.com/doc/offiaccount/Basic_Information/Get_access_token.html
	client := http.Client{
		Timeout: 5 * time.Second,
	}
	req, err := http.NewRequest("GET", fmt.Sprintf("https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=%s&secret=%s",
		i.AppID, i.AppSecret), nil)
	if err != nil {
		common.SysError(err.Error())
		return
	}
	responseData, err := client.Do(req)
	if err != nil {
		common.SysError("failed to refresh access token: " + err.Error())
		return
	}
	defer responseData.Body.Close()
	var res wechatTestAccountResponse
	err = json.NewDecoder(responseData.Body).Decode(&res)
	if err != nil {
		common.SysError("failed to decode wechatTestAccountResponse: " + err.Error())
		return
	}
	if res.ErrorCode != 0 {
		common.SysError(res.ErrorMessage)
		return
	}
	i.AccessToken = res.AccessToken
	common.SysLog("access token refreshed")
}

type wechatTestMessageRequest struct {
	ToUser     string `json:"touser"`
	TemplateId string `json:"template_id"`
	URL        string `json:"url"`
	Data       struct {
		Text struct {
			Value string `json:"value"`
		} `json:"text"`
	} `json:"data"`
}

type wechatTestMessageResponse struct {
	ErrorCode    int    `json:"errcode"`
	ErrorMessage string `json:"errmsg"`
}

func SendWeChatTestMessage(message *model.Message, user *model.User) error {
	if user.WeChatTestAccountId == "" {
		return errors.New("未配置微信测试号消息推送方式")
	}
	values := wechatTestMessageRequest{
		ToUser:     user.WeChatTestAccountOpenId,
		TemplateId: user.WeChatTestAccountTemplateId,
		URL:        "",
	}
	values.Data.Text.Value = message.Description
	values.URL = message.URL
	jsonData, err := json.Marshal(values)
	if err != nil {
		return err
	}
	key := fmt.Sprintf("%s%s", user.WeChatTestAccountId, user.WeChatTestAccountSecret)
	accessToken := TokenStoreGetToken(key)
	resp, err := http.Post(fmt.Sprintf("https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=%s", accessToken), "application/json",
		bytes.NewBuffer(jsonData))
	if err != nil {
		return err
	}
	var res wechatTestMessageResponse
	err = json.NewDecoder(resp.Body).Decode(&res)
	if err != nil {
		return err
	}
	if res.ErrorCode != 0 {
		return errors.New(res.ErrorMessage)
	}
	return nil
}
