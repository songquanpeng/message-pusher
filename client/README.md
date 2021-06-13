# Message Pusher 桌面客户端
## 描述
该客户端用于支持 `client` 消息推送方式。

注意，为防止未授权的 WebSocket 连接，使用该消息推送方式你应设置 ACCESS_TOKEN。

## 原理
客户端启动后与 message-pusher 服务器建立一个 WebSocket 连接，通过该连接接受要推送消息，并调用系统的消息通知接口进行消息通知。

## 安装
推荐将其注册为开机启动的服务，二进制包请前往 [Release 页面](https://github.com/songquanpeng/message-pusher/releases)下载。

启动参数：`./client.exe -server your.domain.com:port -prefix admin -token private`
