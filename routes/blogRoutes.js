const express = require("express");

const mongodb = require("mongodb");

const db = require("../data/database");
const Post = require("../models/post");

const ObjectId = mongodb.ObjectId;
const router = express.Router();

router.get("/", function (req, res) {
  res.redirect("/welcome");
});

router.get("/welcome", function (req, res) {
  res.render("welcome");
});

router.get("/admin", async function (req, res) {
  if (!res.locals.isAuth) {
    return res.status(401).render("401");
  }
  const posts = await db.getDb().collection("posts").find().toArray();

  let sessionInputData = req.session.inputData;

  if (!sessionInputData) {
    sessionInputData = {
      hasError: false,
      title: "",
      content: "",
    };
  }
  req.session.inputData = null;
  res.render("admin", { posts: posts, inputData: sessionInputData });
});

router.post("/posts", async function (req, res) {
  const user = req.body;
  const enteredTitle = user.title;
  const enteredContent = user.content;

  if (
    !enteredTitle ||
    !enteredContent ||
    enteredTitle.trim() === "" ||
    enteredContent.trim() === ""
  ) {
    req.session.inputData = {
      hasError: true,
      message: "invalid Input",
      title: enteredTitle,
      content: enteredContent,
    };

    return res.redirect("/admin");
  }

  const post = new Post(enteredTitle, enteredContent);
  console.log(post);
  await post.save();
  return res.redirect("/admin");
});

router.get("/posts/:id/edit", async function (req, res) {
  const postId = new ObjectId(req.params.id);
  const post = await db.getDb().collection("posts").findOne({ _id: postId });

  if (!post) {
    return res.render("404");
  }

  let sessionInputData = req.session.inputData;

  if (!sessionInputData) {
    sessionInputData = {
      hasError: false,
      title: post.title,
      content: post.content,
    };
  }
  req.session.inputData = null;

  res.render("single-post", {
    post: post,
    inputData: sessionInputData,
  });
});

router.post("/posts/:id/edit", async function (req, res) {
  const enteredTitle = req.body.title;
  const enteredContent = req.body.content;
  const postId = new ObjectId(req.params.id);

  if (
    !enteredTitle ||
    !enteredContent ||
    enteredTitle.trim() === "" ||
    enteredContent.trim() === ""
  ) {
    req.session.inputData = {
      hasError: true,
      message: "invalid Input",
      title: enteredTitle,
      content: enteredContent,
    };

    req.redirect(`/posts/${req.params.id}/edit`);
    return;
  }

  await db
    .getDb()
    .collection("posts")
    .updateOne(
      { _id: postId },
      { $set: { title: enteredTitle, content: enteredContent } }
    );
  res.redirect("/admin");
});

router.post("/posts/:id/delete", async function (req, res) {
  const postId = new ObjectId(req.params.id);
  await db.getDb().collection("posts").deleteOne({ _id: postId });
  res.redirect("/admin");
});

module.exports = router;
