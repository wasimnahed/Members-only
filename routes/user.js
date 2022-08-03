const express = require("express");
const router = express.Router();
const User = require("../models/User");
const validator = require("express-validator");
const { check, validationResult } = require("express-validator");

router.get("/dashboard", (req, res) => {
  res.redirect("/messages");
});

router.get("/logout", (req, res) => {
  req.logout();
  req.flash("info_msg", "You have been logged out");
  res.redirect("/login");
});

router.get("/join", (req, res) => {
  res.render("users/join_member");
});

router.get("/admin", (req, res) => {
  res.render("users/join_admin");
});

router.post(
  "/admin",
  [
    check("password", "Please make a guess")
      .exists()
      .trim()
      .escape()
  ],
  (req, res) => {
    if (req.body.password === "42" || req.body.password === "forty two") {
      User.findByIdAndUpdate(
        req.body.userid,
        { role: "admin" },
        (err, model) => {
          if (err) {
            next(err);
          } else {
            req.flash("success_msg", "Congrats you're an admin");
            res.redirect("/dashboard");
          }
        }
      );
    } else {
      res.render("users/join", { guess: req.body.password });
    }
  }
);

router.post(
  "/join",
  [
    check("password", "Please make a guess")
      .exists()
      .trim()
      .escape()
  ],
  (req, res) => {
    if (req.body.password === "42" || req.body.password === "forty two") {
      User.findByIdAndUpdate(
        req.body.userid,
        { role: "member" },
        (err, model) => {
          if (err) {
            next(err);
          } else {
            req.flash("success_msg", "Congrats you're a member");
            res.redirect("/dashboard");
          }
        }
      );
    } else {
      res.render("users/join", { guess: req.body.password });
    }
  }
);

module.exports = router;

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  else res.redirect("/login");
}
