const express = require("express");

const bodyParser = require("body-parser");
const cors = require("cors");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const mongoose = require("mongoose");

const { User } = require("./models/User");
const { Chatroom } = require("./models/Chatroom");
const { Message } = require("./models/Message");

const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const sharp = require("sharp");
const bcrypt = require("bcrypt");

const fetch = require("node-fetch");

require("dotenv").config({ path: "../.env" });

const {
  MAILRU_EMAIL,
  MAILRU_EMAIL_PASSWORD,
  MONGODB_PASSWORD,
  MONGODB_USERNAME,
  MONGODB_CLUSTERNAME,
  JWT_SECRET,
  YANDEX_CLIENT_ID,
  YANDEX_CLIENT_SECRET,
  MAILRU_CLIENT_ID,
  MAILRU_CLIENT_SECRET,
} = process.env;

console.log(MONGODB_PASSWORD);
const uri = `mongodb+srv://${MONGODB_USERNAME}:${MONGODB_PASSWORD}@${MONGODB_CLUSTERNAME}.ihnhfqd.mongodb.net/users?retryWrites=true&w=majority`;

const PORT = process.env.PORT || 5000;

const app = express();

const corsOptions = {
  origin: "http://localhost:3000",
  optionSuccessStatus: 200,
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Content-Type", "Authorization"],
};

const Pusher = require("pusher");

const pusher = new Pusher({
  appId: "1570359",
  key: "9d8aec400fcc13d51074",
  secret: "ebf1bf914e752d1a27e1",
  cluster: "eu",
  useTLS: true,
});

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("client")); // change to public

let verificationCode = "";

// USERS DATABASE INTERACTIONS
mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to the database"))
  .catch((err) => console.error("Failed to connect to the database: ", err));

// YANDEX DATA
app.get("/api/yandex-data", (req, res) => {
  res.send({
    ok: true,
    YANDEX_CLIENT_ID,
    YANDEX_CLIENT_SECRET,
  });
});

// MAILRU DATA
app.get("/api/mailru-data", (req, res) => {
  res.send({
    ok: true,
    MAILRU_CLIENT_ID,
    MAILRU_CLIENT_SECRET,
  });
});

// USERS FUNCTIONALITY
const { generateRandomUser } = require("./helpers/userDataGenerators");

app.post("/api/users/:username/delete", verifyToken, async (req, res) => {
  const username = req.params.username;

  try {
    const user = await User.findOne({ username });

    if (!user) {
      res.send({
        ok: false,
        message: `User ${username} not found`,
      });

      return;
    }

    await User.deleteOne({ _id: user._id });

    res.send({
      ok: true,
      message: `User ${username} was successfully deleted`,
    });
  } catch (err) {
    res.send({
      ok: false,
      message: `Error while deleting the user: ${err}`,
    });
  }
});

app.get("/api/mailru/accessToken/:authCode", async (req, res) => {
  const { authCode } = req.params;

  try {
    const response = await fetch("https://oauth.mail.ru/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `grant_type=authorization_code&code=${authCode}&client_id=${MAILRU_CLIENT_ID}&client_secret=${MAILRU_CLIENT_SECRET}&redirect_uri=http://localhost:3000/homepage`,
    });

    const data = await response.json();

    console.log(data);

    res.send({
      ok: true,
      message: "Access token fetched successfully",
      access_token: data.access_token,
    });
  } catch (err) {
    res.send({
      ok: false,
      message: "Failed to fetch access token from mail.ru",
    });
  }
});

app.get("/api/yandex/user/:accessToken", async (req, res) => {
  const { accessToken } = req.params;

  try {
    const response = await fetch(
      `https://login.yandex.ru/info?format=json&oauth_token=${accessToken}`
    );

    const userData = await response.json();

    res.send({
      ok: true,
      message: "User info fetched successfully",
      user: userData,
    });
  } catch (err) {
    res.send({
      ok: false,
      message: `Error while fetching user info from yandex: ${err}`,
    });
  }
});

app.get("/api/mailru/user/:accessToken", async (req, res) => {
  const { accessToken } = req.params;

  try {
    const response = await fetch(
      `https://oauth.mail.ru/userinfo?access_token=${accessToken}`
    );

    const userData = await response.json();

    res.send({
      ok: true,
      message: "User info fetched successfully",
      user: userData,
    });
  } catch (err) {
    res.send({
      ok: false,
      message: `Error while fetching user info from mailru: ${err}`,
    });
  }
});

