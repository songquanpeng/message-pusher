const axios = require('axios');
const { tokenStore } = require('./token');
const config = require('../config');

async function refreshToken() {
  for (let [key, value] of tokenStore) {
    value.token = await requestToken(value.wechatAppId, value.wechatAppSecret);
    tokenStore.set(key, value);
  }
  console.log('Token refreshed.');
}

async function requestToken(appId, appSecret) {
  let token = '';
  try {
    let res = await axios.get(
      `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appId}&secret=${appSecret}`
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

async function pushWeChatMessage(userPrefix, message) {
  // Reference: https://mp.weixin.qq.com/debug/cgi-bin/readtmpl?t=tmplmsg/faq_tmpl
  let user = tokenStore.get(userPrefix);
  if (!user) {
    return {
      success: false,
      message: `不存在的前缀：${userPrefix}，请注意大小写`,
    };
  }
  let access_token = user.token;
  let request_data = {
    touser: user.wechatOpenId,
    template_id: user.wechatTemplateId,
  };
  if (message.content) {
    request_data.url = `${config.href}message/${message.id}`;
    console.debug(`http://localhost:3000/message/${message.id}`);
  }
  request_data.data = { text: { value: message.description } };
  let requestUrl = `https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=${access_token}`;
  try {
    let response = await axios.post(requestUrl, request_data);
    if (response && response.data && response.data.errcode !== 0) {
      await requestToken(user.wechatAppId, user.wechatAppSecret);
      await axios.post(requestUrl, request_data);
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
  pushWeChatMessage,
};
