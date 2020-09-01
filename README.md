# 微信消息推送
## 描述
利用测试号来给自己的微信推送消息。

## 搭建步骤
### 服务器端配置
1. 配置 Node.js 环境，推荐使用 [nvm](https://github.com/nvm-sh/nvm)。
2. 下载代码：`git clone https://github.com/songquanpeng/wechat-message-push.git`。
3. 安装依赖：`npm i`。
4. 安装 pm2：`npm i -g pm2`。
5. 使用 Nginx 反代我们的 Node.js 服务，默认端口 3000。
    1. 在 `/etc/nginx/site-enabled/` 目录下创建文件 `wechat-push-service.conf`（主配置文件 nginx.conf 内要有 `include /etc/nginx/sites-enabled/*.conf;`）:
        ```conf
        server {
            listen 443 ssl http2;
            listen [::]:443 ssl http2;
            server_name 你的域名;
        
            location / {
                proxy_pass http://localhost:3000;  # 注意如果你改变了默认端口，记得在这里进行更新
                proxy_http_version 1.1;
                proxy_set_header Upgrade $http_upgrade;
                proxy_set_header Connection 'upgrade';
                proxy_set_header Host $host;
                proxy_set_header X-Forwarded-For $remote_addr;
                proxy_cache_bypass $http_upgrade;
            }
        }
        ```
    2. 之后使用 [certbot](https://certbot.eff.org/lets-encrypt/ubuntuxenial-nginx) 申请证书：`sudo certbot --nginx`。
    3. 重启 Nginx 服务：`sudo service nginx restart`。

### 微信公众平台端配置
1. 首先前往[此页面](https://mp.weixin.qq.com/debug/cgi-bin/sandboxinfo?action=showinfo&t=sandbox/index)拿到 APP_ID 以及 APP_SECRET。
2. 填写接口配置信息，URL 填 `https://你的域名/verify`，TOKEN 随意，之后点击验证。
3. 使用微信扫描下方的测试号二维码，拿到你的 OPEN_ID。
4. 新增模板消息模板，模板标题随意，模板内容填 `{{text.DATA}}`，提交后可以拿到 TEMPLATE_ID。

### 应用内配置
1. 使用 pm2 启动应用：`pm2 start ./app.js --name wechat-message-push-service`。
2. 访问首页填写配置项并提交。
2. 之后访问 `https://你的域名/Hi` 或 `https://你的域名/push?content=Hi`，如果你的微信能够收到一条内容为 Hi 的模板消息，则配置成功。 