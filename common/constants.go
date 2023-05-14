package common

import (
	"github.com/google/uuid"
	"sync"
	"time"
)

var StartTime = time.Now().Unix() // unit: second
var Version = "v0.0.0"
var SystemName = "消息推送服务"
var ServerAddress = "http://localhost:3000"
var Footer = ""
var HomePageLink = ""
var MessageCount = 0 // Non critical value, no need to use atomic
var UserCount = 0    // Non critical value, no need to use atomic

// Any options with "Secret", "Token" in its key won't be return by GetOptions

var SessionSecret = uuid.New().String()
var SQLitePath = "message-pusher.db"

var OptionMap map[string]string
var OptionMapRWMutex sync.RWMutex

var ItemsPerPage = 10

var PasswordLoginEnabled = true
var PasswordRegisterEnabled = true
var EmailVerificationEnabled = false
var GitHubOAuthEnabled = false
var WeChatAuthEnabled = false
var TurnstileCheckEnabled = false
var RegisterEnabled = true
var MessagePersistenceEnabled = true
var MessageRenderEnabled = true

var SMTPServer = ""
var SMTPPort = 587
var SMTPAccount = ""
var SMTPToken = ""

var GitHubClientId = ""
var GitHubClientSecret = ""

var WeChatServerAddress = ""
var WeChatServerToken = ""
var WeChatAccountQRCodeImageURL = ""

var TurnstileSiteKey = ""
var TurnstileSecretKey = ""

const (
	RoleGuestUser  = 0
	RoleCommonUser = 1
	RoleAdminUser  = 10
	RoleRootUser   = 100
)

var (
	FileUploadPermission    = RoleGuestUser
	FileDownloadPermission  = RoleGuestUser
	ImageUploadPermission   = RoleGuestUser
	ImageDownloadPermission = RoleGuestUser
)

// All duration's unit is seconds
// Shouldn't larger then RateLimitKeyExpirationDuration
var (
	GlobalApiRateLimitNum            = 60
	GlobalApiRateLimitDuration int64 = 3 * 60

	GlobalWebRateLimitNum            = 60
	GlobalWebRateLimitDuration int64 = 3 * 60

	UploadRateLimitNum            = 10
	UploadRateLimitDuration int64 = 60

	DownloadRateLimitNum            = 10
	DownloadRateLimitDuration int64 = 60

	CriticalRateLimitNum            = 20
	CriticalRateLimitDuration int64 = 20 * 60
)

var RateLimitKeyExpirationDuration = 20 * time.Minute

const (
	UserStatusNonExisted = 0
	UserStatusEnabled    = 1 // don't use 0, 0 is the default value!
	UserStatusDisabled   = 2 // also don't use 0
)

const (
	SendEmailToOthersAllowed    = 1
	SendEmailToOthersDisallowed = 2
)

const (
	SaveMessageToDatabaseAllowed    = 1
	SaveMessageToDatabaseDisallowed = 2
)

const (
	MessageSendStatusUnknown      = 0
	MessageSendStatusPending      = 1
	MessageSendStatusSent         = 2
	MessageSendStatusFailed       = 3
	MessageSendStatusAsyncPending = 4
)

const (
	ChannelStatusUnknown  = 0
	ChannelStatusEnabled  = 1
	ChannelStatusDisabled = 2
)

const (
	WebhookStatusUnknown  = 0
	WebhookStatusEnabled  = 1
	WebhookStatusDisabled = 2
)
