const { tokenStore } = require('./token');

async function pushClientMessage(userPrefix, message) {
  let user = tokenStore.get(userPrefix);
  if (!user || !user.ws) {
    return {
      success: false,
      message: `客户端未连接`,
    };
  }
  let data = {
    title: message.title,
    description: message.description,
  };
  console.log(JSON.stringify(data));
  user.ws.send(JSON.stringify(data));
  return {
    success: true,
    message: '消息已发送给 WebSocket 客户端',
  };
}

module.exports = {
  pushClientMessage,
};
