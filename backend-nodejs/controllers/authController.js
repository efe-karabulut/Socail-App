const User = require("../models/user");
const { validationResult } = require("express-validator");
const bcryptjs = require("bcryptjs");
const JWT = require("jsonwebtoken");

exports.signUp = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation Failed!");
    error.statusCode = 422;
    error.data = errors.array();
    return next(error);
  }

  const email = req.body.email;
  const password = req.body.password;
  const name = req.body.name;
  try {
    const hashedPassword = await bcryptjs.hash(password, 12);

    const user = new User({
      email: email,
      password: hashedPassword,
      name: name,
    });
    const result = await user.save();
    res
      .status(201)
      .json({ message: "User successfully created!", userId: result._id });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.login = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      const error = new Error("Authentication failed");
      error.statusCode = 401;
      throw error;
    }

    const isEqual = await bcryptjs.compare(password, user.password);
    if (!isEqual) {
      const error = new Error("Authentication failed");
      error.statusCode = 401;
      throw error;
    }

    const token = JWT.sign(
      {
        userId: user._id.toString(),
      },
      "secretKey",
      { expiresIn: "1h" }
    );

    res.status(200).json({ token: token, userId: user._id.toString() });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error("User not found!");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({ status: user.status });
  } catch (error) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.updateUserStatus = async (req, res, next) => {
  const newStatus = req.body.status;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation Failed");
    error.statusCode = 422;
    error.data = errors.array();
    return next(error);
  }

  try {
    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error("User not found!");
      error.statusCode = 404;
      return next(error);
    }

    user.status = newStatus;
    await user.save();

    res.status(200).json({ message: "User status uptaded!" });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
