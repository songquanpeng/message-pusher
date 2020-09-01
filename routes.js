const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const axios = require("axios");
const fs = require("fs");
const requestToken = require("./utils").requestToken;
const pushMessage = require("./utils").pushMessage;

router.all("/", (req, res, next) => {
  fs.promises
    .access("./.env")
    .then(() => {
      res.render("message", {
        message: "服务已在运行，本次访问已被记录。",
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
  let content = req.query.content || req.body.content;
  pushMessage(req, res, content);
});

router.all("/:content", (req, res, next) => {
  let content = req.params.content;
  pushMessage(req, res, content);
});

module.exports = router;
