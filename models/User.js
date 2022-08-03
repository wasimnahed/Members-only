const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  first_name: { type: String, required: true, max: 50 },
  last_name: { type: String, required: true, max: 50 },
  username: { type: String, required: true, max: 50, unique: true },
  password: { type: String, required: true, max: 50 },
  role: { type: String, enum: ["user", "member", "admin"], default: "user" }
});

// Virtual for users full name
UserSchema.virtual("name").get(function() {
  return `${this.first_name} ${this.last_name}`;
});

UserSchema.virtual("isMember").get(function() {
  return this.role === "member";
});

UserSchema.virtual("isAdmin").get(function() {
  return this.role === "admin";
});

module.exports = mongoose.model("User", UserSchema);
