const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  sender: {
    type: String,
  },
  text: {
    type: String,
  },
  file: {
    data: Buffer,
    contentType: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  readByRecipent: {
    type: Boolean,
    default: true,
  },
});

const Message = mongoose.model("Message", messageSchema);

module.exports = { Message };
