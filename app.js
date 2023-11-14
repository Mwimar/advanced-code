const express = require("express");
const path = require("path");
// const csrf=require('')
const mongodb = require("mongodb");
const ObjectId = mongodb.ObjectId;
const session = require("express-session");

const sessionConfig = require("./config/session");
const blogRoutes = require("./routes/blogRoutes");
const authMiddleware = require("./middlewares/auth-middleware");
const authRoutes = require("./routes/auth");
const db = require("./data/database");

const mongoDbSessionStore = sessionConfig.createSessionStore(session);

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));

app.use(session(sessionConfig.createSessionConfig(mongoDbSessionStore)));
// app.use(csrf(sess));

app.use(express.static("public"));

app.use(authMiddleware);

app.use(authRoutes);
app.use(blogRoutes);

app.use(function (error, req, res, next) {
  console.log(error);
  res.status(500).render("500");
});

db.connectToDatabase().then(function () {
  app.listen(3000);
});
