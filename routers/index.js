const express = require('express');
const router = express.Router();
const { User } = require('../models');
const { tokenStore } = require('../common/token');
const { allowRegister } = require('../middlewares/web_auth');
const config = require('../config');

router.get('/', (req, res, next) => {
  res.render('index', {
    message: req.flash('message'),
  });
});

router.get('/login', (req, res, next) => {
  res.render('login');
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

router.get('/logout', (req, res, next) => {
  req.session.user = undefined;
  req.flash('message', '已退出登录');
  res.redirect('/');
});

router.get('/register', allowRegister, (req, res, next) => {
  res.render('register');
});

router.post('/register', allowRegister, async (req, res, next) => {
  let user = {
    username: req.body.username,
    password: req.body.password,
  };
  try {
    user = await User.create(user);
  } catch (e) {
    console.error(e);
  }
});

router.post('/configure', async (req, res, next) => {
  let user = {
    username: req.body.username,
    password: req.body.password,
    accessToken: req.body.accessToken,
    email: req.body.email,
    prefix: req.body.prefix,
    wechatAppId: req.body.wechatAppId,
    wechatAppSecret: req.body.wechatAppSecret,
    wechatTemplateId: req.body.wechatTemplateId,
    wechatOpenId: req.body.wechatOpenId,
    wechatVerifyToken: req.body.wechatVerifyToken,
  };
  try {
    user = await User.create(user);
    tokenStore.set(user.prefix, {
      appId: user.wechatAppId,
      appSecret: user.wechatAppSecret,
      templateId: user.wechatTemplateId,
      openId: user.wechatOpenId,
      wechatVerifyToken: user.wechatVerifyToken,
      token: '',
    });
  } catch (e) {
    console.error(e);
  }
});

module.exports = router;
