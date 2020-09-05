const axios = require("axios");

module.exports = {
  requestToken: function (app) {
    let token = "";
    axios
      .get(
        `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${process.env.APP_ID}&secret=${process.env.APP_SECRET}`
      )
      .then((res) => {
        if (res.data && res.data.access_token) {
          console.log("Token requested.");
          token = res.data.access_token;
          app.locals.access_token = token;
        } else {
          console.error(res.data);
        }
      });
    return token;
  },

  pushMessage: function (req, res, content) {
    // Reference: https://mp.weixin.qq.com/debug/cgi-bin/readtmpl?t=tmplmsg/faq_tmpl
    let access_token = req.app.locals.access_token;
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
  },
};
