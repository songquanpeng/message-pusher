const express = require('express');
const router = express.Router();
const { User } = require('../models');
const { tokenStore } = require('../common/token');
const requestWeChatToken = require('../common/wechat').requestToken;
const requestCorpToken = require('../common/wechat-corp').requestToken;

const {
  userRequired,
  adminRequired,
  allowRegister,
} = require('../middlewares/web_auth');
const config = require('../config');

router.get('/', (req, res, next) => {
  let showGuidance = false;
  if (req.session.user && !req.session.user.wechatAppId) {
    showGuidance = true;
  }
  if (process.env.MODE === '1') {
    showGuidance = false;
  }
  res.render('index', {
    message: req.flash('message'),
    showGuidance,
  });
});

router.get('/login', (req, res, next) => {
  res.render('login', {
    message: req.flash('message'),
  });
});

router.post('/login', async (req, res, next) => {
  let user = {
    username: req.body.username,
    password: req.body.password,
  };
  let message = '';
  res.locals.isErrorMessage = true;
  try {
    user = await User.findOne({ where: user });
    if (user) {
      req.session.user = user;
      req.flash(
        'message',
        `欢迎${user.isAdmin ? '管理员' : '普通'}用户 ${
          user.username
        } 登陆系统！`
      );
      return res.redirect('/');
    } else {
      message = '用户名或密码错误';
    }
  } catch (e) {
    console.error(e);
    message = e.message;
  }
  res.render('login', {
    message,
  });
});

router.get('/logout', userRequired, (req, res, next) => {
  req.session.user = undefined;
  req.flash('message', '已退出登录');
  res.redirect('/');
});

router.get('/register', allowRegister, (req, res, next) => {
  res.render('register');
});

router.post('/register', allowRegister, async (req, res, next) => {
  if (process.env.MODE === '1') {
    return res.render('register', {
      message: '当前运行模式为 Heroku 模式，该模式下禁止用户注册',
      isErrorMessage: true,
    });
  }
  let user = {
    username: req.body.username,
    password: req.body.password,
  };
  let message = '';
  try {
    user = await User.create(user);
    message = '用户创建成功，请登录';
    req.flash('message', message);
    return res.redirect('/login');
  } catch (e) {
    console.error(e);
    message = '用户名已被占用';
  }
  res.render('register', { message, isErrorMessage: true });
});

router.get('/configure', userRequired, (req, res, next) => {
  let showPasswordWarning = false;
  if (req.session.user && req.session.user.password === '123456') {
    showPasswordWarning = true;
  }
  res.locals.message = req.flash('message');
  res.locals.showPasswordWarning = showPasswordWarning;
  if (req.session.user.prefix === null) {
    req.session.user.prefix = req.session.user.username;
  }
  res.locals.verifyUrl = config.href + req.session.user.prefix + '/verify';
  res.render('configure', req.session.user);
});

router.post('/configure', userRequired, async (req, res, next) => {
  let id = req.session.user.id;
  let user = {
    // Common
    username: req.body.username,
    password: req.body.password,
    accessToken: req.body.accessToken,
    defaultMethod: req.body.defaultMethod,
    prefix: req.body.prefix,
    // WeChat public account
    wechatAppId: req.body.wechatAppId,
    wechatAppSecret: req.body.wechatAppSecret,
    wechatTemplateId: req.body.wechatTemplateId,
    wechatOpenId: req.body.wechatOpenId,
    wechatVerifyToken: req.body.wechatVerifyToken,
    // Email
    email: req.body.email,
    smtpServer: req.body.smtpServer,
    smtpUser: req.body.smtpUser,
    smtpPass: req.body.smtpPass,
    // WeChat corp
    corpId: req.body.corpId,
    corpAgentId: req.body.corpAgentId,
    corpAppSecret: req.body.corpAppSecret,
    corpUserId: req.body.corpUserId,
  };
  for (let field in user) {
    let value = user[field];
    value = value.trim();
    if (value) {
      user[field] = value;
    } else {
      delete user[field];
    }
  }
  let message = '';
  try {
    let userObj = await User.findOne({
      where: {
        id: id,
      },
    });
    if (userObj) {
      await userObj.update(user);
    }
    if (userObj.prefix !== req.session.user.prefix) {
      tokenStore.delete(req.session.user.prefix);
    }
    req.session.user = userObj;
    tokenStore.set(userObj.prefix, {
      // Common
      accessToken: userObj.accessToken,
      defaultMethod: userObj.defaultMethod,
      // WeChat test account
      wechatAppId: userObj.wechatAppId,
      wechatAppSecret: userObj.wechatAppSecret,
      wechatTemplateId: userObj.wechatTemplateId,
      wechatOpenId: userObj.wechatOpenId,
      wechatVerifyToken: userObj.wechatVerifyToken,
      wechatToken: await requestWeChatToken(
        userObj.wechatAppId,
        userObj.wechatAppSecret
      ),
      // Email
      email: userObj.email,
      smtpServer: userObj.smtpServer,
      smtpUser: userObj.smtpUser,
      smtpPass: userObj.smtpPass,
      // WeChat corporation account
      corpId: userObj.corpId,
      corpAgentId: userObj.corpAgentId,
      corpAppSecret: userObj.corpAppSecret,
      corpUserId: userObj.corpUserId,
      corpToken: await requestCorpToken(userObj.corpId, userObj.corpAppSecret),
    });
    message = '配置更新成功';
    console.debug(tokenStore);
  } catch (e) {
    console.error(e);
    message = e.message;
  }
  req.flash('message', message);
  res.redirect('/configure');
});

module.exports = router;
