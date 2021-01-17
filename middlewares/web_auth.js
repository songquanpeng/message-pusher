const config = require('../config');

exports.userRequired = (req, res, next) => {
  if (req.session.user) {
    if (req.session.user.isBlocked) {
      req.flash('message', '用户账户被禁用，请联系管理员');
      return res.redirect('/');
    }
  } else {
    req.flash('message', '用户尚未登录，请登录');
    return res.redirect('/login');
  }
  next();
};

exports.adminRequired = (req, res, next) => {
  if (!req.session.user || !req.session.user.isAdmin) {
    req.flash('message', '需要管理员权限');
    return res.redirect('/login');
  }
  next();
};

exports.allowRegister = (req, res, next) => {
  if (!config.allowRegister) {
    if (!req.session.user || !req.session.user.isAdmin) {
      req.flash('message', '管理员未开放注册！');
      return res.redirect('/');
    }
  }
  next();
};
