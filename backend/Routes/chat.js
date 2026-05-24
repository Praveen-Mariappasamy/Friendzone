const express = require("express");
const { authVerify } = require("../Controllers/authController");
const { chat, analyzePost } = require("../Controllers/chatController");

const router = express.Router();

router.post("/message", authVerify, chat);
router.post("/analyze-post", authVerify, analyzePost);

module.exports = { chatRouter: router };
