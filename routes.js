const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const axios = require("axios");
const fs = require("fs");
const requestToken = require("./utils").requestToken;

router.all("/", (req, res, next) => {
  fs.promises
    .access("./.env")
    .then(() => {
      res.render("message", {
        message: "服务已在运行。",
      });
    })
    .catch(() => {
      res.render("configure");
    });
});

router.post("/configure", (req, res, next) => {
  fs.promises
    .access("./.env")
    .then(() => {
      res.render("message", {
        message: ".env 文件已经存在，请手动删除该文件后重试！",
      });
    })
    .catch(() => {
      let content =
        `APP_ID=${req.body.APP_ID}\n` +
        `APP_SECRET=${req.body.APP_SECRET}\n` +
        `TOKEN=${req.body.TOKEN}\n` +
        `TEMPLATE_ID=${req.body.TEMPLATE_ID}\n` +
        `OPEN_ID=${req.body.OPEN_ID}`;
      fs.promises
        .writeFile("./.env", content, "utf8")
        .then(() => {
          res.render("message", {
            message:
              ".env 文件写入成功，程序即将自动关闭以应用写入的新的环境变量，需要进程守护程序自动重启应用或者手动重启。",
          });
          process.exit();
        })
        .catch((e) => {
          res.render("message", {
            message: "在尝试写入 .env 文件时发生错误：" + e,
          });
        });
    });
});

router.all("/verify", (req, res, next) => {
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

router.all("/push", (req, res, next) => {
  // Reference: https://mp.weixin.qq.com/debug/cgi-bin/readtmpl?t=tmplmsg/faq_tmpl
  let content = req.query.content || req.body.content;
  let access_token = req.app.access_token;
  let request_data = {
    touser: process.env.OPEN_ID,
    template_id: process.env.TEMPLATE_ID,
  };
  request_data.data = { text: { value: content } };
  axios
    .post(
      `https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=${access_token}`,
      request_data
    )
    .then((response) => {
      if (response.data && response.data.errcode === "40001") {
        requestToken(req.app);
      }
      res.json(response.data);
    })
    .catch((error) => {
      res.json(error);
    });
});

module.exports = router;
