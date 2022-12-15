package channel

import (
	"message-pusher/common"
	"message-pusher/model"
	"sync"
	"time"
)

type TokenStoreItem interface {
	Key() string
	Token() string
	Refresh()
	IsFilled() bool
}

type tokenStore struct {
	Map               map[string]*TokenStoreItem
	Mutex             sync.RWMutex
	ExpirationSeconds int
}

var s tokenStore

func TokenStoreInit() {
	s.Map = make(map[string]*TokenStoreItem)
	s.ExpirationSeconds = 2 * 60 * 60
	go func() {
		users, err := model.GetAllUsersWithSecrets()
		if err != nil {
			common.FatalLog(err.Error())
		}
		var items []TokenStoreItem
		for _, user := range users {
			if user.WeChatTestAccountId != "" {
				item := &WeChatTestAccountTokenStoreItem{
					AppID:     user.WeChatTestAccountId,
					AppSecret: user.WeChatTestAccountSecret,
				}
				items = append(items, item)
			}
			if user.WeChatCorpAccountId != "" {
				item := &WeChatCorpAccountTokenStoreItem{
					CorpId:      user.WeChatCorpAccountId,
					AgentSecret: user.WeChatCorpAccountAgentSecret,
					AgentId:     user.WeChatCorpAccountAgentId,
				}
				items = append(items, item)
			}
		}
		s.Mutex.RLock()
		for i := range items {
			// s.Map[item.Key()] = &item  // This is wrong, you are getting the address of a local variable!
			s.Map[items[i].Key()] = &items[i]
		}
		s.Mutex.RUnlock()
		for {
			s.Mutex.RLock()
			var tmpMap = make(map[string]*TokenStoreItem)
			for k, v := range s.Map {
				tmpMap[k] = v
			}
			s.Mutex.RUnlock()
			for k := range tmpMap {
				(*tmpMap[k]).Refresh()
			}
			s.Mutex.RLock()
			// we shouldn't directly replace the old map with the new map, cause the old map's keys may already change
			for k := range s.Map {
				v, okay := tmpMap[k]
				if okay {
					s.Map[k] = v
				}
			}
			sleepDuration := common.Max(s.ExpirationSeconds, 60)
			s.Mutex.RUnlock()
			time.Sleep(time.Duration(sleepDuration) * time.Second)
		}
	}()
}

// TokenStoreAddItem It's okay to add an incomplete item.
func TokenStoreAddItem(item TokenStoreItem) {
	if !item.IsFilled() {
		return
	}
	item.Refresh()
	s.Mutex.RLock()
	s.Map[item.Key()] = &item
	s.Mutex.RUnlock()
}

func TokenStoreRemoveItem(item TokenStoreItem) {
	s.Mutex.RLock()
	delete(s.Map, item.Key())
	s.Mutex.RUnlock()
}

func TokenStoreAddUser(user *model.User) {
	testItem := WeChatTestAccountTokenStoreItem{
		AppID:     user.WeChatTestAccountId,
		AppSecret: user.WeChatTestAccountSecret,
	}
	TokenStoreAddItem(&testItem)
	corpItem := WeChatCorpAccountTokenStoreItem{
		CorpId:      user.WeChatCorpAccountId,
		AgentSecret: user.WeChatCorpAccountAgentSecret,
		AgentId:     user.WeChatCorpAccountAgentId,
	}
	TokenStoreAddItem(&corpItem)
}

