require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const app = express();
const PORT = 8000;

// Routers
const authRouter = require("./Routes/auth");
const { userRouter } = require("./Routes/user");
const { friendRouter } = require("./Routes/friend");
const { postRouter } = require("./Routes/post");
const { chatRouter } = require("./Routes/chat");
const { uploadRouter } = require("./Routes/upload");

//middelwares
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

//db
const mongoose = require("mongoose");
const db = process.env.MONGODB_URI;
mongoose
  .connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("connected to database");

    const server = app.listen(PORT, () => {
      console.log("server has started on ", PORT);
    });

    const { initializeSocketIO } = require("./socketio.js");
    initializeSocketIO(server);
  })
  .catch((error) => {
    console.log(error);
  });

app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/friend", friendRouter);
app.use("/post", postRouter);
app.use("/chat", chatRouter);
app.use("/upload", uploadRouter);

const fetchNotification = require("./Controllers/fetchNotification");
const { authVerify } = require("./Controllers/authController");
app.get("/notification", authVerify, fetchNotification); // direct called controller here
// app.post("/test", authVerify, (req, res) => {
//   console.log("in test");
//   const user = req.user;
//   console.log(user);
// });
