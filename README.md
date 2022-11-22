<p align="center">
  <a href="https://github.com/songquanpeng/message-pusher"><img src="https://raw.githubusercontent.com/songquanpeng/message-pusher/master/web/public/logo.png" width="150" height="150" alt="message-pusher logo"></a>
</p>

<div align="center">

# 消息推送服务

_✨ 搭建专属于你的消息推送服务，支持通过邮件，微信测试号，企业微信，飞书，钉钉等推送消息，支持 Markdown✨_

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

## 功能
+ [x] 多种消息推送方式：
  + [x] 邮件消息
  + [x] 微信测试号
  + [x] 企业微信
  + [x] 飞书群机器人
  + [x] 钉钉群机器人
  + [ ] 桌面客户端
  + [ ] Bark
+ [x] 多种用户验证方式：
  + [x] 邮箱登录注册以及通过邮箱进行密码重置
  + [x] [GitHub 开放授权](https://github.com/settings/applications/new)
  + [x] 微信公众号授权（需要 [wechat-server](https://github.com/songquanpeng/wechat-server)）
+ [x] Cloudflare Turnstile 用户校验

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
系统本身开箱即用。

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


## 用法
TODO