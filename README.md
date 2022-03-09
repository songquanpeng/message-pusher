# 消息推送服务
## 描述
1. 多种消息推送方式：
    + 使用微信公众号测试号推送，
    + 使用微信企业号推送，
    + 使用邮箱进行推送，
    + 使用专门的桌面客户端进行推送，消息直达你的电脑，需要额外安装一个非常小的客户端，[详见此处](./client/README.md)。
2. 支持 Markdown。
3. 支持部署在 Heroku 上，无需自己的服务器，[详见此处](#在-Heroku-上的搭建步骤)。

## 用途举例
1. [整合进自己的博客系统，每当有人登录时发微信消息提醒](https://github.com/songquanpeng/blog/blob/486d63e96ef7906a6c767653a20ec2d3278e9a4a/routes/user.js#L27)。
2. 在进行深度学习模型训练时，在每个 epoch 结束后将关键数据发送到微信以方便及时监控。
3. 在各种脚本运行结束后发消息提醒，例如[监控 Github Star 数量的脚本](https://github.com/songquanpeng/scripts/blob/main/star_watcher.py)。

## 在自己的服务器上的部署步骤
### 域名设置
先去你的云服务提供商那里添加一个子域名，解析到你的目标服务器。

### 服务器端配置
1. 配置 Node.js 环境，推荐使用 [nvm](https://github.com/nvm-sh/nvm)。
2. 下载代码：`git clone https://github.com/songquanpeng/message-pusher.git`，或者 `git clone https://gitee.com/songquanpeng/message-pusher`。
3. 修改根目录下的 config.js 文件：
    + （可选）可以修改监听的端口
    + （可选）配置是否选择开放注册
    + （必选）修改 href 字段，如 `https://pusher.yourdomain.com/`，注意后面要加 /，如果不修改此项，推送消息的详情页面将无法打开。
4. 安装依赖：`npm i`。
5. 安装 pm2：`npm i -g pm2`。
6. 使用 pm2 启动服务：`pm2 start ./app.js --name message-pusher`。
7. 使用 Nginx 反代我们的 Node.js 服务，默认端口 3000（你可以在 config.js 中进行修改）。
    1. 修改应用根目录下的 `nginx.conf` 中的域名以及端口号，并创建软链接：`sudo ln -s /path/to/nginx.conf /etc/nginx/sites-enabled/message-pusher.conf` ，**注意修改这里的 /path/to/nginx.conf，且必须是绝对路径**，当然如果不想创建软链接的话也可以直接将配置文件拷贝过去：`sudo mv ./nginx.conf /etc/nginx/sites-enabled/message-pusher.conf`。
    2. 之后使用 [certbot](https://certbot.eff.org/lets-encrypt/ubuntuxenial-nginx) 申请证书：`sudo certbot --nginx`。
    3. 重启 Nginx 服务：`sudo service nginx restart`。
8. 默认用户名密码为：`admin` 和 `123456`，且默认禁止新用户注册，如需修改，请编辑 `config.js`。

### 微信测试号配置
1. 首先前往[此页面](https://mp.weixin.qq.com/debug/cgi-bin/sandboxinfo?action=showinfo&t=sandbox/index)拿到 APP_ID 以及 APP_SECRET。
2. 使用微信扫描下方的测试号二维码，拿到你的 OPEN_ID。
3. 新增模板消息模板，模板标题随意，模板内容填 `{{text.DATA}}`，提交后可以拿到 TEMPLATE_ID。
4. 填写接口配置信息，URL 填 `https://你的域名/前缀/verify`，TOKEN 随意，先不要点击验证。（前缀默认和用户名相同）
5. 现在访问 `https://你的域名/`，默认用户为 admin，默认密码为 123456，登录后根据系统提示完成配置，之后点击提交按钮。
6. 之后回到微信公众平台测试号的配置页面，点击验证。

### 微信企业号配置
1. 在该[页面](https://work.weixin.qq.com/)注册微信企业号（不需要企业资质）。
2. 在该[页面](https://work.weixin.qq.com/wework_admin/frame#profile)的最下方找到企业 ID。
3. 在该[页面](https://work.weixin.qq.com/wework_admin/frame#profile/wxPlugin)找到二维码，微信扫码关注。
4. 在该[页面](https://work.weixin.qq.com/wework_admin/frame#apps)创建一个应用，之后找到应用的 AgentId 和 Secret。
5. 在该[页面](https://work.weixin.qq.com/wework_admin/frame#contacts)找到你的个人账号（一般为你的姓名拼写）。

### 验证是否配置成功
访问 `https://你的域名/前缀/Hi`，如果你的微信能够收到一条内容为 Hi 的模板消息，则配置成功。

如果出现问题，请务必仔细检查所填信息是否正确。

如果出现 `无效的 access token` 的报错，说明你设置了 ACCESS_TOKEN 但是忘记在调用时传递该值或者传递的值是错的。


## 在 Heroku 上的搭建步骤
在此之前，请先读一下“在自己的服务器上的部署步骤”这一节。
由于 Heroku 的限制，当 30 分钟内没有请求的话就会被冻结，之后再次启动时数据就丢了，因此这里我们采用配置环境变量的方式进行配置，这样即使应用冻结后再次启动配置信息依然存在。

### 一键部署
[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/songquanpeng/message-pusher)

### 手动部署
1. Fork 本项目。
2. 在[此处](https://dashboard.heroku.com/new-app)新建一个 Heroku APP，名字随意，之后可以设置自己的域名。
3. 在 Deployment method 处，选择 Connect to Github，输入 message-pusher 搜索本项目，之后点击 Connect，之后启用自动部署（Enable Automatic Deploys）。 
4. 点击上方的 Setting 标签，找到下面的 Config Vars 配置环境变量，有以下环境变量需要配置。

|KEY|VALUE|
|:--|:--|
|MODE|1（1 代表 Heroku 模式，该模式下应用从环境变量中读取必要信息）|
|PREFIX|你的前缀，如 admin（前缀用于区分用户，出现在请求的 api 路径中）|
|DEFAULT_METHOD|默认推送方式（test 代表微信测试号，corp 代表微信企业号，email 代表邮件推送，client 代表客户端推送）|
|HREF|服务的 href，如 https://wechat-message.herokuapp.com/ ，注意后面要有 /|
|WECHAT_APP_ID|你的测试号的 APP ID|
|WECHAT_APP_SECRET|你的测试号的 APP Secret|
|WECHAT_TEMPLATE_ID|你的测试号的模板消息的 ID|
|WECHAT_OPEN_ID|你的 Open ID|
|WECHAT_VERIFY_TOKEN|你自己设置的验证 token|
|EMAIL|你的默认目标邮箱|
|SMTP_SERVER|smtp 服务器地址，如 smtp.qq.com|
|SMTP_USER|smtp 服务器用户邮箱|
|SMTP_PASS|smtp 服务器用户凭据|
|CORP_ID|微信企业号 ID|
|CORP_AGENT_ID|微信企业号应用 ID|
|CORP_APP_SECRET|微信企业号应用 Secret|
|CORP_USER_ID|微信企业号用户 ID|

## 发送消息的方式
1. 发送纯文本消息：直接 HTTP GET 请求 `https://你的域名/你的前缀/消息`，缺点是有字数限制，且只能是纯文本，这是微信消息的限制。
2. 发送 Markdown 消息，调用方式分为两种：
    + GET 请求方式：`https://你的域名/前缀/?&title=消息标题&description=简短的消息描述&content=markdown格式的消息内容&email=test@qq.com&token=private`
    + POST 请求方式：请求路径为 `https://你的域名/前缀/`，参数有：
        1. `type`：（可选）发送方式
            + `test`：通过微信公众号测试号推送
            + `email`：通过发送邮件的方式进行推送
            + `corp`：通过微信企业号的应用号推送
            + `client`：通过桌面客户端推送
        2. `title`：（可选）消息的标题
        3. `description`：（必填）消息的描述
        4. `content`：（可选）消息内容，支持 Markdown
        5. `email`：（可选）当该项不为空时，将强制覆盖 type 参数，强制消息类型为邮件消息，收件邮箱即此处指定的邮箱。如果 type 为 `email` 且 email 参数为空，则邮件将发送至用户设置的默认邮箱。
        6. `token`:（可选）如果你设置了 ACCESS_TOKEN，则你需要附上该参数以验证身份。

## 示例程序
```python
import requests

# GET 方式
res = requests.get("https://push.iamazing.cn/admin/?title={}&description={}&token={}".format("标题", "描述", "666"))

# POST 方式
res = requests.post("https://your.domain.com/prefix/", data={
    "title": "标题",
    "description" : "描述",
    "content": "**Markdown 内容**",
    "token": "6666"
})

print(res.text)
# 输出为：{"success":true,"message":"ok"}
```

## 待做清单
- [x] 支持多用户。
- [ ] 完善的用户管理。
- [x] 支持 Markdown。
- [x] 支持推送消息到邮箱。
- [x] 支持在 Heroku 上部署。
- [x] 更加便于部署的 [Go 语言版本](https://github.com/LeeJiangWei/go-message)。
- [x] 适配企业微信应用。
- [x] 客户端推送。

敬请期待。
