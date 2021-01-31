const { User } = require('../models');

const tokenStore = new Map();

async function initializeTokenStore() {
  let users = [];
  if (process.env.MODE === '1') {
    console.log('Current mode is Heroku mode.');
    let user = {
      wechatAppId: process.env.WECHAT_APP_ID,
      wechatAppSecret: process.env.WECHAT_APP_SECRET,
      wechatTemplateId: process.env.WECHAT_TEMPLATE_ID,
      wechatOpenId: process.env.WECHAT_OPEN_ID,
      wechatVerifyToken: process.env.WECHAT_VERIFY_TOKEN,
      prefix: process.env.PREFIX,
      email: process.env.EMAIL,
      smtpServer: process.env.SMTP_SERVER,
      smtpUser: process.env.SMTP_USER,
      smtpPass: process.env.SMTP_PASS,
    };
    users.push(user);
  } else {
    users = await User.findAll();
  }
  users.forEach((user) => {
    if (user.wechatAppId) {
      tokenStore.set(user.prefix, {
        wechatAppId: user.wechatAppId,
        wechatAppSecret: user.wechatAppSecret,
        wechatTemplateId: user.wechatTemplateId,
        wechatOpenId: user.wechatOpenId,
        wechatVerifyToken: user.wechatVerifyToken,
        token: '',
        email: user.email,
        smtpServer: user.smtpServer,
        smtpUser: user.smtpUser,
        smtpPass: user.smtpPass,
      });
    }
  });
  console.log('Token store initialized.');
}

module.exports = {
  initializeTokenStore,
  tokenStore,
};