app.post("/api/users/:usernameClient/info", verifyToken, async (req, res) => {
  const { usernameClient } = req.params;

  const userInfoObj = req.body.userInfoObj;

  console.log(userInfoObj);

  try {
    const user = await User.findOne({ username: usernameClient });

    user.height = userInfoObj.height;
    user.weight = userInfoObj.weight;
    user.bodyType = userInfoObj.bodyType;
    user.hairColor = userInfoObj.hairColor;
    user.financialStatus = userInfoObj.financialStatus;
    user.additionalInfo = userInfoObj.additionalInfo;

    await user.save();

    if (!user) {
      res.send({
        ok: false,
        message: "User not found",
      });

      return;
    }

    res.send({
      ok: true,
      message: "User info updated",
    });
  } catch (err) {
    res.send({
      ok: false,
      message: `Error while adding user info: ${err}`,
    });
  }
});

app.get("/api/users/real", verifyToken, async (req, res) => {
  try {
    const countMales = await User.countDocuments({
      gender: "male",
      isBot: false,
    });
    const countFemales = await User.countDocuments({
      gender: "female",
      isBot: false,
    });

    res.send({
      ok: true,
      message: "Users count fetched online",
      countMales,
      countFemales,
    });
  } catch (error) {
    res.send({
      ok: false,
      message: `Could not count users: ${err}`,
    });
  }
});

app.get("/api/users/bots", verifyToken, async (req, res) => {
  try {
    const countMales = await User.countDocuments({
      gender: "male",
      isBot: true,
    });
    const countFemales = await User.countDocuments({
      gender: "female",
      isBot: true,
    });

    res.send({
      ok: true,
      message: "Bots count fetched online",
      countMales,
      countFemales,
    });
  } catch (error) {
    res.send({
      ok: false,
      message: `Could not count bots: ${err}`,
    });
  }
});

app.post(
  "/api/users/generate/:quantityMale/:quantityFemale",
  verifyToken,
  async (req, res) => {
    const quantityMale = +req.params.quantityMale;
    const quantityFemale = +req.params.quantityFemale;

    try {
      for (let i = 0; i < quantityMale; i++) {
        const userObj = await generateRandomUser();
        console.log(userObj);
        const user = new User(userObj);
        console.log(user);

        await user.save();
      }

      for (let i = 0; i < quantityFemale; i++) {
        const userObj = await generateRandomUser(true);

        const user = new User(userObj);

        await user.save();
      }

      res.send({
        ok: true,
        message: "Users generated and saved to the database successfully",
      });
    } catch (err) {
      res.send({
        ok: false,
        message: `Could not generate users: ${err}`,
      });
    }
  }
);

app.post(
  "/api/users/delete/:quantityMale/:quantityFemale",
  verifyToken,
  async (req, res) => {
    const quantityMale = +req.params.quantityMale;
    const quantityFemale = +req.params.quantityFemale;

    try {
      if (quantityMale > 0) {
        const cursorMale = User.find({ gender: "male", isBot: true }).cursor();

        let deletedCount = 0;

        for await (const doc of cursorMale) {
          await User.deleteOne({ _id: doc._id });
          deletedCount++;

          if (deletedCount === quantityMale) {
            break;
          }
        }
      }

      if (quantityFemale > 0) {
        const cursorFemale = User.find({
          gender: "female",
          isBot: true,
        }).cursor();

        let deletedCount = 0;

        for await (const doc of cursorFemale) {
          await User.deleteOne({ _id: doc._id });
          deletedCount++;

          if (deletedCount === quantityFemale) {
            break;
          }
        }
      }

      res.send({
        ok: true,
        message: "Users deleted successfully",
      });
    } catch (err) {
      res.send({
        ok: false,
        message: `Could not delete users: ${err}`,
      });
    }
  }
);

app.post("/api/users", async (req, res) => {
  try {
    const user = new User(req.body.userObj);

    await user.save();

    res.send({
      ok: true,
      message: "The user was added to the database successfully",
      user,
    });
  } catch (err) {
    if (err.code === 11000) {
      res.send({
        ok: false,
        message: "This user already exists",
      });
    } else {
      res.send({
        ok: false,
        message: "Could not add the user to the database: " + err,
      });
    }
  }
});

