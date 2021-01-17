const express = require('express');
const router = express.Router();
const { User } = require('../models');
const { tokenStore } = require('../common/token');
const { requestToken } = require('../common/wechat');
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
  res.locals.verifyUrl = config.href + req.session.user.prefix + '/verify';
  res.render('configure', req.session.user);
});

router.post('/configure', userRequired, async (req, res, next) => {
  let id = req.session.user.id;
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
    req.session.user = userObj;
    tokenStore.set(userObj.prefix, {
      wechatAppId: userObj.wechatAppId,
      wechatAppSecret: userObj.wechatAppSecret,
      wechatTemplateId: userObj.wechatTemplateId,
      wechatOpenId: userObj.wechatOpenId,
      wechatVerifyToken: userObj.wechatVerifyToken,
      token: await requestToken(userObj.wechatAppId, userObj.wechatAppSecret),
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
