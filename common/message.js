const { pushWechatMessage } = require('./wechat');

module.exports = {
  async processMessage(userPrefix, message) {
    let result = {
      success: false,
      message: `unsupported message type ${message.type}`,
    };
    switch (message.type) {
      case '0': // WeChat message
        result = await pushWechatMessage(userPrefix, message);
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
  },
};
