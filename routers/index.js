const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const fs = require("fs");

router.all("/", (req, res, next) => {
  fs.promises
    .access("./.env")
    .then(() => {
      res.render("info", {
        message: "服务已在运行。",
      });
<<<<<<< HEAD:routers/index.js
=======
      // pushMessage(
      //   req,
      //   res,
      //   `请注意，ip 地址为 ${req.ip} 的用户访问了你的消息通知服务，如果非你本人，则你的私有消息通知服务可能已被泄露，当前版本无法阻止其他用户通过本系统向你发送消息。`
      // );
>>>>>>> master:routes.js
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
          res.render("info", {
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

<<<<<<< HEAD:routers/index.js
=======
router.all("/push", (req, res, next) => {
  let content = req.query.content || req.body.content;
  pushMessage(req, res, content);
});

router.get("/favicon.ico", (req, res, next) => {
  res.sendStatus(404);
});

router.all("/:content", (req, res, next) => {
  let content = req.params.content;
  pushMessage(req, res, content);
});

>>>>>>> master:routes.js
module.exports = router;
