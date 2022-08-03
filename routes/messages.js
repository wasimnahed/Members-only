const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const { check, validationResult } = require("express-validator");

// Display all messages
router.get("/", (req, res, next) => {
  Message.getAll(function(messages) {
    return res.render("messages/message_list", { messages });
  });
});

// Form for creating message
router.get("/create", (req, res) => {
  res.render("messages/message_form");
});

// Create a new message
router.post(
  "/create",
  [
    check("title", "Title must be at least 4 characters")
      .exists()
      .isLength({ min: 4 })
      .trim(),
    check("content", "Content must be at least 4 characters")
      .exists()
      .isLength({ min: 4 })
      .trim()
  ],
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // There are errors, rerender page and show errors
      const fields = {
        title: req.body.title,
        content: req.body.content
      };

      return res.render("messages/message_form", {
        fields,
        errors: errors.array()
      });
    } else {
      // There are no errors create message
      const newMessage = new Message({
        title: req.body.title,
        content: req.body.content,
        author: req.body.userid
      });

      // Save message to DB
      newMessage.save((err, message) => {
        if (err) {
          next(err);
        } else {
          req.flash("success_msg", "Message Created");
          return res.redirect("/messages");
        }
      });
    }
  }
);

// Display Messages by Userid
router.get("/users/:userid", (req, res) => {
  Message.getAllByUserid(req.params.userid, messages => {
    res.render("messages/message_list", { messages, allowDeleteButton: true });
  });
});

router.get("/delete/:messageid", (req, res, next) => {
  Message.findById(req.params.messageid, (err, message) => {
    if (err) {
      req.flash("error_msg", "Couldn't find that message");
      return res.redirect("/users/dashboard");
    }
    // User can delete their own message and admin can delete any message.
    if (
      req.user.id === message.author.toString() ||
      req.user.role === "admin"
    ) {
      message.remove(err => {
        if (err) return next(err);
        req.flash("info_msg", "Message Deleted");
        return res.redirect("/users/dashboard");
      });
    } else {
      // not authorized to delete message
      req.flash("error_msg", "Not authorized to delete message");
      return res.redirect("/users/dashboard");
    }
  });
});

router.get("/admin/delete", (req, res) => {
  Message.getAll(function(messages) {
    return res.render("messages/message_list", {
      messages,
      allowDeleteButton: true
    });
  });
});

module.exports = router;

// res.render("messages/message_list", { messages, allowDeleteButton: true });
