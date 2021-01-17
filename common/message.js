const { pushWeChatMessage } = require('./wechat');
const Message = require('../models/message').Message;

async function processMessage(userPrefix, message) {
  if (message.content) {
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
      // TODO: Email message
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
