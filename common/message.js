const { pushWeChatMessage } = require('./wechat');
const { pushEmailMessage } = require('./email');
const Message = require('../models/message').Message;

async function processMessage(userPrefix, message) {
  if (message.email) {
    // If message has the attribute "email", override its type.
    message.type = '1';
  }
  if (message.content && message.type === '0') {
    message = await Message.create(message);
  }
  let result = {
    success: false,
    message: `unsupported message type ${message.type}`,
  };
  switch (message.type) {
    case '0': // WeChat message
      result = await pushWeChatMessage(userPrefix, message);
      break;
    case '1': // Email message
      result = await pushEmailMessage(userPrefix, message);
      break;
    case '2': // HTTP GET request
      // TODO: HTTP GET request
      break;
    default:
      break;
  }
  return result;
}

module.exports = {
  processMessage,
};
