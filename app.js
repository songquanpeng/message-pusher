const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const http = require("http");
require("dotenv").config();

const indexRouter = require("./routes");
const requestToken = require("./utils").requestToken;

const app = express();

requestToken(app);
setInterval(() => requestToken(app), 100 * 60 * 1000);

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);

const port = parseInt(process.env.PORT || "3000");
app.set("port", port);
const server = http.createServer(app);

server.listen(port);

module.exports = app;
