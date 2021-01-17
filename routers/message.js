const express = require('express');
const lexer = require('marked').lexer;
const parser = require('marked').parser;
const Message = require('../models/message').Message;
const pushWeChatMessage = require('../common/wechat').pushWeChatMessage;
const formatTime = require('../common/utils').formatTime;

const router = express.Router();

function md2html(markdown) {
  return parser(lexer(markdown));
}

router.get('/:description', (req, res, next) => {
  req.query.description = req.params.description;
  next();
});

router.all('/', (req, res) => {
  let message = {
    title: req.query.title || req.body.title || '无标题',
    status: 1,
    created_by: '系统', // TODO
    created_time: formatTime(),
    description: req.query.description || req.body.description,
    content: md2html(req.query.content || req.body.content),
  };

  Message.create(message)
    .then((value) => {
      console.log(value);
      pushWeChatMessage(message.description, message.link)
        .then((response) => {
          res.json(response);
        })
        .catch((reason) => {
          res.json(reason);
        });
    })
    .catch((reason) => {
      res.json(reason);
    });
});

router.get('/detail/:id', (req, res) => {
  const id = req.params.id;
  Message.getById(id)
    .then((value) => {
      console.log(value);
      res.render('message', value[0]);
    })
    .catch((reason) => {
      res.render('info', {
        message: '获取该消息时发生了错误：' + reason,
      });
    });
});

module.exports = router;
