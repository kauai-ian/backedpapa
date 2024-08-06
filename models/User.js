// create a mongoose schema for the user model

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  sub: { type: String, required: true },
  displayName: { type: String, required: true },
  joined: { type: Date, default: Date.now },
  bio: { type: String, default: "" },
  profileImage: { type: String, default: "" },
  connections: { type: Array, default: [] },
});

module.exports = mongoose.model("User", userSchema);
