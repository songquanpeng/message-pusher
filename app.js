const express = require('express');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const http = require('http');
const serveStatic = require('serve-static');
const config = require('./config');
const indexRouter = require('./routers/index');
const messageRouter = require('./routers/message');
const userRouter = require('./routers/user');
const { refreshToken } = require('./common/wechat');
const { initializeTokenStore, registerWebSocket } = require('./common/token');

const app = express();
const WebSocket = require('ws');

app.locals.isLogged = false;
app.locals.isAdmin = false;
app.locals.message = '';
app.locals.isErrorMessage = false;

setTimeout(async () => {
  // TODO: Here we need an improvement! I have tried EventEmitter but it's not working. :(
  await initializeTokenStore();
  await refreshToken();
  setInterval(async () => refreshToken(), 100 * 60 * 1000);
}, 1000);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('trust proxy', true);

app.use(
  rateLimit({
    windowMs: 30 * 1000,
    max: 30,
  })
);
app.use(
  '/login',
  rateLimit({
    windowMs: 60 * 1000,
    max: 5,
  })
);
app.use(compression());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(config.cookie_secret));
app.use(
  session({
    resave: true,
    saveUninitialized: true,
    secret: config.session_secret,
  })
);
app.use(flash());
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  '/public',
  serveStatic(path.join(__dirname, `public`), {
    maxAge: '600000',
  })
);
app.use('*', (req, res, next) => {
  if (req.session.user !== undefined) {
    res.locals.isLogged = true;
    res.locals.isAdmin = req.session.user.isAdmin;
  }
  next();
});
app.use('/message', messageRouter);
app.use('/', indexRouter);
app.use('/', userRouter);

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
server.listen(config.port);

wss.on('connection', (ws) => {
  ws.on('message', (data) => {
    let message = JSON.parse(data.toString());
    registerWebSocket(message.prefix, message.token, ws);
  });
});

module.exports = app;
