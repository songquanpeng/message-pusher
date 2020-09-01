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
          console.log("Get token: ", res.data.access_token);
          token = res.data.access_token;
          app.access_token = token;
        } else {
          console.error(res.data);
        }
      });
    return token;
  },
};