app.get("/api/users", async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const count = await User.countDocuments();

  try {
    const users = await User.paginate({}, { page, limit });

    res.send({
      ok: true,
      message: "Users fetched from the database successfully",
      users,
      numPages: Math.ceil(count / limit),
    });
  } catch (err) {
    res.send({ ok: false, message: "Could not get users from the database" });
  }
});

app.post("/api/users/filtered", async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const { options } = req.body;

  const ageMin = options.ageMin;
  const ageMax = options.ageMax;

  const currentDate = new Date();

  const minDate = new Date(
    currentDate.getFullYear() - ageMin,
    currentDate.getMonth(),
    currentDate.getDate()
  );
  const maxDate = new Date(
    currentDate.getFullYear() - ageMax,
    currentDate.getMonth(),
    currentDate.getDate()
  );

  let query = {};

  if (options.username && options.username.trim().length > 0) {
    query.username = options.username;
  }

  query.dateOfBirth = { $gte: maxDate, $lte: minDate };

  query.gender = options.gender;

  if (options.region) {
    query.region = options.region;
  }

  if (options.city) {
    query.city = options.city;
  }

  if (options.hasPhoto === true) {
    query.profilePicture = { $ne: null };
  }

  console.log(query);

  const count = await User.countDocuments(query);

  try {
    const users = await User.paginate(query, { page, limit });

    res.send({
      ok: true,
      message: "Users fetched from the database successfully",
      users,
      numPages: Math.ceil(count / limit),
    });
  } catch (err) {
    res.send({ ok: false, message: "Could not get users from the database" });
  }
});

app.get("/api/new-users/:username", async (req, res) => {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const { username } = req.params;

  const users = await User.find({
    username: {
      $ne: username,
      $not: /^.*admin.*$/i,
    },
    createdAt: {
      $gte: new Date(`${currentYear}-${currentMonth}-01`),
      $lte: new Date(`${currentYear}-${currentMonth + 1}-01`),
    },
  }).limit(6);

  try {
    res.send({
      ok: true,
      message: "New users fetched from the database successfully",
      users,
    });
  } catch (err) {
    res.send({ ok: false, message: "Could not get users from the database" });
  }
});

// request user data after login
app.get("/api/user", verifyToken, async (req, res) => {
  try {
    const { userId } = req;

    const user = await User.findById(userId);

    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.send({ ok: true, user, message: "User data retrieved" });
  } catch (err) {
    res.send({ ok: false, message: "Error while retrieving user data" });
  }
});

// get a specific user by id
app.get("/api/users/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });

    if (!user) {
      res.send({
        ok: false,
        message: "The user was not found",
      });
    }

    res.send({
      ok: true,
      message: "User fetched from the database successfully",
      user: {
        username: user.username,
        email: user.email,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        city: user.city,
        region: user.region,
        isVip: user.isVip,
        isAdmin: user.isAdmin,
        profilePicture: user.profilePicture,
        photos: user.photos,
        createdAt: user.createdAt,
        height: user.height,
        weight: user.weight,
        bodyType: user.bodyType,
        hairColor: user.hairColor,
        financialStatus: user.financialStatus,
        additionalInfo: user.additionalInfo,
      },
    });
  } catch (err) {
    res.send({
      ok: false,
      message: "Could not fetch the user from the database",
    });
  }
});

// PROFILE PICTURE FUNCTIONALITY
app.post(
  "/api/users/:id/profilePicture",
  [upload.single("profilePicture"), verifyToken],
  async (req, res) => {
    const userId = req.params.id;

    console.log(req.file.buffer);

    const image = await sharp(req.file.buffer)
      .resize({ width: 200 })
      .jpeg({ quality: 80 })
      .toBuffer();

    const photoData = {
      data: image,
      contentType: req.file.mimetype,
    };

    try {
      await User.findByIdAndUpdate(userId, { profilePicture: photoData });

      res.send({
        ok: true,
        message: "The profile picture was uploaded successfully",
      });
    } catch (err) {
      res.send({
        ok: false,
        message: "Could not upload the profile picture",
      });
    }
  }
);

app.post(
  "/api/users/:id/profilePicture/delete",
  verifyToken,
  async (req, res) => {
    const userId = req.params.id;

    try {
      await User.findByIdAndUpdate(userId, { profilePicture: null });

      res.send({
        ok: true,
        message: "Profile picture removed successfully",
      });
    } catch (err) {
      res.send({
        ok: false,
        message: "Error deleting profile picture",
      });
    }
  }
);

