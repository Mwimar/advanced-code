const express = require("express");

const bcrypt = require("bcryptjs");

const mongodb = require("mongodb");

const db = require("../data/database");

const ObjectId = mongodb.ObjectId;
const router = express.Router();

router.get("/", function (req, res) {
  res.redirect("/admin");
});

router.get("/signup", function (req, res) {
  res.render("signup");
});

router.post("/signup", async function (req, res) {
  const user = req.body;
  const enteredEmail = user.email;
  const enteredConfirmEmail = user.confirmemail;
  const enteredPassword = user.password;
  const hashedPassword = await bcrypt.hash(enteredPassword, 12);

  if (
    !enteredEmail ||
    !enteredConfirmEmail ||
    enteredEmail !== enteredConfirmEmail ||
    !enteredPassword ||
    enteredPassword.trim() < 6
  ) {
    req.session.inputData = {
      hasError: true,
      message: "Invalid User Data",
      email: enteredEmail,
      confirmEmail: enteredConfirmEmail,
      password: enteredPassword,
    };

    req.session.save(function () {
      res.redirect("/signup");
    });
  }

  const existingUser = await db
    .getDb()
    .collection("users")
    .findOne({ email: enteredEmail });

  if (existingUser) {
    console.log(existingUser);
    console.log("User Exists");
    return res.redirect("/signup");
  }

  const userInfo = {
    email: enteredEmail,
    password: hashedPassword,
  };

  await db.getDb().collection("users").insertOne(userInfo);

  res.redirect("/login");
});

router.get("/login", function (req, res) {
  res.render("login");
});

router.get("/admin", function (req, res) {
  res.render("admin");
});

router.get("/admin", function (req, res) {
  res.render("admin");
});

router.post("/admin/posts", async function (req, res) {
  const user = req.body;
  const enteredTitle = user.title;
  const enteredContent = user.content;

  const post = {
    title: enteredTitle,
    content: enteredContent,
  };
  await db.getDb().collection("posts").insertOne(post);
  res.redirect("/admin");
});

module.exports = router;
