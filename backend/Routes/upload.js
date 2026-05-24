const express = require("express");
const { authVerify } = require("../Controllers/authController");
const upload = require("../middleware/upload");
const { uploadImage } = require("../Controllers/uploadController");

const router = express.Router();

router.post("/image", authVerify, upload.single("file"), uploadImage);

module.exports = { uploadRouter: router };