// PHOTOS FUNCTIONALITY
app.post(
  "/api/users/:id/photos",
  [upload.single("photo"), verifyToken],
  async (req, res) => {
    const userId = req.params.id;

    console.log(req.file);

    const image = await sharp(req.file.buffer)
      .resize({ width: 500 })
      .jpeg({ quality: 80 })
      .toBuffer();

    const photoData = {
      data: image,
      contentType: req.file.mimetype,
    };

    try {
      const user = await User.findOne({ _id: userId });

      await user.addPhoto(photoData);

      const photo = user.photos[user.photos.length - 1];
      console.log(photo);

      res.send({
        ok: true,
        message: "Photo added successfully",
        id: photo._id,
      });
    } catch (err) {
      res.send({
        ok: false,
        message: `Error while adding photo: ${err}`,
      });
    }
  }
);

app.post(
  "/api/users/:id/photos/:photoId/delete",
  verifyToken,
  async (req, res) => {
    const userId = req.params.id;
    const { photoId } = req.params;

    try {
      const user = await User.findOne({ _id: userId });

      const photo = user.photos.id(photoId);

      await photo.deleteOne();
      await user.save();

      res.send({
        ok: true,
        message: "Photo removed successfully",
      });
    } catch (err) {
      res.send({ ok: false, message: `Error while deleting a photo: ${err}` });
    }
  }
);

// LOGIN LOGOUT FUNCTIONALITY
app.post("/api/login", async (req, res) => {
  const { userEmail, userPassword } = req.body;

  try {
    const user = await User.findOne({ email: userEmail });

    if (!user) {
      res.send({
        ok: false,
        message: "Пользователь не найден",
        loggedIn: false,
      });

      return;
    }

    const isMatch = await bcrypt.compare(userPassword, user.password);

    if (isMatch) {
      const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
        expiresIn: "1y",
      });

      res.cookie("jwt", token, {
        httpOnly: false,
        maxAge: 31536000000,
        sameSite: false,
      });

      res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
      res.setHeader("Access-Control-Allow-Credentials", true);

      res.send({
        ok: true,
        message: "User was found and logged in",
        loggedIn: true,
      });

      return;
    } else {
      res.send({
        ok: false,
        message: "Неправильный email или пароль",
        loggedIn: false,
      });

      return;
    }
  } catch (err) {
    res.send({
      ok: false,
      message: `Error finding the user: ${err}`,
      loggedIn: false,
    });
  }
});

app.post("/api/logout", (req, res) => {
  try {
    res.clearCookie("jwt");
    res.send({
      ok: true,
      message: "User logged out successfully",
    });
  } catch (err) {
    res.send({
      ok: false,
      message: err,
    });
  }
});

// sending verification email
app.post("/api/send-verification-email", (req, res) => {
  const { userEmail } = req.body;

  if (!userEmail) {
    res.send({ ok: false, message: "No email address was provided" });
  }

  const transporter = nodemailer.createTransport({
    service: "Mail.ru",
    auth: {
      user: MAILRU_EMAIL,
      pass: MAILRU_EMAIL_PASSWORD,
    },
  });

  verificationCode = crypto.randomBytes(20).toString("hex");
  console.log("Verification Code: " + verificationCode);

  const mailOptions = {
    from: MAILRU_EMAIL,
    to: userEmail,
    subject: "Ваш Код Подтверждения для Регистрации на Dating.ru",
    text: `Ваш код: ${verificationCode}`,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.error(error);
      res.send({
        ok: false,
        message: `Error while sending the email: ${error.message}`,
      });
    } else {
      console.log("Email sent: " + info.response);
      res.send({
        ok: true,
        message: "Email sent successfully",
      });
    }
  });
});

app.post("/api/verify-code", (req, res) => {
  const { code } = req.body;

  if (!code) {
    res.send({ ok: false, message: "No code was provided" });
  }

  if (code === verificationCode) {
    res.send({
      ok: true,
      verified: true,
      message: "The verification code is valid",
    });
  } else {
    res.send({
      ok: false,
      verified: false,
      message: "The verification code is invalid",
    });
  }
});

