const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },

  dateOfBirth: {
    type: Date,
  },

  gender: {
    type: String,
    required: true,
  },

  city: {
    type: String,
    required: true,
  },

  region: {
    type: String,
    required: true,
  },

  isVip: {
    type: Boolean,
    required: true,
  },

  isBot: {
    type: Boolean,
    default: false,
    required: true,
  },

  isAdmin: {
    type: Boolean,
    required: true,
  },

  profilePicture: {
    data: Buffer,
    contentType: String,
  },

  photos: [
    {
      data: Buffer,
      contentType: String,
    },
  ],

  createdAt: {
    type: Date,
  },

  dialogueWith: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

  balance: {
    type: Number,
    default: 0,
  },

  height: {
    type: Number,
  },

  weight: {
    type: Number,
  },

  bodyType: {
    type: Number,
  },

  hairColor: {
    type: Number,
  },

  financialStatus: {
    type: Number,
  },

  additionalInfo: {
    type: String,
  },
});

userSchema.pre("save", async function (next) {
  const user = this;

  if (!user.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(user.password, salt);

    user.password = hashedPassword;

    return next();
  } catch (err) {
    return next(err);
  }
});

userSchema.plugin(mongoosePaginate);
const User = mongoose.model("User", userSchema);

User.prototype.addPhoto = async function (photo) {
  if (!this.photos) {
    this.photos = [];
  }

  this.photos.push(photo);

  await this.save();
};

module.exports = { User };
