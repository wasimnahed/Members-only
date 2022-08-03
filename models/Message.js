const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const dateFormat = require("dateformat");

const MessageSchema = new Schema(
  {
    title: { type: String, unique: true, required: true, max: 100 },
    content: { type: String, required: true, max: 500 },
    author: { type: Schema.Types.ObjectId, ref: "User" }
  },
  {
    timestamps: true
  }
);

MessageSchema.virtual("dateCreated").get(function() {
  return dateFormat(this.createdAt, "mmmm dS, yyyy, h:MM:ss TT");
});

MessageSchema.static("getAll", function(cb) {
  this.find({})
    .populate("author")
    .exec(function(err, results) {
      if (err) {
        return console.log(err);
      } else {
        cb(results);
      }
    });
});

MessageSchema.static("getAllByUserid", function(userid, cb) {
  this.find({ author: userid })
    .populate("author")
    .exec(function(err, results) {
      if (err) {
        return console.log(err);
      } else {
        cb(results);
      }
    });
});

module.exports = mongoose.model("Message", MessageSchema);
