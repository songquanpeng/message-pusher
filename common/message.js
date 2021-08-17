const {
  getUserDefaultMethod,
  checkAccessToken,
  checkPrefix,
} = require('./token');
const { pushWeChatMessage } = require('./wechat');
const { pushWeChatCorpMessage } = require('./wechat-corp');
const { pushEmailMessage } = require('./email');
const { pushClientMessage } = require('./client');
const { Message } = require('../models');

async function processMessage(userPrefix, message) {
  if (!checkPrefix(userPrefix)) {
    return {
      success: false,
      message: `不存在的用户前缀：${userPrefix}`,
    };
  }
  if (!checkAccessToken(userPrefix, message.token)) {
    return {
      success: false,
      message: `无效的访问凭证，请检查 token 参数是否正确`,
    };
  }
  if (message.email) {
    // If message has the attribute "email", override its type.
    message.type = 'email';
  }
  if (!message.type) {
    message.type = getUserDefaultMethod(userPrefix);
  }
  if (message.content && message.type !== 'email') {
    // If message is not email type, we should save it because we have to serve the page.
    message = await Message.create(message, { raw: true });
  }
  let result;
  switch (message.type) {
    case 'test': // WeChat message
      result = await pushWeChatMessage(userPrefix, message);
      break;
    case 'email': // Email message
      result = await pushEmailMessage(userPrefix, message);
      break;
    case 'corp': // WeChat corp message
      result = await pushWeChatCorpMessage(userPrefix, message);
      break;
    case 'client': // Client message
      result = await pushClientMessage(userPrefix, message);
      break;
    default:
      result = {
        success: false,
        message: `不支持的消息类型：${message.type}`,
      };
      break;
  }
  return result;
}

module.exports = {
  processMessage,
};
