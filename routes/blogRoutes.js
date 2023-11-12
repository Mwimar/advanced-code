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
  const hashedPassword = await bcrypt.hash(password, 12);

  if (
    !enteredEmail ||
    !enteredConfirmEmail ||
    email !== enteredConfirmEmail ||
    !enteredPassword ||
    enteredPassword.trim() < 6
  ) {
    req.session.userData = {
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

  const existingUser = db
    .getDb()
    .collection("users")
    .findOne({ email: enteredEmail });

  const userData = {
    email: email,
    password: hashedPassword,
  };
});

router.get("/login", function (req, res) {
  res.render("login");
});

router.get("/admin", function (req, res) {
  res.render("admin");
});

router.get("/logout", function (req, res) {
  res.redirect("/login");
});

module.exports = router;
