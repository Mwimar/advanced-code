const Post = require("../models/post");
const validationSession = require("../util/validation-session");
const validation = require("../util/validation");

function getHome(req, res) {
  res.redirect("/welcome");
}

async function getAdmin(req, res) {
  if (!res.locals.isAuth) {
    return res.status(401).render("401");
  }
  const posts = await Post.fetchAll();
  const sessionErrorData = validationSession.getSessionErrorData(req, {
    title: "",
    content: "",
  });

  res.render("admin", { posts: posts, inputData: sessionErrorData });
}

async function getPosts(req, res) {
  const user = req.body;
  const enteredTitle = user.title;
  const enteredContent = user.content;

  if (!validation.postIsValid(enteredTitle, enteredContent)) {
    validationSession.flashingErrorsToSession(req, {
      message: "invalid input- please check data",
      title: enteredTitle,
      content: enteredContent,
    }),
      function () {
        return res.redirect("/admin");
      };
  }

  const post = new Post(enteredTitle, enteredContent);
  console.log(post);
  await post.save();
  return res.redirect("/admin");
}

async function getSinglePost(req, res) {
  let post;
  try {
    post = new Post(null, null, req.params.id);
  } catch (error) {
    return res.render("404");
  }

  await post.fetch();

  if (!post.title || !post.content) {
    return res.render("404");
  }

  const sessionErrorData = validationSession.getSessionErrorData(req, {
    title: post.title,
    content: post.content,
  });

  res.render("single-post", {
    post: post,
    inputData: sessionErrorData,
  });
}

async function updatePost(req, res) {
  const enteredTitle = req.body.title;
  const enteredContent = req.body.content;
  const postId = new ObjectId(req.params.id);

  if (!validation.postIsValid(enteredTitle, enteredContent)) {
    validationSession.flashingErrorsToSession(
      req,
      {
        message: "invalid input- please check data",
        title: enteredTitle,
        content: enteredContent,
      },
      function () {
        res.redirect(`/posts/${req.params.id}/edit`);
      }
    );
    return;
  }

  const post = new Post(enteredTitle, enteredContent, req.params.id);
  await post.save();

  res.redirect("/admin");
}

async function deletePost(req, res) {
  const post = new Post(null, null, req.params.id);

  await post.delete();
  res.redirect("/admin");
}

module.exports = {
  getHome: getHome,
  getAdmin: getAdmin,
  getPosts: getPosts,
  getSinglePost: getSinglePost,
  updatePost: updatePost,
  deletePost: deletePost,
};
