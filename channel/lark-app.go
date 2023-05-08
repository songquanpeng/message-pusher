package channel

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"message-pusher/common"
	"message-pusher/model"
	"net/http"
	"strings"
)

type larkAppTokenRequest struct {
	AppID     string `json:"app_id"`
	AppSecret string `json:"app_secret"`
}

type larkAppTokenResponse struct {
	Code              int    `json:"code"`
	Msg               string `json:"msg"`
	TenantAccessToken string `json:"tenant_access_token"`
	Expire            int    `json:"expire"`
}

type LarkAppTokenStoreItem struct {
	AppID       string
	AppSecret   string
	AccessToken string
}

func (i *LarkAppTokenStoreItem) Key() string {
	return i.AppID + i.AppSecret
}

func (i *LarkAppTokenStoreItem) IsShared() bool {
	var count int64 = 0
	model.DB.Model(&model.Channel{}).Where("secret = ? and app_id = ? and type = ?",
		i.AppSecret, i.AppID, model.TypeLarkApp).Count(&count)
	return count > 1
}

func (i *LarkAppTokenStoreItem) IsFilled() bool {
	return i.AppID != "" && i.AppSecret != ""
}

func (i *LarkAppTokenStoreItem) Token() string {
	return i.AccessToken
}

func (i *LarkAppTokenStoreItem) Refresh() {
	// https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/auth-v3/auth/tenant_access_token_internal
	tokenRequest := larkAppTokenRequest{
		AppID:     i.AppID,
		AppSecret: i.AppSecret,
	}
	tokenRequestData, err := json.Marshal(tokenRequest)
	responseData, err := http.Post("https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal",
		"application/json; charset=utf-8", bytes.NewBuffer(tokenRequestData))
	if err != nil {
		common.SysError("failed to refresh access token: " + err.Error())
		return
	}
	defer responseData.Body.Close()
	var res larkAppTokenResponse
	err = json.NewDecoder(responseData.Body).Decode(&res)
	if err != nil {
		common.SysError("failed to decode larkAppTokenResponse: " + err.Error())
		return
	}
	if res.Code != 0 {
		common.SysError(res.Msg)
		return
	}
	i.AccessToken = res.TenantAccessToken
	common.SysLog("access token refreshed")
}

type larkAppMessageRequest struct {
	ReceiveId string `json:"receive_id"`
	MsgType   string `json:"msg_type"`
	Content   string `json:"content"`
}

type larkAppMessageResponse struct {
	Code int    `json:"code"`
	Msg  string `json:"msg"`
}

func parseLarkAppTarget(target string) (string, string, error) {
	parts := strings.Split(target, ":")
	if len(parts) != 2 {
		return "", "", errors.New("无效的飞书应用号消息接收者参数")
	}
	return parts[0], parts[1], nil
}

func SendLarkAppMessage(message *model.Message, user *model.User, channel_ *model.Channel) error {
	// https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/create
	rawTarget := message.To
	if rawTarget == "" {
		rawTarget = channel_.AccountId
	}
	targetType, target, err := parseLarkAppTarget(rawTarget)
	if err != nil {
		return err
	}
	request := larkAppMessageRequest{
		ReceiveId: target,
	}
	atPrefix := getLarkAtPrefix(message)
	if message.Description != "" {
		request.MsgType = "text"
		content := larkTextContent{Text: atPrefix + message.Description}
		contentData, err := json.Marshal(content)
		if err != nil {
			return err
		}
		request.Content = string(contentData)
	} else {
		request.MsgType = "interactive"
		content := larkCardContent{}
		content.Config.WideScreenMode = true
		content.Config.EnableForward = true
		content.Elements = append(content.Elements, larkMessageRequestCardElement{
			Tag: "div",
			Text: larkMessageRequestCardElementText{
				Content: atPrefix + message.Content,
				Tag:     "lark_md",
			},
		})
		contentData, err := json.Marshal(content)
		if err != nil {
			return err
		}
		request.Content = string(contentData)
	}
	requestData, err := json.Marshal(request)
	if err != nil {
		return err
	}
	key := fmt.Sprintf("%s%s", channel_.AppId, channel_.Secret)
	accessToken := TokenStoreGetToken(key)
	url := fmt.Sprintf("https://open.feishu.cn/open-apis/im/v1/messages?receive_id_type=%s", targetType)
	req, _ := http.NewRequest("POST", url, bytes.NewReader(requestData))
	req.Header.Set("Authorization", "Bearer "+accessToken)
	req.Header.Set("Content-Type", "application/json; charset=utf-8")
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return err
	}
	var res larkAppMessageResponse
	err = json.NewDecoder(resp.Body).Decode(&res)
	if err != nil {
		return err
	}
	if res.Code != 0 {
		return errors.New(res.Msg)
	}
	return nil
}