// DIALOGUES FUNCTIONALITY
app.post(
  "/api/dialogues/:emailClient/delete/:username",
  verifyToken,
  async (req, res) => {
    const { emailClient, username } = req.params;

    try {
      const user = await User.findOne({ email: emailClient });

      if (!user) {
        res.send({
          ok: false,
          message: `User ${emailClient} not found`,
        });

        return;
      }

      const getUser = async (id) => {
        const user = await User.findOne({ _id: id });
        return user;
      };

      const usersList = await Promise.all(
        user.dialogueWith.map((id) => getUser(id))
      );

      let userDeleted = null;

      user.dialogueWith = usersList
        .filter((user) => {
          if (user.username == username) {
            userDeleted = user;
          }

          return user && user.username !== username;
        })
        .map((user) => user._id);

      await user.save();

      res.send({
        ok: true,
        message: `Dialogue with ${username} was deleted successfully`,
        userDeletedId: userDeleted ? userDeleted._id : null,
      });
    } catch (err) {
      res.send({
        ok: false,
        message: `Error while deleting the dialogue with ${username}: ${err}`,
      });
    }
  }
);

app.get("/api/dialogues/:username", verifyToken, async (req, res) => {
  const { username } = req.params;

  console.log(
    `Fetching the list of users who have a dialogue with ${username}`
  );

  let user;

  try {
    user = await User.findOne({ username });

    if (!user) {
      res.send({
        ok: false,
        message: `User ${username} not found`,
      });
    }
  } catch (err) {
    res.send({
      ok: false,
      message: `Error while find the user ${username}`,
    });
  }

  const getUser = async (id) => {
    const user = await User.findOne({ _id: id });

    return user;
  };

  const getUsers = async () => {
    return Promise.all(user.dialogueWith.map((id) => getUser(id)));
  };

  const usersList = await getUsers();

  res.send({
    ok: true,
    message: `List of users who have a dialogue with ${username} fetched successfully`,
    users: usersList,
  });
});

app.post("/api/dialogues/:username", verifyToken, async (req, res) => {
  const usernameClient = req.body.usernameClient; // the user who is trying to start a dialogue
  const { username } = req.params; // the user with whom the dialogue will be started

  console.log(
    `${usernameClient} is trying to start a dialogue with ${username}`
  );

  let user;
  let userClient;

  try {
    user = await User.findOne({ username });
  } catch (err) {
    res.send({
      ok: false,
      message: `Error while find the user ${username}`,
    });
  }

  try {
    userClient = await User.findOne({ username: usernameClient });
  } catch (err) {
    res.send({
      ok: false,
      message: `Error while find the user ${usernameClient}`,
    });
  }

  console.log(
    userClient.dialogueWith.findIndex((id) => {
      console.log(`Comparting ${id} with ${user._id}`);
      return id === user._id;
    })
  );

  try {
    if (
      user.dialogueWith.findIndex(
        (id) => id.toString() === userClient._id.toString()
      ) === -1
    ) {
      user.dialogueWith.push(userClient);
      await user.save();
    }

    if (
      userClient.dialogueWith.findIndex(
        (id) => id.toString() === user._id.toString()
      ) === -1
    ) {
      userClient.dialogueWith.push(user);
      await userClient.save();
    }

    res.send({
      ok: true,
      message: `A dialogue between ${usernameClient} and ${username} was successfully created and added to the database`,
    });
  } catch (err) {
    res.send({
      ok: false,
      message: `Error while creating a dialog between ${usernameClient} and ${username}`,
    });
  }
});

// CHATROOM FUNCTIONALITY
app.post("/api/join/:chatroom", verifyToken, async (req, res) => {
  const chatroomName = req.params.chatroom;
  const user = req.body.user;

  const userMongo = await User.findOne({ username: user });

  if (!userMongo) {
    res.send({
      ok: false,
      message: `User ${user} was not found in the database`,
    });
  }

  let chatroom = await Chatroom.findOne({ name: chatroomName });

  if (!chatroom) {
    try {
      chatroom = new Chatroom({ name: chatroomName });
      await chatroom.save();
    } catch (err) {
      res.send({
        ok: false,
        message: `Could not create a new chatroom ${chatroom} and save it to the database: ${err}`,
      });
    }
  }

  try {
    if (chatroom.users.findIndex((username) => username === user) === -1) {
      chatroom.users.push(user);
      await chatroom.save();
    }
  } catch (err) {
    res.send({
      ok: false,
      message: `Could not add ${user} to chatroom ${chatroomName}: ${err}`,
    });
  }

  res.send({
    ok: true,
    message: `User ${user} was successfully added to the chatroom ${chatroomName}`,
  });

  try {
    pusher.trigger(chatroomName, "user-joined", user);
  } catch (err) {
    console.log(
      `Pusher could not trigger a user-joined event to chatroom ${chatroomName}`
    );
  }
});

