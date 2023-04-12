const mongoose = require("mongoose");

const chatroomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  users: [{ type: String }],
  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }],
});

const Chatroom = mongoose.model("Chatroom", chatroomSchema);

module.exports = { Chatroom };
