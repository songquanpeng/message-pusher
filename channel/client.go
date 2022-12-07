package channel

import (
	"errors"
	"github.com/gorilla/websocket"
	"message-pusher/common"
	"message-pusher/model"
	"sync"
)

var clientConnMap map[int]*websocket.Conn
var clientConnMapMutex sync.Mutex

func init() {
	clientConnMapMutex.Lock()
	clientConnMap = make(map[int]*websocket.Conn)
	clientConnMapMutex.Unlock()
}

func SendMessageWithConn(message *Message, conn *websocket.Conn) error {
	return conn.WriteJSON(message)
}

func LogoutClient(userId int) {
	clientConnMapMutex.Lock()
	delete(clientConnMap, userId)
	clientConnMapMutex.Unlock()
}

func RegisterClient(userId int, conn *websocket.Conn) {
	clientConnMapMutex.Lock()
	oldConn, existed := clientConnMap[userId]
	clientConnMapMutex.Unlock()
	if existed {
		byeMessage := &Message{
			Title:       common.SystemName,
			Description: "其他客户端已连接服务器，本客户端已被挤下线！",
		}
		err := SendMessageWithConn(byeMessage, oldConn)
		if err != nil {
			common.SysError("error send message to client: " + err.Error())
		}
		err = oldConn.Close()
		if err != nil {
			common.SysError("error close WebSocket connection: " + err.Error())
		}
	}
	helloMessage := &Message{
		Title:       common.SystemName,
		Description: "客户端连接成功！",
	}
	err := SendMessageWithConn(helloMessage, conn)
	if err != nil {
		common.SysError("error send message to client: " + err.Error())
		return
	} else {
		clientConnMapMutex.Lock()
		clientConnMap[userId] = conn
		clientConnMapMutex.Unlock()
		conn.SetCloseHandler(func(code int, text string) error {
			LogoutClient(userId)
			return nil
		})
	}
}

func SendClientMessage(message *Message, user *model.User) error {
	if user.ClientSecret == "" {
		return errors.New("未配置 WebSocket 客户端消息推送方式")
	}
	clientConnMapMutex.Lock()
	conn, existed := clientConnMap[user.Id]
	clientConnMapMutex.Unlock()
	if !existed {
		return errors.New("客户端未连接")
	}
	err := SendMessageWithConn(message, conn)
	if err != nil {
		LogoutClient(user.Id)
	}
	return err
}
