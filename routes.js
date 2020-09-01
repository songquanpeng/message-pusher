const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const axios = require("axios");

router.get("/", (req, res, next) => {
  res.send("OK");
});

router.get("/verify", (req, res, next) => {
  // 验证消息来自微信服务器：https://developers.weixin.qq.com/doc/offiaccount/Basic_Information/Access_Overview.html
  const { signature, timestamp, nonce, echostr } = req.query;
  const token = process.env.TOKEN;
  let tmp_array = [token, timestamp, nonce].sort();
  let tmp_string = tmp_array.join("");
  tmp_string = crypto.createHash("sha1").update(tmp_string).digest("hex");
  if (tmp_string === signature) {
    res.send(echostr);
  } else {
    res.send("verification failed");
  }
});

router.get("/push", (req, res, next) => {
  // Reference: https://mp.weixin.qq.com/debug/cgi-bin/readtmpl?t=tmplmsg/faq_tmpl
  let content = req.query.content || req.body.content;
  console.log(`Get content: ${content}`);
  let access_token = req.app.access_token;
  let request_data = {
    touser: process.env.OPEN_ID,
    template_id: process.env.TEMPLATE_ID,
  };
  request_data.data = { text: content };
  axios
    .post(
      `https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=${access_token}`,
      request_data
    )
    .then((response) => {
      res.json(response.data);
    })
    .catch((error) => {
      res.json(error);
    });
});

module.exports = router;
