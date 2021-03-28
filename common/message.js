const { getUserDefaultMethod } = require('./token');
const { pushWeChatMessage } = require('./wechat');
const { pushWeChatCorpMessage } = require('./wechat-corp');
const { pushEmailMessage } = require('./email');
const { Message } = require('../models');

async function processMessage(userPrefix, message) {
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
    case 'corp': // WeChar corp message
      result = await pushWeChatCorpMessage(userPrefix, message);
      break;
    default:
      result = {
        success: false,
        message: `unsupported message type ${message.type}`,
      };
      break;
  }
  return result;
}

module.exports = {
  processMessage,
};
