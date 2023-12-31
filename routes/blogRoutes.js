const express = require("express");
const blogControllers = require("../controllers/post-controllers");

const guardRoute = require("../middlewares/auth-protection");

const router = express.Router();

router.get("/", blogControllers.getHome);

router.get("/welcome", function (req, res) {
  res.render("welcome");
});

// router.use(guardRoute);

router.get("/admin", blogControllers.getAdmin);

router.post("/posts", blogControllers.getPosts);

router.get("/posts/:id/edit", blogControllers.getSinglePost);

router.post("/posts/:id/edit", blogControllers.updatePost);

router.post("/posts/:id/delete", blogControllers.deletePost);
router.get("/401", blogControllers.get401);

module.exports = router;
