const express = require('express');

const router = express.Router();

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
