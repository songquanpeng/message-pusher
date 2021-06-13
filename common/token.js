const { User } = require('../models');

const tokenStore = new Map();

async function initializeTokenStore() {
  let users = [];
  if (process.env.MODE === '1') {
    console.log('Current mode is Heroku mode.');
    let user = {
      // Common
      prefix: process.env.PREFIX,
      accessToken: process.env.ACCESS_TOKEN,
      defaultMethod: process.env.DEFAULT_METHOD,
      // WeChat public account
      wechatAppId: process.env.WECHAT_APP_ID,
      wechatAppSecret: process.env.WECHAT_APP_SECRET,
      wechatTemplateId: process.env.WECHAT_TEMPLATE_ID,
      wechatOpenId: process.env.WECHAT_OPEN_ID,
      wechatVerifyToken: process.env.WECHAT_VERIFY_TOKEN,
      // Email
      email: process.env.EMAIL,
      smtpServer: process.env.SMTP_SERVER,
      smtpUser: process.env.SMTP_USER,
      smtpPass: process.env.SMTP_PASS,
      // WeChat corporation account
      corpId: process.env.CORP_ID,
      corpAgentId: process.env.CORP_AGENT_ID,
      corpAppSecret: process.env.CORP_APP_SECRET,
      corpUserId: process.env.CORP_USER_ID,
    };
    users.push(user);
  } else {
    users = await User.findAll({
      raw: true,
    });
  }
  users.forEach((user) => {
    if (user.prefix) {
      tokenStore.set(user.prefix, {
        // Common
        accessToken: user.accessToken,
        defaultMethod: user.defaultMethod,
        // WeChat test account
        wechatAppId: user.wechatAppId,
        wechatAppSecret: user.wechatAppSecret,
        wechatTemplateId: user.wechatTemplateId,
        wechatOpenId: user.wechatOpenId,
        wechatVerifyToken: user.wechatVerifyToken,
        wechatToken: '',
        // Email
        email: user.email,
        smtpServer: user.smtpServer,
        smtpUser: user.smtpUser,
        smtpPass: user.smtpPass,
        // WeChat corporation account
        corpId: user.corpId,
        corpAgentId: user.corpAgentId,
        corpAppSecret: user.corpAppSecret,
        corpUserId: user.corpUserId,
        corpToken: '',
      });
    }
  });
  console.log('Token store initialized.');
}

function updateTokenStore(prefix, key, value) {
  let user = tokenStore.get(prefix);
  user[key] = value;
  tokenStore.set(prefix, user);
}

function getUserDefaultMethod(prefix) {
  let user = tokenStore.get(prefix);
  return user.defaultMethod;
}

function checkAccessToken(prefix, token) {
  let user = tokenStore.get(prefix);
  if (user.accessToken === '') {
    return true;
  } else {
    return user.accessToken === token;
  }
}

module.exports = {
  initializeTokenStore,
  updateTokenStore,
  getUserDefaultMethod,
  tokenStore,
  checkAccessToken,
};
