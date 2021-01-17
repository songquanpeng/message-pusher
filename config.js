const config = {
  allowRegister: true,
  port: process.env.PORT || 3000,
  database: 'data.db',
  href: 'https://your.domain.com/',
  session_secret: 'change this',
  cookie_secret: 'change this',
};

module.exports = config;
