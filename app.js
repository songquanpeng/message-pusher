const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const http = require('http');
const config = require('./config');

const indexRouter = require('./routers/index');
const messageRouter = require('./routers/message');
const { refreshToken } = require('./common/wechat');
const { initializeTokenStore } = require('./common/token');

const app = express();

setTimeout(async () => {
  // TODO: Here we need an improvement! I have tried EventEmitter but it's not working. :(
  await initializeTokenStore();
  await refreshToken(app);
  setInterval(async () => refreshToken(), 100 * 60 * 1000);
}, 1000);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('trust proxy', true);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/message', messageRouter);

const server = http.createServer(app);

server.listen(config.port);

module.exports = app;
