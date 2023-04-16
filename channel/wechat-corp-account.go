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

type wechatCorpAccountResponse struct {
	ErrorCode    int    `json:"errcode"`
	ErrorMessage string `json:"errmsg"`
	AccessToken  string `json:"access_token"`
	ExpiresIn    int    `json:"expires_in"`
}

type WeChatCorpAccountTokenStoreItem struct {
	CorpId      string
	AgentSecret string
	AgentId     string
	AccessToken string
}

func (i *WeChatCorpAccountTokenStoreItem) Key() string {
	return i.CorpId + i.AgentId + i.AgentSecret
}

func (i *WeChatCorpAccountTokenStoreItem) IsShared() bool {
	return model.DB.Where("wechat_corp_account_id = ? and wechat_corp_account_agent_secret = ? and wechat_corp_account_agent_id = ?",
		i.CorpId, i.AgentSecret, i.AgentId).Find(&model.User{}).RowsAffected != 1
}

func (i *WeChatCorpAccountTokenStoreItem) IsFilled() bool {
	return i.CorpId != "" && i.AgentSecret != "" && i.AgentId != ""
}

func (i *WeChatCorpAccountTokenStoreItem) Token() string {
	return i.AccessToken
}

func (i *WeChatCorpAccountTokenStoreItem) Refresh() {
	// https://work.weixin.qq.com/api/doc/90000/90135/91039
	client := http.Client{
		Timeout: 5 * time.Second,
	}
	req, err := http.NewRequest("GET", fmt.Sprintf("https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=%s&corpsecret=%s",
		i.CorpId, i.AgentSecret), nil)
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
	var res wechatCorpAccountResponse
	err = json.NewDecoder(responseData.Body).Decode(&res)
	if err != nil {
		common.SysError("failed to decode wechatCorpAccountResponse: " + err.Error())
		return
	}
	if res.ErrorCode != 0 {
		common.SysError(res.ErrorMessage)
		return
	}
	i.AccessToken = res.AccessToken
	common.SysLog("access token refreshed")
}

type wechatCorpMessageRequest struct {
	MessageType string `json:"msgtype"`
	ToUser      string `json:"touser"`
	AgentId     string `json:"agentid"`
	TextCard    struct {
		Title       string `json:"title"`
		Description string `json:"description"`
		URL         string `json:"url"`
	} `json:"textcard"`
	Text struct {
		Content string `json:"content"`
	} `json:"text"`
	Markdown struct {
		Content string `json:"content"`
	} `json:"markdown"`
}

type wechatCorpMessageResponse struct {
	ErrorCode    int    `json:"errcode"`
	ErrorMessage string `json:"errmsg"`
}

func SendWeChatCorpMessage(message *model.Message, user *model.User) error {
	if user.WeChatCorpAccountId == "" {
		return errors.New("未配置微信企业号消息推送方式")
	}
	// https://developer.work.weixin.qq.com/document/path/90236
	messageRequest := wechatCorpMessageRequest{
		ToUser:  user.WeChatCorpAccountUserId,
		AgentId: user.WeChatCorpAccountAgentId,
	}
	if message.To != "" {
		messageRequest.ToUser = message.To
	}
	if message.Content == "" {
		if message.Title == "" {
			messageRequest.MessageType = "text"
			messageRequest.Text.Content = message.Description
		} else {
			messageRequest.MessageType = "textcard"
			messageRequest.TextCard.Title = message.Title
			messageRequest.TextCard.Description = message.Description
			messageRequest.TextCard.URL = common.ServerAddress
		}
	} else {
		if user.WeChatCorpAccountClientType == "plugin" {
			messageRequest.MessageType = "textcard"
			messageRequest.TextCard.Title = message.Title
			messageRequest.TextCard.Description = message.Description
			messageRequest.TextCard.URL = message.URL
		} else {
			messageRequest.MessageType = "markdown"
			messageRequest.Markdown.Content = message.Content
		}
	}
	jsonData, err := json.Marshal(messageRequest)
	if err != nil {
		return err
	}
	key := fmt.Sprintf("%s%s%s", user.WeChatCorpAccountId, user.WeChatCorpAccountAgentId, user.WeChatCorpAccountAgentSecret)
	accessToken := TokenStoreGetToken(key)
	resp, err := http.Post(fmt.Sprintf("https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=%s", accessToken), "application/json",
		bytes.NewBuffer(jsonData))
	if err != nil {
		return err
	}
	var res wechatCorpMessageResponse
	err = json.NewDecoder(resp.Body).Decode(&res)
	if err != nil {
		return err
	}
	if res.ErrorCode != 0 {
		return errors.New(res.ErrorMessage)
	}
	return nil
}
