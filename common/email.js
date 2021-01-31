const nodemailer = require('nodemailer');
const { tokenStore } = require('./token');
const config = require('../config');
const { md2html } = require('./utils');

async function pushEmailMessage(userPrefix, message) {
  let user = tokenStore.get(userPrefix);
  if (!user) {
    return {
      success: false,
      message: `不存在的前缀：${userPrefix}，请注意大小写`,
    };
  }

  let transporter = nodemailer.createTransport({
    host: user.smtpServer,
    secure: true,
    auth: {
      user: user.smtpUser,
      pass: user.smtpPass,
    },
  });

  let targetEmail = user.email;
  if (message.email) {
    targetEmail = message.email;
  }
  try {
    await transporter.sendMail({
      from: `"消息推送服务" <${user.smtpUser}>`,
      to: targetEmail,
      subject: message.description,
      text: message.content,
      html: md2html(message.content),
    });
    return {
      success: true,
      message: 'ok',
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
  pushEmailMessage,
};
