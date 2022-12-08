# API 文档

## WebSocket 客户端
你可以使用 WebSocket 客户端连接服务器，具体的客户端的类型可以是桌面应用，手机应用或 Web 应用等，只要遵循下述协议即可。

目前同一时间一个用户只能有一个客户端连接到服务器，之前已连接的客户端将被断开连接。

### 连接协议
1. API 端点为：`ws://<domain>:<port>/api/register_client/<username>?secret=<secret>`
2. 如果启用了 HTTPS，则需要将 `ws` 替换为 `wss`。
3. 上述 `secret` 为用户在后台设置的 `服务器连接密钥`，而非 `推送 token`。

### 接收消息
1. 消息编码格式为 JSON。
2. 具体内容：
   ```json
   {
    "title": "标题",
    "description": "描述",
    "content": "内容",
    "html_content": "转换为 HTML 后的内容",
    "url": "链接"
   }
   ```
   可能还有多余字段，忽略即可。    

### 连接保活
1. 每 `56s` 服务器将发送 `ping` 报文，客户端需要在 `60s` 回复 `pong` 报文，否则服务端将不再维护该连接。
2. 服务端会主动回复客户端发来的 `ping` 报文。

### 实现列表
当前可用的 WebSocket 客户端实现有：
1. 官方 WebSocket 桌面客户端实现：https://github.com/songquanpeng/personal-assistant
2. 待补充

欢迎在此提交你的客户端实现。