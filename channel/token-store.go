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
					CorpId:     user.WeChatCorpAccountId,
					CorpSecret: user.WeChatCorpAccountSecret,
					AgentId:    user.WeChatCorpAccountAgentId,
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

func TokenStoreAddItem(item TokenStoreItem) {
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

func TokenStoreUpdateUser(cleanUser *model.User, originUser *model.User) {
	if cleanUser.WeChatTestAccountId == originUser.WeChatTestAccountId {
		cleanUser.WeChatTestAccountId = ""
	}
	if cleanUser.WeChatTestAccountSecret == originUser.WeChatTestAccountSecret {
		cleanUser.WeChatTestAccountSecret = ""
	}
	if cleanUser.WeChatTestAccountId != "" || cleanUser.WeChatTestAccountSecret != "" {
		oldWeChatTestAccountTokenStoreItem := WeChatTestAccountTokenStoreItem{
			AppID:     originUser.WeChatTestAccountId,
			AppSecret: originUser.WeChatTestAccountSecret,
		}
		newWeChatTestAccountTokenStoreItem := oldWeChatTestAccountTokenStoreItem
		if cleanUser.WeChatTestAccountId != "" {
			newWeChatTestAccountTokenStoreItem.AppID = cleanUser.WeChatTestAccountId
		}
		if cleanUser.WeChatTestAccountSecret != "" {
			newWeChatTestAccountTokenStoreItem.AppSecret = cleanUser.WeChatTestAccountSecret
		}
		if !model.IsWeChatTestAccountTokenShared(&oldWeChatTestAccountTokenStoreItem) {
			TokenStoreRemoveItem(&oldWeChatTestAccountTokenStoreItem)
		}
		TokenStoreAddItem(&newWeChatTestAccountTokenStoreItem)
	}
	if cleanUser.WeChatCorpAccountId == originUser.WeChatCorpAccountId {
		cleanUser.WeChatCorpAccountId = ""
	}
	if cleanUser.WeChatCorpAccountAgentId == originUser.WeChatCorpAccountAgentId {
		cleanUser.WeChatCorpAccountAgentId = ""
	}
	if cleanUser.WeChatCorpAccountSecret == originUser.WeChatCorpAccountSecret {
		cleanUser.WeChatCorpAccountSecret = ""
	}
	if cleanUser.WeChatCorpAccountId != "" || cleanUser.WeChatCorpAccountAgentId != "" || cleanUser.WeChatCorpAccountSecret != "" {
		oldWeChatCorpAccountTokenStoreItem := WeChatCorpAccountTokenStoreItem{
			CorpId:     cleanUser.WeChatCorpAccountId,
			CorpSecret: cleanUser.WeChatCorpAccountSecret,
			AgentId:    cleanUser.WeChatCorpAccountAgentId,
		}
		newWeChatCorpAccountTokenStoreItem := oldWeChatCorpAccountTokenStoreItem
		if cleanUser.WeChatCorpAccountId != "" {
			newWeChatCorpAccountTokenStoreItem.CorpId = cleanUser.WeChatCorpAccountId
		}
		if cleanUser.WeChatCorpAccountSecret != "" {
			newWeChatCorpAccountTokenStoreItem.CorpSecret = cleanUser.WeChatCorpAccountSecret
		}
		if cleanUser.WeChatCorpAccountAgentId != "" {
			newWeChatCorpAccountTokenStoreItem.AgentId = cleanUser.WeChatCorpAccountAgentId
		}
		if !model.IsWeChatCorpAccountTokenShared(&oldWeChatCorpAccountTokenStoreItem) {
			TokenStoreRemoveItem(&oldWeChatCorpAccountTokenStoreItem)
		}
		TokenStoreAddItem(&newWeChatCorpAccountTokenStoreItem)
	}
}

// TokenStoreRemoveUser user must be filled
func TokenStoreRemoveUser(user *model.User) {
	testAccountTokenStoreItem := WeChatTestAccountTokenStoreItem{
		AppID:     user.WeChatTestAccountId,
		AppSecret: user.WeChatTestAccountSecret,
	}
	if !model.IsWeChatTestAccountTokenShared(&testAccountTokenStoreItem) {
		TokenStoreRemoveItem(&testAccountTokenStoreItem)
	}
	corpAccountTokenStoreItem := WeChatCorpAccountTokenStoreItem{
		CorpId:     user.WeChatCorpAccountId,
		CorpSecret: user.WeChatCorpAccountSecret,
		AgentId:    user.WeChatCorpAccountAgentId,
	}
	if !model.IsWeChatCorpAccountTokenShared(&corpAccountTokenStoreItem) {
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
