# 微信消息推送
## 描述
利用测试号来给自己的微信推送消息。

## 用途举例
1. [整合进自己的博客系统，每当有人登录时发微信消息提醒](https://github.com/songquanpeng/blog/blob/486d63e96ef7906a6c767653a20ec2d3278e9a4a/routes/user.js#L27)。
2. 在进行深度学习模型训练时，在每个 epoch 结束后将关键数据发送到微信以方便及时监控。
3. 在各种脚本运行结束后发消息提醒，例如[监控 Github Star 数量的脚本](https://github.com/songquanpeng/scripts/blob/main/star_watcher.py)。

## 搭建步骤
### 域名设置
先去你的云服务提供商那里添加一个子域名，解析到你的目标服务器。

### 服务器端配置
1. 配置 Node.js 环境，推荐使用 [nvm](https://github.com/nvm-sh/nvm)。
2. 下载代码：`git clone https://github.com/songquanpeng/message-pusher.git`。
3. （可选）修改根目录下的 config.js 文件，在其内可以修改监听的端口，也可配置是否选择开放注册，注意 href 字段不仅仅是域名，后面要加 /。
4. 安装依赖：`npm i`。
5. 安装 pm2：`npm i -g pm2`。
6. 使用 pm2 启动服务：`pm2 start ./app.js --name message-pusher`。
7. 使用 Nginx 反代我们的 Node.js 服务，默认端口 3000（你可以在 config.js 中进行修改）。
    1. 修改应用根目录下的 `nginx.conf` 中的域名以及端口号，并创建软链接：`sudo ln -s /path/to/nginx.conf /etc/nginx/sites-enabled/message-pusher.conf` ，**注意修改这里的 /path/to/nginx.conf，且必须是绝对路径**，当然如果不想创建软链接的话也可以直接将配置文件拷贝过去：`sudo mv ./nginx.conf /etc/nginx/sites-enabled/message-pusher.conf`。
    2. 之后使用 [certbot](https://certbot.eff.org/lets-encrypt/ubuntuxenial-nginx) 申请证书：`sudo certbot --nginx`。
    3. 重启 Nginx 服务：`sudo service nginx restart`。

### 微信公众平台端配置
1. 首先前往[此页面](https://mp.weixin.qq.com/debug/cgi-bin/sandboxinfo?action=showinfo&t=sandbox/index)拿到 APP_ID 以及 APP_SECRET。
2. 使用微信扫描下方的测试号二维码，拿到你的 OPEN_ID。
3. 新增模板消息模板，模板标题随意，模板内容填 `{{text.DATA}}`，提交后可以拿到 TEMPLATE_ID。
4. 填写接口配置信息，URL 填 `https://你的域名/前缀/verify`，TOKEN 随意，先不要点击验证。（前缀默认和用户名相同）
5. 现在访问 `https://你的域名/`，默认用户为 admin，默认密码为 123456，登录后根据系统提示完成配置，之后点击提交按钮。
6. 之后回到微信公众平台测试号的配置页面，点击验证。

### 验证是否配置成功
访问 `https://你的域名/前缀/Hi`，如果你的微信能够收到一条内容为 Hi 的模板消息，则配置成功。

## 待做清单
- [x] 支持多用户。
- [ ] 完善的用户管理。
- [ ] 支持 Markdown。
- [ ] 支持推送消息到邮箱。
- [ ] 更加便于部署的 Go 语言的版本。
- [ ] 适配企业微信应用。
- [ ] 提供常见语言的调用示例。

敬请期待。
