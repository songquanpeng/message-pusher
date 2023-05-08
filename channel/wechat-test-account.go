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
	var count int64 = 0
	model.DB.Model(&model.Channel{}).Where("secret = ? and app_id = ? and type = ?",
		i.AppSecret, i.AppID, model.TypeWeChatTestAccount).Count(&count)
	return count > 1
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

type wechatTestAccountRequestValue struct {
	Value string `json:"value"`
}

type wechatTestMessageRequest struct {
	ToUser     string `json:"touser"`
	TemplateId string `json:"template_id"`
	URL        string `json:"url"`
	Data       struct {
		Text        wechatTestAccountRequestValue `json:"text"` // alias for description, for compatibility
		Title       wechatTestAccountRequestValue `json:"title"`
		Description wechatTestAccountRequestValue `json:"description"`
		Content     wechatTestAccountRequestValue `json:"content"`
	} `json:"data"`
}

type wechatTestMessageResponse struct {
	ErrorCode    int    `json:"errcode"`
	ErrorMessage string `json:"errmsg"`
}

func SendWeChatTestMessage(message *model.Message, user *model.User, channel_ *model.Channel) error {
	// https://developers.weixin.qq.com/doc/offiaccount/Message_Management/Template_Message_Interface.html
	values := wechatTestMessageRequest{
		ToUser:     channel_.AccountId,
		TemplateId: channel_.Other,
		URL:        "",
	}
	if message.To != "" {
		values.ToUser = message.To
	}
	values.Data.Text.Value = message.Description
	values.Data.Title.Value = message.Title
	values.Data.Description.Value = message.Description
	values.Data.Content.Value = message.Content
	values.URL = message.URL
	jsonData, err := json.Marshal(values)
	if err != nil {
		return err
	}
	key := fmt.Sprintf("%s%s", channel_.AppId, channel_.Secret)
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
