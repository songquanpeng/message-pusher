<p align="center">
  <a href="https://github.com/songquanpeng/message-pusher"><img src="https://raw.githubusercontent.com/songquanpeng/message-pusher/master/web/public/logo.png" width="150" height="150" alt="message-pusher logo"></a>
</p>

<div align="center">

# 消息推送服务

_✨ 搭建专属于你的消息推送服务，支持多种消息推送方式，支持 Markdown，仅单可执行文件，开箱即用✨_

</div>

<p align="center">
  <a href="https://raw.githubusercontent.com/songquanpeng/message-pusher/main/LICENSE">
    <img src="https://img.shields.io/github/license/songquanpeng/message-pusher?color=brightgreen" alt="license">
  </a>
  <a href="https://github.com/songquanpeng/message-pusher/releases/latest">
    <img src="https://img.shields.io/github/v/release/songquanpeng/message-pusher?color=brightgreen&include_prereleases" alt="release">
  </a>
  <a href="https://github.com/songquanpeng/message-pusher/releases/latest">
    <img src="https://img.shields.io/github/downloads/songquanpeng/message-pusher/total?color=brightgreen&include_prereleases" alt="release">
  </a>
  <a href="https://goreportcard.com/report/github.com/songquanpeng/go-file">
    <img src="https://goreportcard.com/badge/github.com/songquanpeng/message-pusher" alt="GoReportCard">
  </a>
</p>

<p align="center">
  <a href="https://github.com/songquanpeng/message-pusher/releases">程序下载</a>
  ·
  <a href="https://github.com/songquanpeng/message-pusher#用法">使用教程</a>
  ·
  <a href="https://github.com/songquanpeng/message-pusher/issues">意见反馈</a>
  ·
  <a href="https://message-pusher.vercel.app/">在线演示</a>
</p>

> 注意：Message Pusher 原本基于 Node.js 开发，当前版本为 Golang 重构版本，目前处于预发布阶段，可能不太稳定，如果需要稳定版请使用[旧版本](https://github.com/songquanpeng/message-pusher/releases/tag/v0.2.3)。

## 功能
1. 多种消息推送方式：
  + [x] 邮件消息
  + [x] 微信测试号
  + [x] 企业微信
  + [x] 飞书群机器人
  + [x] 钉钉群机器人
  + [ ] 桌面客户端
  + [ ] Bark
2. 多种用户登录注册方式：
  + [x] 邮箱登录注册以及通过邮箱进行密码重置。
  + [x] [GitHub 开放授权](https://github.com/settings/applications/new)。
  + [x] 微信公众号授权（需要额外部署 [WeChat Server](https://github.com/songquanpeng/wechat-server)）。
3. 支持 Markdown。
4. 支持用户管理。
5. Cloudflare Turnstile 用户校验。
6. 支持在线发布公告，设置关于界面以及页脚。

## 部署
1. 从 [GitHub Releases](https://github.com/songquanpeng/message-pusher/releases/latest) 下载可执行文件或者从源码编译：
   ```shell
   git clone https://github.com/songquanpeng/message-pusher.git
   go mod download
   go build -ldflags "-s -w" -o message-pusher
   ````
2. 运行：
   ```shell
   chmod u+x message-pusher
   ./message-pusher --port 3000 --log-dir ./logs
   ```
3. 访问 [http://localhost:3000/](http://localhost:3000/) 并登录。初始账号用户名为 `root`，密码为 `123456`。

## 配置
系统本身仅需要下载一个可执行文件即可开始使用，无其他依赖。

你可以通过设置环境变量或者命令行参数进行配置。

等到系统启动后，使用 `root` 用户登录系统并做进一步的配置。

### 环境变量
1. `REDIS_CONN_STRING`：设置之后将使用 Redis 作为请求频率限制的存储，而非使用内存存储。
    + 例子：`REDIS_CONN_STRING=redis://default:redispw@localhost:49153`
2. `SESSION_SECRET`：设置之后将使用固定的会话密钥，这样系统重新启动后已登录用户的 cookie 将依旧有效。
    + 例子：`SESSION_SECRET=random_string`
3. `SQL_DSN`：设置之后将使用指定数据库而非 SQLite。
    + 例子：`SQL_DSN=root:123456@tcp(localhost:3306)/message-pusher`

### 命令行参数
1. `--port <port_number>`: 指定服务器监听的端口号，默认为 `3000`。
    + 例子：`--port 3000`
2. `--log-dir <log_dir>`: 指定日志文件夹，如果没有设置，日志将不会被保存。
    + 例子：`--log-dir ./logs`
3. `--version`: 打印系统版本号并退出。


### 进一步的配置
1. 系统设置：
   1. 填写服务器地址。
   2. 配置登录注册选项，如果系统不对外开发，请取消选择`允许新用户注册`。
   3. 配置 SMTP 服务，可以使用 QQ 邮箱的 SMTP 服务。
   4. 其他配置可选，请按照页面上的指示完成配置。
2. 个人设置：
   1. 点击`更新用户信息`更改默认用户名和密码。
   2. 点击`绑定邮箱地址`绑定邮箱以启用邮件消息推送方式。
3. 推送设置：
   1. 设置`默认推送方式`，默认为通过邮件进行推送。
   2. 设置`推送 token`，用以推送 API 调用鉴权，如果不需要留空即可。
   3. 设置其他推送方式，按照页面上的指示即可，完成配置后点击对应的`测试`按钮即可测试配置是否成功。
4. 其他设置：如果系统对外提供服务，本系统也提供了一定的个性化设置功能，你可以设置关于界面和页脚，以及发布公告。

## 用法
1. 消息推送 API URL：`https://<domain>/push/<username>`
   + 将上面的 `<domain>` 以及 `<username>` 替换为真实值，例如：`https://push.mydomain.cn/admin`
2. `GET` 请求方式：`https://<domain>/push/<username>?title=<标题>&description=<描述>&content=<Markdown 文本>&channel=<推送方式>&token=<推送 token>`
   1. `title`：选填，受限于具体的消息推送方式，其可能被忽略。
   2. `description`：必填，可以替换为 `desp`。
   3. `content`：选填，受限于具体的消息推送方式，Markdown 语法的支持有所区别。
   4. `channel`：选填，如果不填则系统使用你在后台设置的默认推送方式。可选的推送方式有：
      1. `email`：通过发送邮件的方式进行推送。
      2. `test`：通过微信测试号进行推送。
      3. `corp`：通过企业微信的应用号进行推送。
      4. `lark`：通过飞书群机器人进行推送。
      5. `ding`：通过钉钉群机器人进行推送。
   5. `token`：如果你在后台设置了推送 token，则此项必填。另外可以通过设置 HTTP `Authorization` 头部设置此项。
3. `POST` 请求方式：字段与上面 `GET` 请求方式保持一致。

**示例：**
```python
import requests

# GET 方式
res = requests.get("https://your.domain.com/push/username?title={}&description={}&token={}".format("标题", "描述", "666"))

# POST 方式
res = requests.post("https://your.domain.com/push/username", data={
    "title": "标题",
    "description" : "描述",
    "content": "**Markdown 内容**",
    "token": "6666"
})

print(res.text)
# 输出为：{"success":true,"message":"ok"}
```

## 其他
1. `v0.3` 之前的版本基于 Node.js，你可以切换到 [`nodejs`](https://github.com/songquanpeng/message-pusher/tree/nodejs) 分支查看，该版本不再有功能性更新。
2. `v0.3` 以及后续版本基于 Gin Template [`v0.2.1`](https://github.com/songquanpeng/gin-template) 版本开发。