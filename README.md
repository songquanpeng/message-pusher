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
  <a href="https://hub.docker.com/repository/docker/justsong/message-pusher">
    <img src="https://img.shields.io/docker/pulls/justsong/message-pusher?color=brightgreen" alt="docker pull">
  </a>
  <a href="https://github.com/songquanpeng/message-pusher/releases/latest">
    <img src="https://img.shields.io/github/downloads/songquanpeng/message-pusher/total?color=brightgreen&include_prereleases" alt="release">
  </a>
  <a href="https://goreportcard.com/report/github.com/songquanpeng/message-pusher">
    <img src="https://goreportcard.com/badge/github.com/songquanpeng/message-pusher" alt="GoReportCard">
  </a>
</p>

<p align="center">
  <a href="https://github.com/songquanpeng/message-pusher/releases">程序下载</a>
  ·
  <a href="#部署">部署教程</a>
  ·
  <a href="#用法">使用教程</a>
  ·
  <a href="https://github.com/songquanpeng/message-pusher/issues">意见反馈</a>
  ·
  <a href="https://message-pusher.onrender.com/">在线演示</a>
</p>

> **Note**：官方部署站 https://msgpusher.com 现已上线，当前开放注册，欢迎使用。如果收到积极反馈未来可以考虑换用延迟更低的服务器。

