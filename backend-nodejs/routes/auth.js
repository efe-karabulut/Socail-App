const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { body } = require("express-validator");
const User = require("../models/user");
const isAuth = require("../middleware/is-auth");

router.post(
  "/sign-up",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email!")
      .custom((value) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject("This E-Mail already exists!");
          }
        });
      }),
    body("password")
      .trim()
      .isLength({ min: 5 })
      .withMessage("Password must be at least 5 characters long"),
    body("name")
      .trim()
      .isLength({ min: 3 })
      .withMessage("Name must be at least 3 characters long"),
  ],
  authController.signUp
);

router.post("/login", authController.login);

router.get("/status", isAuth, authController.getUserStatus);

router.patch(
  "/update/status",
  isAuth,
  [body("status").trim().isLength({ min: 3 })],
  authController.updateUserStatus
);

module.exports = router;
