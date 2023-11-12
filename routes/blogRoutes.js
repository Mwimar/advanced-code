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
