const axios = require('axios');
const { tokenStore, updateTokenStore } = require('./token');
const config = require('../config');

async function refreshToken() {
  for (let [key, value] of tokenStore) {
    if (value.corpId) {
      value.corpToken = await requestToken(value.corpId, value.corpAppSecret);
      tokenStore.set(key, value);
    }
  }
  console.log('Token refreshed.');
}

async function requestToken(corpId, corpAppSecret) {
  // Reference: https://work.weixin.qq.com/api/doc/90000/90135/91039

  let token = '';
  try {
    let res = await axios.get(
      `https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=${corpId}&corpsecret=${corpAppSecret}`
    );
    // console.debug(res);
    if (res && res.data) {
      if (res.data.access_token) {
        token = res.data.access_token;
      } else {
        console.error(res.data);
      }
    }
  } catch (e) {
    console.error(e);
  }
  return token;
}

async function pushWeChatCorpMessage(userPrefix, message) {
  // Reference: https://work.weixin.qq.com/api/doc/90000/90135/90236

  let user = tokenStore.get(userPrefix);
  if (!user) {
    return {
      success: false,
      message: `不存在的前缀：${userPrefix}，请注意大小写`,
    };
  }
  let access_token = user.corpToken;
  let request_data = {
    msgtype: 'textcard',
    touser: user.corpUserId,
    agentid: user.corpAgentId,
    textcard: {
      title: message.title,
      description: message.description,
    },
  };
  if (message.content) {
    request_data.textcard.url = `${config.href}message/${message.id}`;
  }
  let requestUrl = `https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=${access_token}`;
  try {
    let response = await axios.post(requestUrl, request_data);
    if (response && response.data && response.data.errcode !== 0) {
      // Failed to push message, get a new token and try again.
      access_token = await requestToken(user.corpId, user.corpAppSecret);
      updateTokenStore(userPrefix, 'corpToken', access_token);
      requestUrl = `https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=${access_token}`;
      response = await axios.post(requestUrl, request_data);
    }
    if (response.data.errcode === 0) {
      return {
        success: true,
        message: 'ok',
      };
    } else {
      return {
        success: false,
        message: response.data.errmsg,
      };
    }
  } catch (e) {
    console.error(e);
    return {
      success: false,
      message: e.message,
    };
  }
}

module.exports = {
  refreshToken,
  requestToken,
  pushWeChatCorpMessage,
};
