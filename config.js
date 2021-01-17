const config = {
  allowRegister: true,
  port: process.env.PORT || 3000,
  database: 'data.db',
  href: 'https://github.com/',
  session_secret: 'change this',
  cookie_secret: 'change this',
};

module.exports = config;
