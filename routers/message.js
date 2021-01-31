const express = require('express');
const { Message } = require('../models');
const { md2html } = require('../common/utils');

const router = express.Router();

router.get('/delete/:id', (req, res, next) => {
  // TODO: delete message
  res.json({
    success: true,
    message: 'Ok',
  });
});

router.get('/:id', async (req, res, next) => {
  const id = req.params.id;
  try {
    let message = await Message.findOne({
      where: {
        id: id,
      },
    });
    if (message) {
      message.content = md2html(message.content);
      res.render('article', {
        message,
      });
    }
  } catch (e) {
    res.status(404);
  }
});

module.exports = router;
