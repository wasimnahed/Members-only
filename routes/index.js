const express = require("express");
const session = require("express-session");

const router = express.Router();
const validator = require("express-validator");
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const passport = require("passport");

router.get("/", (req, res) => {
  res.redirect("/messages");
});

router.get("/login", (req, res) => {
  res.render("login");
});

router.get("/register", (req, res, next) => {
  res.render("register", { success: false, errors: req.session.errors });
});

// Handle Register
router.post("/register", validateForm(), async function(req, res, next) {
  const { first_name, last_name, username, password } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // There are errors rerender page w/ errors\
    fields = {
      first_name,
      last_name,
      username
    };
    return res.render("register", { errors: errors.array(), fields });
  } else {
    // No errors save user in db
    hashedPassword = await bcrypt.hash(password, 8);
    const newUser = new User({
      first_name,
      last_name,
      username,
      password: hashedPassword
    });
    newUser.save(err => {
      if (err) {
        if (err.code === 11000) {
          req.flash("error_msg", `Username already registered, please login`);
          return res.redirect("/login");
        } else return next(err);
      }
      req.flash("success_msg", "Registration Successful. Please login.");
      res.redirect("/login");
    });
  }
});

// Login Handle
router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/users/dashboard",
    failureRedirect: "/login",
    failureFlash: "Invalid username or password",
    successFlash: true
  })(req, res, next);
});

router.get("/trial", (req, res) => {
  req.flash("error_msg", "this is my error msg");
  req.flash("success_msg", "this is my success msg");
  req.flash("info_msg", "this is my info msg");
  res.redirect("/register");
});

module.exports = router;

function validateForm() {
  return [
    check("first_name", "First name must be at least 2 characters")
      .exists()
      .isLength({ min: 2 })
      .trim()
      .escape(),
    check("last_name", "Last name must be at least 2 characters")
      .exists()
      .trim()
      .isLength({ min: 2 })
      .escape(),
    check("username", "Username needs to be at least 6 characters")
      .exists()
      .trim()
      .isLength({ min: 6 }),
    check("password", "Password must be at least 6 characters").isLength({
      min: 6
    }),
    check("password2", "Passwords must match").custom((value, { req }) => {
      return value === req.body.password;
    })
  ];
}