func TokenStoreUpdateUser(cleanUser *model.User, originUser *model.User) {
	// WeChat Test Account
	// The fields of cleanUser may be incomplete!
	if cleanUser.WeChatTestAccountId == originUser.WeChatTestAccountId {
		cleanUser.WeChatTestAccountId = ""
	}
	if cleanUser.WeChatTestAccountSecret == originUser.WeChatTestAccountSecret {
		cleanUser.WeChatTestAccountSecret = ""
	}
	// This means the user updated those fields.
	if cleanUser.WeChatTestAccountId != "" || cleanUser.WeChatTestAccountSecret != "" {
		oldWeChatTestAccountTokenStoreItem := WeChatTestAccountTokenStoreItem{
			AppID:     originUser.WeChatTestAccountId,
			AppSecret: originUser.WeChatTestAccountSecret,
		}
		// Yeah, it's a deep copy.
		newWeChatTestAccountTokenStoreItem := oldWeChatTestAccountTokenStoreItem
		if cleanUser.WeChatTestAccountId != "" {
			newWeChatTestAccountTokenStoreItem.AppID = cleanUser.WeChatTestAccountId
		}
		if cleanUser.WeChatTestAccountSecret != "" {
			newWeChatTestAccountTokenStoreItem.AppSecret = cleanUser.WeChatTestAccountSecret
		}
		if !oldWeChatTestAccountTokenStoreItem.IsShared() {
			TokenStoreRemoveItem(&oldWeChatTestAccountTokenStoreItem)
		}
		TokenStoreAddItem(&newWeChatTestAccountTokenStoreItem)
	}

	// WeChat Corp Account
	if cleanUser.WeChatCorpAccountId == originUser.WeChatCorpAccountId {
		cleanUser.WeChatCorpAccountId = ""
	}
	if cleanUser.WeChatCorpAccountAgentId == originUser.WeChatCorpAccountAgentId {
		cleanUser.WeChatCorpAccountAgentId = ""
	}
	if cleanUser.WeChatCorpAccountAgentSecret == originUser.WeChatCorpAccountAgentSecret {
		cleanUser.WeChatCorpAccountAgentSecret = ""
	}
	if cleanUser.WeChatCorpAccountId != "" || cleanUser.WeChatCorpAccountAgentId != "" || cleanUser.WeChatCorpAccountAgentSecret != "" {
		oldWeChatCorpAccountTokenStoreItem := WeChatCorpAccountTokenStoreItem{
			CorpId:      originUser.WeChatCorpAccountId,
			AgentSecret: originUser.WeChatCorpAccountAgentSecret,
			AgentId:     originUser.WeChatCorpAccountAgentId,
		}
		newWeChatCorpAccountTokenStoreItem := oldWeChatCorpAccountTokenStoreItem
		if cleanUser.WeChatCorpAccountId != "" {
			newWeChatCorpAccountTokenStoreItem.CorpId = cleanUser.WeChatCorpAccountId
		}
		if cleanUser.WeChatCorpAccountAgentSecret != "" {
			newWeChatCorpAccountTokenStoreItem.AgentSecret = cleanUser.WeChatCorpAccountAgentSecret
		}
		if cleanUser.WeChatCorpAccountAgentId != "" {
			newWeChatCorpAccountTokenStoreItem.AgentId = cleanUser.WeChatCorpAccountAgentId
		}
		if !oldWeChatCorpAccountTokenStoreItem.IsShared() {
			TokenStoreRemoveItem(&oldWeChatCorpAccountTokenStoreItem)
		}
		TokenStoreAddItem(&newWeChatCorpAccountTokenStoreItem)
	}
}

// TokenStoreRemoveUser
// user must be filled.
// It's okay to delete a user that don't have an item here.
func TokenStoreRemoveUser(user *model.User) {
	testAccountTokenStoreItem := WeChatTestAccountTokenStoreItem{
		AppID:     user.WeChatTestAccountId,
		AppSecret: user.WeChatTestAccountSecret,
	}
	if !testAccountTokenStoreItem.IsShared() {
		TokenStoreRemoveItem(&testAccountTokenStoreItem)
	}
	corpAccountTokenStoreItem := WeChatCorpAccountTokenStoreItem{
		CorpId:      user.WeChatCorpAccountId,
		AgentSecret: user.WeChatCorpAccountAgentSecret,
		AgentId:     user.WeChatCorpAccountAgentId,
	}
	if !corpAccountTokenStoreItem.IsShared() {
		TokenStoreRemoveItem(&corpAccountTokenStoreItem)
	}
}

func TokenStoreGetToken(key string) string {
	s.Mutex.RLock()
	defer s.Mutex.RUnlock()
	item, ok := s.Map[key]
	if ok {
		return (*item).Token()
	}
	common.SysError("token for " + key + " is blank!")
	return ""
}
