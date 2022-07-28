# Message Pusher 桌面客户端
## 描述
该客户端用于支持 `client` 消息推送方式。

注意，为防止未授权的 WebSocket 连接，推荐设置 ACCESS_TOKEN。

启动参数：`./client.exe --url http://your.domain.com:port/prefix --token private`

也可以通过设置环境变量来传递配置：`MESSAGE_PUSHER_URL` & `MESSAGE_PUSHER_TOKEN`

## 原理
客户端启动后与 message-pusher 服务器建立一个 WebSocket 连接，通过该连接接受要推送消息，并调用系统的消息通知接口进行消息通知。

## 安装
1. 首先前往 [Release 页面](https://github.com/songquanpeng/message-pusher/releases)下载可执行文件和 vbs 脚本文件（该脚本文件目的是为了隐藏窗口）。
2. 编辑 vbs 脚本文件，将其中的可执行文件的路径和后面的参数改成符合你的情况的值。
3. 之后对 vbs 脚本文件右键创建快捷方式。
5. 之后把该快捷方式放到开机启动文件夹内：`C:\ProgramData\Microsoft\Windows\Start Menu\Programs\StartUp`