app.post("/api/leave/:chatroom", verifyToken, async (req, res) => {
  const chatroomName = req.params.chatroom;
  const { user } = req.body;

  const chatroom = await Chatroom.findOne({ name: chatroomName });

  if (!chatroom) {
    res.send({
      ok: false,
      message: `Chatroom ${chatroomName} was not found`,
    });
  }

  const userIndex = chatroom.users.findIndex((username) => username === user);

  if (userIndex != -1) {
    try {
      chatroom.users.splice(userIndex, 1);
      await chatroom.save();

      res.send({
        ok: true,
        message: `User ${user} was removed from chatroom ${chatroomName} successfully`,
      });

      try {
        pusher.trigger(chatroomName, "user-left", user);
      } catch (err) {
        console.log(
          `Pusher could not trigger a user-left event to chatroom ${chatroomName}`
        );
      }
    } catch (err) {
      res.send({
        ok: false,
        message: `Could not remove ${user} form the chatroom ${chatroomName}: ${err}`,
      });
    }
  }
});

// MESSAGES FUNCTIONALITY
app.post(
  "/api/messages/:chatroom",
  [upload.single("message-file"), verifyToken],
  async (req, res) => {
    const chatroomName = req.params.chatroom;
    console.log(chatroomName);
    const messageObj = JSON.parse(req.body.message);

    console.log(messageObj);

    const chatroom = await Chatroom.findOne({ name: chatroomName });

    if (!chatroom) {
      res.send({
        ok: false,
        message: "Chatroom was not found",
      });
    }

    let message;

    try {
      message = new Message({
        sender: messageObj.sender,
        text: messageObj.text,
        file: {
          data: req.file?.buffer ?? null,
          contentType: req.file?.mimetype ?? null,
        },
        createdAt: messageObj.createdAt,
        readByRecipent: messageObj.readByRecipent,
      });

      await message.save();

      chatroom.messages.push(message);
      await chatroom.save();

      if (!req.file && !req.file?.buffer) {
        pusher.trigger(chatroomName, "message", {
          message,
        });
      } else {
        pusher.trigger(chatroomName, "update", {});
      }

      res.send({
        ok: true,
        message: "Message was added to the database successfully",
      });
    } catch (err) {
      res.send({
        ok: false,
        message: `Could not add message to the database: ${err}`,
      });
    }
  }
);

app.get("/api/messages/:chatroom", verifyToken, async (req, res) => {
  const chatroomName = req.params.chatroom;
  console.log(`Fetching messages from ${chatroomName}`);

  console.log(req.body);

  try {
    const chatroom = await Chatroom.findOne({ name: chatroomName }).populate(
      "messages"
    );
    if (!chatroom) {
      return res.send({
        ok: false,
        message: "Chatroom not found to fetch messages from",
      });
    }

    res.send({
      ok: true,
      message: "Messages fetched successfully",
      messages: chatroom.messages,
    });
  } catch (err) {
    console.error(err);
    res.send({ ok: false, message: "Error while fetching messages" });
  }
});

app.get("/api/users-inside/:chatroom", verifyToken, async (req, res) => {
  const chatroomName = req.params.chatroom;
  console.log(`Fetching users from chatroom ${chatroomName}`);

  try {
    const chatroom = await Chatroom.findOne({ name: chatroomName });

    res.send({
      ok: true,
      message: `Users in chatroom ${chatroom} fetched successfully`,
      users: chatroom.users,
    });
  } catch (err) {
    res.send({
      ok: false,
      message: `Error while checking the users inside ${chatroomName}: ${err}`,
      users: null,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}.`);
});

// MIDDLEWARES
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  console.log(`Authorization Header: ${authHeader}`);

  if (!authHeader) {
    res.send({
      ok: false,
      message: "Authorization header missing",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    console.log("token verified");
    next();
  } catch (err) {
    console.log("token not verified");

    res.send({
      ok: false,
      message: "Invalid JWT token",
    });
  }
}
