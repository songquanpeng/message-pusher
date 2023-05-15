package channel

import (
	"crypto/hmac"
	"crypto/sha1"
	"encoding/base64"
	"encoding/json"
	"errors"
	"math/rand"
	"message-pusher/model"
	"net/http"
	"net/url"
	"sort"
	"strconv"
	"strings"
	"time"
)

type TencentAlarmResponse struct {
	Code     int    `json:"code"`
	Message  string `json:"message"`
	CodeDesc string `json:"codeDesc"`
}

func SendTencentAlarmMessage(message *model.Message, user *model.User, channel_ *model.Channel) error {
	secretId := channel_.AppId
	secretKey := channel_.Secret
	policyId := channel_.AccountId
	region := channel_.Other
	if message.Description == "" {
		message.Description = message.Content
	}
	params := map[string]string{
		"Action":    "SendCustomAlarmMsg",
		"Region":    region,
		"Timestamp": strconv.FormatInt(time.Now().Unix(), 10),
		"Nonce":     strconv.Itoa(rand.Intn(65535)),
		"SecretId":  secretId,
		"policyId":  policyId,
		"msg":       message.Description,
	}

	keys := make([]string, 0, len(params))
	for key := range params {
		keys = append(keys, key)
	}
	sort.Strings(keys)

	srcStr := "GETmonitor.api.qcloud.com/v2/index.php?"
	for _, key := range keys {
		srcStr += key + "=" + params[key] + "&"
	}
	srcStr = srcStr[:len(srcStr)-1]

	h := hmac.New(sha1.New, []byte(secretKey))
	h.Write([]byte(srcStr))
	signature := base64.StdEncoding.EncodeToString(h.Sum(nil))

	params["Signature"] = signature

	urlStr := "https://monitor.api.qcloud.com/v2/index.php?" + urlEncode(params)

	client := &http.Client{}
	req, err := http.NewRequest("GET", urlStr, nil)
	if err != nil {
		return err
	}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	var response TencentAlarmResponse
	err = json.NewDecoder(resp.Body).Decode(&response)
	if err != nil {
		return err
	}
	if response.Code != 0 {
		return errors.New(response.Message)
	}
	return nil
}

func urlEncode(params map[string]string) string {
	var encodedParams []string
	for key, value := range params {
		encodedParams = append(encodedParams, url.QueryEscape(key)+"="+url.QueryEscape(value))
	}
	return strings.Join(encodedParams, "&")
}
