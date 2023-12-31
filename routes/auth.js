const express = require("express");

const bcrypt = require("bcryptjs");

const db = require("../data/database");

const router = express.Router();

router.get("/signup", function (req, res) {
  let sessionInputData = req.session.inputData;
  if (!sessionInputData) {
    sessionInputData = {
      hasError: false,
      email: "",
      confirmEmail: "",
      password: "",
    };
  }
  console.log(sessionInputData);
  req.session.inputData = null;
  res.render("signup", {
    inputData: sessionInputData,
  });
});

router.post("/signup", async function (req, res) {
  const user = req.body;
  const enteredEmail = user.email;
  const enteredConfirmEmail = user.confirmemail;
  const enteredPassword = user.password;

  if (
    !enteredEmail ||
    !enteredConfirmEmail ||
    enteredEmail !== enteredConfirmEmail ||
    !enteredPassword ||
    enteredPassword.trim().length < 6 ||
    !enteredEmail.includes("@")
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
    return;
  }

  const existingUser = await db
    .getDb()
    .collection("users")
    .findOne({ email: enteredEmail });

  if (existingUser) {
    req.session.inputData = {
      hasError: true,
      message: "User Already exists",
      email: enteredEmail,
      confirmEmail: enteredConfirmEmail,
      password: enteredPassword,
    };
    req.session.save(function () {
      res.redirect("/signup");
    });
    return;
  }

  const hashedPassword = await bcrypt.hash(enteredPassword, 12);

  const userInfo = {
    email: enteredEmail,
    password: hashedPassword,
  };

  await db.getDb().collection("users").insertOne(userInfo);

  res.redirect("/login");
});

router.get("/login", function (req, res) {
  let sessionInputData = req.session.inputData;
  if (!sessionInputData) {
    sessionInputData = {
      hasError: false,
      email: "",
      confirmEmail: "",
      password: "",
    };
  }
  req.session.inputData = null;
  res.render("login", { inputData: sessionInputData });
});

router.post("/login", async function (req, res) {
  const user = req.body;
  const enteredEmail = user.email;
  const enteredConfirmEmail = user.confirmemail;
  const enteredPassword = user.password;

  const existingUser = await db
    .getDb()
    .collection("users")
    .findOne({ email: enteredEmail });

  if (!existingUser) {
    req.session.inputData = {
      hasError: true,
      message: " Could not log you in - please check your details",
      email: enteredEmail,
      password: enteredPassword,
    };
    req.session.save(function () {
      res.redirect("/login");
    });
    return;
  }

  const passwordsAreEqual = await bcrypt.compare(
    enteredPassword,
    existingUser.password
  );

  if (!passwordsAreEqual) {
    req.session.inputData = {
      hasError: true,
      message: " Could not log you in - please check your details",
      email: enteredEmail,
      password: enteredPassword,
    };
    req.session.save(function () {
      res.redirect("/login");
    });
    return;
  }

  req.session.user = {
    id: existingUser._id,
    email: existingUser.email,
  };
  req.session.isAuthenticated = true;
  req.session.save(function () {
    res.redirect("/admin");
  });
});

router.post("/logout", function (req, res) {
  req.session.user = null;
  req.session.isAuthenticated = false;
  res.redirect("/");
});

module.exports = router;
