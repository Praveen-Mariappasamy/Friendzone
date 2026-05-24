const express = require("express");
const { authVerify } = require("../Controllers/authController");
const {
  createPost,
  fetchPosts,
  addComment,
  fetchPostsWithPhotos,
} = require("../Controllers/postController");
const router = express.Router();

router.post("/create-post", authVerify, createPost);
router.get("/fetch-post", authVerify, fetchPosts);
router.get("/fetch-photos", authVerify, fetchPostsWithPhotos);

router.post("/add-comment", authVerify, addComment);

module.exports.postRouter = router;
