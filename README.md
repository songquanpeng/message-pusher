# 微信消息推送
## 描述
利用测试号来给自己的微信推送消息。

## 搭建步骤
### 服务器端配置
1. 配置 Node.js 环境，推荐使用 nvm。
2. 下载代码：`git clone https://github.com/songquanpeng/wechat-message-push.git`。
3. 安装依赖：`npm i`。
4. 安装 pm2：`npm i -g pm2`。
5. 使用 Nginx 反代我们的 Node.js 服务，默认端口 3000。
6. 使用 pm2 启动应用：`pm2 start ./app.js --name wechat-message-push-service`。

### 微信公众平台端配置
1. 首先前往[此页面](https://mp.weixin.qq.com/debug/cgi-bin/sandboxinfo?action=showinfo&t=sandbox/index) 拿到 APP_ID 以及 APP_SECRET。
2. 填写接口配置信息，URL 填 `https://你的域名/verify`，TOKEN 随意，之后点击验证。
3. 使用微信扫描下方的测试号二维码，拿到你的 OPEN_ID。
4. 新增模板消息模板，模板标题随意，模板内容填 `{{text.DATA}}`，提交后可以拿到 TEMPLATE_ID。

### 启动服务
1. 至此，我们已经拿到所有我们需要的信息，接下来设置环境变量，方法很多，例如可以通过在应用的根目录创建 .env 文件，设置以下环境变量：
    ```
    APP_ID=wx*****
    APP_SECRET=*****
    TOKEN=你的 TOKEN
    TEMPLATE_ID=****
    OPEN_ID=****
    PORT=3000
    ```

2. 使用 `pm2 restart wechat-message-push-service` 重启服务。
3. 之后访问 `https://你的域名/push?content=Hi`，如果微信能够收到消息一条内容为 Hi 的模板消息，则配置成功。 