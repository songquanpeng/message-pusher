const express = require('express');
const lexer = require('marked').lexer;
const parser = require('marked').parser;

const router = express.Router();

function md2html(markdown) {
  return parser(lexer(markdown));
}

router.get('/delete/:id', (req, res, next) => {
  // TODO: delete message
  res.json({
    success: true,
    message: 'Ok',
  });
});

router.get('/:id', (req, res, next) => {
  const id = req.params.id;
  // TODO: show article
  req.query.description = req.params.description;
  res.render('article');
});

module.exports = router;
