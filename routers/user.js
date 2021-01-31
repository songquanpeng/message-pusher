const express = require('express');
const crypto = require('crypto');
const Message = require('../models/message').Message;
const { processMessage } = require('../common/message');
const { tokenStore } = require('../common/token');

const router = express.Router();

router.all('/:userPrefix/verify', (req, res, next) => {
  // 验证消息来自微信服务器：https://developers.weixin.qq.com/doc/offiaccount/Basic_Information/Access_Overview.html
  const userPrefix = req.params.userPrefix;
  const { signature, timestamp, nonce, echostr } = req.query;
  const token = tokenStore.get(userPrefix).wechatVerifyToken;
  let tmp_array = [token, timestamp, nonce].sort();
  let tmp_string = tmp_array.join('');
  tmp_string = crypto.createHash('sha1').update(tmp_string).digest('hex');
  if (tmp_string === signature) {
    res.send(echostr);
  } else {
    res.send('verification failed');
  }
});

router.all('/:userPrefix/:description', async (req, res, next) => {
  const userPrefix = req.params.userPrefix;
  let message = {
    type: '0',
    title: '无标题',
    description: req.params.description,
  };
  res.json(await processMessage(userPrefix, message));
});

router.all('/:userPrefix', async (req, res, next) => {
  const userPrefix = req.params.userPrefix;
  let message = {
    type: req.query.type || req.body.type || '0',
    title: req.query.title || req.body.title || '无标题',
    description: req.query.description || req.body.description,
    content: req.query.content || req.body.content,
    email: req.query.email || req.body.email,
  };
  let result = await processMessage(userPrefix, message);
  res.json(result);
});

module.exports = router;
