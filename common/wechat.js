const axios = require('axios');
const { tokenStore } = require('./token');
const config = require('../config');

async function refreshToken() {
  for (const item of tokenStore) {
    item.token = await this.requestToken();
  }
  console.log('Token refreshed.');
}

async function requestToken(appId, appSecret) {
  let token = '';
  try {
    let res = await axios.get(
      `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appId}&secret=${appSecret}`
    );
    console.log(res);
    if (res && res.data && res.data.access_token) {
      token = res.data.access_token;
    }
  } catch (e) {
    console.error(e);
  }
  return token;
}

async function pushWeChatMessage(userPrefix, message) {
  // Reference: https://mp.weixin.qq.com/debug/cgi-bin/readtmpl?t=tmplmsg/faq_tmpl
  let user = tokenStore.get(userPrefix);
  let access_token = user.token;
  let request_data = {
    touser: user.wechatOpenId,
    template_id: user.wechatTemplateId,
  };
  if (message.content) {
    // TODO
    // Generate html, save message to database and then return the id
    let id = 'TODO';
    request_data.url = `${config.href}${userPrefix}/${id}`;
  }
  request_data.data = { text: { value: message.description } };
  let requestUrl = `https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=${access_token}`;
  try {
    let response = await axios.post(requestUrl, request_data);
    if (response && response.data && response.data.errcode === '40001') {
      await requestToken(user.wechatAppId, user.wechatAppSecret);
      await axios.post(requestUrl, request_data);
    }
    console.log(response.data);
    return {
      success: true,
      message: '',
    };
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