> **Warning**：从 `v0.3` 版本升级到 `v0.4` 版本需要手动迁移数据库，具体方法见[迁移数据库](#迁移数据库)。

## 描述
1. **多种消息推送方式**：
   + 邮件消息，
   + 微信测试号，
   + QQ，
   + 企业微信应用号，
   + 企业微信群机器人
   + 飞书自建应用
   + 飞书群机器人，
   + 钉钉群机器人，
   + Bark App,
   + WebSocket 客户端（[官方客户端](https://github.com/songquanpeng/personal-assistant)，[接入文档](./docs/API.md#websocket-客户端)），
   + Telegram 机器人，
   + Discord 群机器人，
   + 腾讯云自定义告警：免费的短信提醒，
   + **群组消息**：可以将多个推送通道组合成一个群组，然后向群组发送消息，可以实现一次性推送到多个渠道的功能，
   + **自定义消息**：可以自定义消息请求 URL 和请求体格式，实现与其他服务的对接，支持[众多第三方服务](https://iamazing.cn/page/message-pusher-common-custom-templates)。
2. 支持**自定义 Webhook，反向适配各种调用平台**，你可以接入各种已有的系统，而无需修改其代码。
3. 支持在 Web 端编辑 & 管理发送的消息，新消息发送后 Web 端**即时刷新**。
4. 支持**异步**消息发送。
5. 支持用户管理，支持多种用户登录注册方式：
   + 邮箱登录注册以及通过邮箱进行密码重置。
   + [GitHub 开放授权](https://github.com/settings/applications/new)。
   + 微信公众号授权（需要额外部署 [WeChat Server](https://github.com/songquanpeng/wechat-server)）。
6. 支持 Markdown。
7. 支持 Cloudflare Turnstile 用户校验。
8. 支持在线发布公告，设置关于界面以及页脚。
9. API **兼容**其他消息推送服务，例如 [Server 酱](https://sct.ftqq.com/)。

## 用途
1. [整合进自己的博客系统，每当有人登录时发微信消息提醒](https://github.com/songquanpeng/blog/blob/486d63e96ef7906a6c767653a20ec2d3278e9a4a/routes/user.js#L27)。
2. 在进行深度学习模型训练时，在每个 epoch 结束后[将关键数据发送到微信](https://github.com/songquanpeng/pytorch-template/blob/b2ba113659056080d3009b3014a67e977e2851bf/solver/solver.py#L223)以方便及时监控。
3. 在各种脚本运行结束后发消息提醒，例如[监控 GitHub Star 数量的脚本](https://github.com/songquanpeng/scripts/blob/main/star_watcher.py)，又例如[自动健康填报的脚本](https://github.com/songquanpeng/daily-report)，用来通知运行结果。
4. 为[其他系统](https://github.com/songquanpeng/personal-assistant#个人助理应用)提供消息推送功能。

## 部署
### 通过 Docker 部署
部署：`docker run -d --restart always --name message-pusher -p 3000:3000 -e TZ=Asia/Shanghai -v /home/ubuntu/data/message-pusher:/data justsong/message-pusher`

更新：`docker run --rm -v /var/run/docker.sock:/var/run/docker.sock containrrr/watchtower -cR`

开放的端口号为 3000，之后用 Nginx 配置域名，反代以及 SSL 证书即可，具体参考[详细部署教程](https://iamazing.cn/page/how-to-deploy-a-website)。

数据将会保存在宿主机的 `/home/ubuntu/data/message-pusher` 目录（只有一个 SQLite 数据库文件），请确保该目录存在且具有写入权限，或者更改为合适的目录。

Nginx 的参考配置：
```
server{
   server_name msgpusher.com;  # 请根据实际情况修改你的域名
   
   location / {
          client_max_body_size  64m;
          proxy_http_version 1.1;
          proxy_pass http://localhost:3000;  # 请根据实际情况修改你的端口
          proxy_set_header Host $host;
          proxy_set_header X-Forwarded-For $remote_addr;
          proxy_cache_bypass $http_upgrade;
          proxy_set_header Accept-Encoding gzip;
   }
}
```

之后使用 Let's Encrypt 的 certbot 配置 HTTPS：
```bash
# Ubuntu 安装 certbot：
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
# 生成证书 & 修改 Nginx 配置
sudo certbot --nginx
# 根据指示进行操作
# 重启 Nginx
sudo service nginx restart
```

### 手动部署
1. 从 [GitHub Releases](https://github.com/songquanpeng/message-pusher/releases/latest) 下载可执行文件或者从源码编译：
   ```shell
   git clone https://github.com/songquanpeng/message-pusher.git
   cd message-pusher/web
   npm install
   npm run build
   cd ..
   go mod download
   go build -ldflags "-s -w" -o message-pusher
   ````
2. 运行：
   ```shell
   chmod u+x message-pusher
   ./message-pusher --port 3000 --log-dir ./logs
   ```
3. 访问 [http://localhost:3000/](http://localhost:3000/) 并登录。初始账号用户名为 `root`，密码为 `123456`。

如果服务需要长久运行，只是单纯地启动是不够的，[详细部署教程](https://iamazing.cn/page/how-to-deploy-a-website)。

### 注意
如果需要使用 WebSocket 客户端推送功能，则 Nginx 的配置文件中 `proxy_read_timeout` 和 `proxy_send_timeout` 务必设置超过 1 分钟。

推荐设置：
```
proxy_read_timeout 300s;
proxy_send_timeout 300s;   
```

## 配置
系统本身仅需要下载一个可执行文件即可开始使用，无其他依赖。

你可以通过设置环境变量或者命令行参数进行配置。

等到系统启动后，使用 `root` 用户登录系统并做进一步的配置，默认密码为 `123456`。

### 环境变量
1. `REDIS_CONN_STRING`：设置之后将使用 Redis 作为请求频率限制的存储，而非使用内存存储。
    + 例子：`REDIS_CONN_STRING=redis://default:redispw@localhost:49153`
2. `SESSION_SECRET`：设置之后将使用固定的会话密钥，这样系统重新启动后已登录用户的 cookie 将依旧有效。
    + 例子：`SESSION_SECRET=random_string`
3. `SQL_DSN`：设置之后将使用指定数据库而非 SQLite。
    + 例子：`SQL_DSN=root:123456@tcp(localhost:3306)/message-pusher`

注意：使用 Docker 部署时，请使用 `-e key=value` 设置环境变量。 

例子：`docker run -e SESSION_SECRET=random_string ...`

### 命令行参数
1. `--port <port_number>`: 指定服务器监听的端口号，默认为 `3000`。
    + 例子：`--port 3000`
2. `--log-dir <log_dir>`: 指定日志文件夹，如果没有设置，日志将不会被保存。
    + 例子：`--log-dir ./logs`
3. `--version`: 打印系统版本号并退出。


### 进一步的配置
1. 系统设置：
   1. 填写服务器地址。
   2. 配置登录注册选项，如果系统不对外开放，请取消选择`允许新用户注册`。
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
   + 将上面的 `<domain>` 以及 `<username>` 替换为真实值，例如：`https://push.mydomain.cn/push/admin`
2. `GET` 请求方式：`https://<domain>/push/<username>?title=<标题>&description=<描述>&content=<Markdown 文本>&channel=<推送方式>&token=<推送 token>`
   1. `title`：选填，受限于具体的消息推送方式，其可能被忽略。
   2. `description`：必填，可以替换为 `desp`。
   3. `content`：选填，受限于具体的消息推送方式，Markdown 语法的支持有所区别。
   4. `channel`：选填，如果不填则系统使用你在后台设置的默认推送通道。注意，此处填的是消息通道的名称，而非类型。可选的推送通道类型有：
      1. `email`：通过发送邮件的方式进行推送（使用 `title` 或 `description` 字段设置邮件主题，使用 `content` 字段设置正文，支持完整的 Markdown 语法）。
      2. `test`：通过微信测试号进行推送（使用 `description` 字段设置模板消息内容，不支持 Markdown）。
      3. `corp_app`：通过企业微信应用号进行推送（仅当使用企业微信 APP 时，如果设置了 `content` 字段，`title` 和 `description` 字段会被忽略；使用微信中的企业微信插件时正常）。
      4. `lark_app`：通过飞书自建应用进行推送。
      5. `corp`：通过企业微信群机器人推送（设置 `content` 字段则将渲染 Markdown 消息，支持 Markdown 的子集；设置 `description` 字段则为普通文本消息）。
      6. `lark`：通过飞书群机器人进行推送（注意事项同上）。
      7. `ding`：通过钉钉群机器人进行推送（注意事项同上）。
      8. `bark`：通过 Bark 进行推送（支持 `title` 和 `description` 字段）。
      9. `client`：通过 WebSocket 客户端进行推送（支持 `title` 和 `description` 字段）。
      10. `telegram`：通过 Telegram 机器人进行推送（`description` 或 `content` 字段二选一，支持 Markdown 的子集）。
      11. `discord`：通过 Discord 群机器人进行推送（注意事项同上）。
      12. `one_api`：通过 OneAPI 协议推送消息到 QQ。
      13. `group`：通过预先配置的消息推送通道群组进行推送。
      14. `custom`：通过预先配置好的自定义推送通道进行推送。
      15. `tencent_alarm`：通过腾讯云监控告警进行推送，仅支持 `description` 字段。
      16. `none`：仅保存到数据库，不做推送。
   5. `token`：如果你在后台设置了推送 token，则此项必填。另外可以通过设置 HTTP `Authorization` 头部设置此项。
   6. `url`：选填，如果不填则系统自动为消息生成 URL，其内容为消息详情。
   7. `to`：选填，推送给指定用户，如果不填则默认推送给自己，受限于具体的消息推送方式，有些推送方式不支持此项。
      1. `@all`：推送给所有用户。
      2. `user1|user2|user3`：推送给多个用户，用户之间使用 `|` 分隔。
   8. `async`：选填，如果设置为 `true` 则消息推送将在后台异步进行，返回结果包含 `uuid` 字段，可用于后续[获取消息发送状态](./docs/API.md#通过消息 UUID 获取消息发送状态)。
3. `POST` 请求方式：字段与上面 `GET` 请求方式保持一致。
   + 如果发送的是 JSON，HTTP Header `Content-Type` 请务必设置为 `application/json`，否则一律按 Form 处理。
   + POST 请求方式下的 `token` 字段也可以通过 URL 查询参数进行设置。


**各种通道的支持程度：**

|      通道类型       | `title` | `description` | `content` | `url` | `to` | Markdown 支持 |
|:---------------:|:-------:|:-------------:|:---------:|:-----:|:----:|:-----------:|
|     `email`     |    ✅    |       ✅       |     ✅     |   ❌   |  ✅️  |     ✅️      |
|     `test`      |    ✅    |       ✅       |     ✅     |  ✅️   |  ✅️  |      ✅      |
|   `corp_app`    |    ✅    |       ✅       |     ✅     |  ✅️   |  ✅   |      ✅      |
|     `corp`      |    ❌    |       ✅       |     ✅     |  ✅️   |  ✅️  |      ✅      |
|     `lark`      |    ❌    |       ✅       |     ✅     |   ❌   |  ✅   |      ✅      |
|   `lark_app`    |    ❌    |       ✅       |     ✅     |  ❌️   |  ✅   |      ✅      |
|     `ding`      |    ✅    |       ✅       |     ✅     |  ✅️   |  ✅   |      ✅      |
|     `bark`      |    ✅    |       ✅       |     ✅     |  ✅️   |  ❌   |      ✅      |
|    `client`     |    ✅    |       ✅       |     ❌     |   ❌   |  ❌   |      ❌      |
|   `telegram`    |    ❌    |       ❌       |     ✅     |   ❌   |  ✅   |      ✅      |
|    `discord`    |    ❌    |       ❌       |     ✅     |   ❌   |  ✅   |      ❌      |
| `tencent_alarm` |    ❌    |       ✅       |     ❌     |   ❌   |  ❌   |      ❌      |

注意：
1. 对于大部分通道，`description` 字段和 `content` 是不能同时存在的，如果你只需要文字消息，请使用 `description` 字段，如果你需要发送 Markdown 消息，请使用 `content` 字段。
2. 部分通道的 Markdown 支持实际上是通过 URL 跳转到本系统所渲染的消息详情实现的，其他通道的 Markdown 支持受限于具体的通道，支持的语法并不统一。

**示例：**

<details>
<summary><strong>Bash 示例 </strong></summary>
<div>

```shell
#!/bin/bash

MESSAGE_PUSHER_SERVER="https://msgpusher.com"
MESSAGE_PUSHER_USERNAME="test"
MESSAGE_PUSHER_TOKEN="666"

function send_message {
  # POST Form
  curl -s -X POST "$MESSAGE_PUSHER_SERVER/push/$MESSAGE_PUSHER_USERNAME" \
    -d "title=$1&description=$2&content=$3&token=$MESSAGE_PUSHER_TOKEN" \
    >/dev/null
}

function send_message_with_json {
  # POST JSON
  curl -s -X POST "$MESSAGE_PUSHER_SERVER/push/$MESSAGE_PUSHER_USERNAME" \
    -H 'Content-Type: application/json' \
    -d '{"title":"'"$1"'","desp":"'"$2"'", "content":"'"$3"'", "token":"'"$MESSAGE_PUSHER_TOKEN"'"}' \
    >/dev/null
}

send_message 'title' 'description' 'content'
```

</div>
</details>

<details>
<summary><strong>Python 示例 </strong></summary>
<div>

```python
import requests

SERVER = "https://msgpusher.com"
USERNAME = "test"
TOKEN = "666"


def send_message(title, description, content):
    # GET 方式
    # res = requests.get(f"{SERVER}/push/{USERNAME}?title={title}"
    #                    f"&description={description}&content={content}&token={TOKEN}")

    # POST 方式
    res = requests.post(f"{SERVER}/push/{USERNAME}", json={
        "title": title,
        "description": description,
        "content": content,
        "token": TOKEN
    })
    res = res.json()
    if res["success"]:
        return None
    else:
        return res["message"]


error = send_message("标题", "描述", "**Markdown 内容**")
if error:
    print(error)
```

</div>
</details>

<details>
<summary><strong>Go 示例 </strong></summary>
<div>

```go
package main

import (
   "bytes"
   "encoding/json"
   "errors"
   "fmt"
   "net/http"
   "net/url"
)

var serverAddress = "https://msgpusher.com"
var username = "test"
var token = "666"

type request struct {
   Title       string `json:"title"`
   Description string `json:"description"`
   Content     string `json:"content"`
   URL         string `json:"url"`
   Channel     string `json:"channel"`
   Token       string `json:"token"`
}

type response struct {
   Success bool   `json:"success"`
   Message string `json:"message"`
}

func SendMessage(title string, description string, content string) error {
   req := request{
      Title:       title,
      Description: description,
      Content:     content,
      Token:       token,
   }
   data, err := json.Marshal(req)
   if err != nil {
      return err
   }
   resp, err := http.Post(fmt.Sprintf("%s/push/%s", serverAddress, username),
      "application/json", bytes.NewBuffer(data))
   if err != nil {
      return err
   }
   var res response
   err = json.NewDecoder(resp.Body).Decode(&res)
   if err != nil {
      return err
   }
   if !res.Success {
      return errors.New(res.Message)
   }
   return nil
}

func SendMessageWithForm(title string, description string, content string) error {
   resp, err := http.PostForm(fmt.Sprintf("%s/push/%s", serverAddress, username),
      url.Values{"title": {title}, "description": {description}, "content": {content}, "token": {token}})
   if err != nil {
      return err
   }
   var res response
   err = json.NewDecoder(resp.Body).Decode(&res)
   if err != nil {
      return err
   }
   if !res.Success {
      return errors.New(res.Message)
   }
   return nil
}

func main() {
   //err := SendMessage("标题", "描述", "**Markdown 内容**")
   err := SendMessageWithForm("标题", "描述", "**Markdown 内容**")
   if err != nil {
      fmt.Println("推送失败：" + err.Error())
   } else {
      fmt.Println("推送成功！")
   }
}
```

</div>
</details>

<details>
<summary><strong>C# 示例 </strong></summary>
<div>

```csharp
using Newtonsoft.Json;
using RestSharp;

namespace Demo
{
    public class Program
    {
        public static void Main(string[] args)
        {
            //推送消息
            var sendMsg = MessagePusherTool.SendMessage("标题", "描述", "**Markdown 内容**");
            if(sendMsg.Success)
            {
                Console.WriteLine($"推送成功！");
            }
            else
            {
                Console.WriteLine($"推送失败：{sendMsg.Message}");
            }
        }
    }

    /// <summary>
    /// 消息推送工具
    /// 
    /// <para>开源地址：https://github.com/songquanpeng/message-pusher</para>
    /// <para>支持：Framework、Net3.1、Net5、Net6</para>
    /// <para>引用包：</para>
    /// <para>dotnet add package Newtonsoft.Json -v 13.0.2</para>
    /// <para>dotnet add package RestSharp -v 108.0.3</para>
    /// </summary>
    public class MessagePusherTool
    {
        /// <summary>
        /// ServerAddress
        /// </summary>
        public const string ServerAddress = "https://msgpusher.com";

        /// <summary>
        /// UserName
        /// </summary>
        public const string UserName = "test";

        /// <summary>
        /// Token
        /// </summary>
        public const string Token = "666";

        /// <summary>
        /// SendMessage
        /// </summary>
        /// <param name="title">title</param>
        /// <param name="description">description</param>
        /// <param name="content">content</param>
        public static Response SendMessage(string title, string description, string content)
        {
            var requestData = new Request()
            {
                Title = title,
                Description = description,
                Content = content,
                Token = Token,
            };
            var url = $"{ServerAddress}";
            var client = new RestClient(url);
            var request = new RestRequest($"push/{UserName}", Method.Post);
            request.AddJsonBody(requestData);
            var response = client.Execute(request);
            var responseData = response.Content;
            var responseJson = JsonConvert.DeserializeObject<Response>(responseData);
            return responseJson;
        }

        /// <summary>
        /// Request
        /// </summary>
        public class Request
        {
            /// <summary>
            /// Title
            /// </summary>
            [JsonProperty(PropertyName = "title")]
            public string Title { get; set; }

            /// <summary>
            /// Description
            /// </summary>
            [JsonProperty(PropertyName = "description")]
            public string Description { get; set; }

            /// <summary>
            /// Content
            /// </summary>
            [JsonProperty(PropertyName = "content")]
            public string Content { get; set; }

            /// <summary>
            /// URL
            /// </summary>
            [JsonProperty(PropertyName = "url")]
            public string URL { get; set; }

            /// <summary>
            /// Channel
            /// </summary>
            [JsonProperty(PropertyName = "channel")]
            public string Channel { get; set; }

            /// <summary>
            /// Token
            /// </summary>
            [JsonProperty(PropertyName = "token")]
            public string Token { get; set; }
        }

        /// <summary>
        /// Response
        /// </summary>
        public class Response
        {
            /// <summary>
            /// Success
            /// </summary>
            [JsonProperty(PropertyName = "success")]
            public bool Success { get; set; }

            /// <summary>
            /// Message
            /// </summary>
            [JsonProperty(PropertyName = "message")]
            public string Message { get; set; }
        }
    }
}
```

</div>
</details>

<details>
<summary><strong>Node.js 示例 </strong></summary>
<div>

```javascript
const axios = require('axios');
const querystring = require('querystring');

const MESSAGE_PUSHER_SERVER = 'https://msgpusher.com'
const MESSAGE_PUSHER_USERNAME = 'test'
const MESSAGE_PUSHER_TOKEN = '666'

async function send_message(title, description, content) {
  try {
    const postData = querystring.stringify({
      title: title,
      desp: description,
      content: content,
      token: MESSAGE_PUSHER_TOKEN,
    })

    const response = await axios.post(`${MESSAGE_PUSHER_SERVER}/push/${MESSAGE_PUSHER_USERNAME}`, postData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
    if (response.data.success) {
      return response.data
    }
  } catch (error) {
    if (error.response) {
      return error.response.data
    } else {
      throw error
    }

  }
}

send_message('标题', '描述', '**Markdown 内容**')
  .then((response) => {
    if (response.success) {
      console.log('推送成功:', response)
    } else {
      console.log('推送失败:', response)
    }
  }, (error) => {
    console.log(error.message);
  })

```
</div>
</details>

欢迎 PR 添加更多语言的示例。


## 迁移数据库
此处均以 SQLite 为例，其他数据库请自行修改。我已经让 ChatGPT 翻译成对应的 SQL 版本，见 `bin` 文件夹，供参考。

### 从 `v0.3` 迁移到 `v0.4`
1. 首先备份你的数据库文件。
2. 下载最新的 `v0.4` 版本，启动程序，程序会自动进行数据库表结构的迁移。
3. 终止程序。
4. 之后执行脚本：`./bin/migrate_v3_to_v4.py`，进行数据的迁移。
5. 重新启动程序即可。

注意，执行前请确保数据库中 `users` 表中字段的顺序和脚本中的一致，否则会出现数据错乱的情况。

## 其他
1. `v0.3` 之前的版本基于 Node.js，你可以切换到 [`nodejs`](https://github.com/songquanpeng/message-pusher/tree/nodejs) 分支查看，该版本不再有功能性更新。
2. `v0.3` 以及后续版本基于 Gin Template [`v0.2.1`](https://github.com/songquanpeng/gin-template) 版本开发。
3. 如果想要自行编译，请首先[编译前端](./web/README.md)，之后再编译后端，否则会遇到 `pattern web/build: no matching files found` 问题。
