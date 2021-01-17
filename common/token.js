const { User } = require('../models');

const tokenStore = new Map();

async function initializeTokenStore() {
  const users = await User.findAll();
  users.forEach((user) => {
    if (user.wechatAppId) {
      tokenStore.set(user.prefix, {
        appId: user.wechatAppId,
        appSecret: user.wechatAppSecret,
        templateId: user.wechatTemplateId,
        openId: user.wechatOpenId,
        serverVerifyToken: user.wechatVerifyToken,
        token: '',
      });
    }
  });
  console.debug(tokenStore);
  console.log('Token store initialized.');
}

module.exports = {
  initializeTokenStore,
  tokenStore,
};
