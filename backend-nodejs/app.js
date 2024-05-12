const express = require("express");
const app = express();
const mongoose = require("mongoose");

const path = require("path");
const multer = require("multer");


// Required routes start
const feedRoutes = require("./routes/feed");
const authRoutes = require("./routes/auth");
// Required routes end


const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/jpg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.use(express.json());

app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);

app.use("/images", express.static(path.join(__dirname, "images")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, PUT, DELETE, PATCH, POST, GET"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// Routes Start
app.use("/feed", feedRoutes);
app.use("/auth", authRoutes);
// Routes End

app.use((error, req, res, next) => {
  const status = error.statusCode;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

const runServer = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://EfeKarabulut:ATovMdlwrgPsS8FC@ourshop.ujrgiwb.mongodb.net/messages?retryWrites=true&w=majority&appName=OurShop"
    );

    const server = app.listen(8080);
    const io = require("./socket").init(server);
    io.on("connection", (socket) => {
      console.log("Client connected");
    });
    console.log("DB Connected!");
  } catch (err) {
    console.log(err);
  }
};

runServer();
