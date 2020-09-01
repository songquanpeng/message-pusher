const express = require("express");
const router = express.Router();
const crypto = require("crypto");

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

module.exports = router;
