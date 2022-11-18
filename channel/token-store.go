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

func TokenStoreAddItem(item *TokenStoreItem) {
	(*item).Refresh()
	s.Mutex.RLock()
	s.Map[(*item).Key()] = item
	s.Mutex.RUnlock()
}

func TokenStoreRemoveItem(item *TokenStoreItem) {
	s.Mutex.RLock()
	delete(s.Map, (*item).Key())
	s.Mutex.RUnlock()
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
