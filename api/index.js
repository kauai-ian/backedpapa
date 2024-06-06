require("dotenv").config();
const createError = require("http-errors");
const express = require("express");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
const http = require("http");
const cors = require("cors");
const routes = require("../routes/event.routes");

const port = process.env.PORT || 3000;

// connect to db
mongoose
  .connect(process.env.MONGO_URI)
  .then((db) => {
    console.log("connected to mongoDB");
    return db;
  })
  .catch((error) => {
    console.error("error connecting with mongoDB", error);
  });

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());
app.set("port", port);

const server = http.createServer(app);

app.use("/api", routes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  console.log(err);
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

app.get("/", (req, res) => res.send("Express on Vercel"));

// for dev development uncomment
// server.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });

module.exports = app;
