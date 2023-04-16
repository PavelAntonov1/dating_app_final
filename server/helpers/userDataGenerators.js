const crypto = require("crypto");
const axios = require("axios");
const sharp = require("sharp");
const { faker } = require("@faker-js/faker");

// faker

const citiesRegions = require("../data/citiesRegions.json");
const maleNames = require("../data/maleNames.json");
const femaleNames = require("../data/femaleNames.json");

const generateRandomDateOfBirth = () => {
  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - 45);
  const endDate = new Date();
  endDate.setFullYear(endDate.getFullYear() - 18);

  return faker.date.between(startDate, endDate);
};

const generateRandomLocation = () => {
  const locIdx = Math.trunc(Math.random() * citiesRegions.length);
  return citiesRegions[locIdx];
};

const generateRandomName = (isFemale = false) => {
  if (isFemale) {
    const idx = Math.trunc(Math.random() * femaleNames.length);

    return femaleNames[idx];
  } else {
    const idx = Math.trunc(Math.random() * maleNames.length);

    return maleNames[idx];
  }
};

const urlToBuffer = async (url) => {
  const response = await axios.get(url, { responseType: "arraybuffer" });

  const buffer = Buffer.from(response.data, "base64");
  const sharpImage = sharp(buffer);

  const metadata = await sharpImage.metadata();

  if (metadata.format !== "jpeg" && metadata.format !== "png") {
    console.error("Unsupported image format");
    return null;
  }

  const resizedImage = await sharpImage.resize(200, 200).toBuffer();
  return resizedImage;
};

const generateRandomAvatar = async (isFemale = true) => {
  const res = await fetch(
    `https://randomuser.me/api/?gender=${isFemale ? "female" : "male"}`
  );

  if (res.ok) {
    const data = await res.json();

    const imageUrl = data.results[0].picture.large;
    const image = await urlToBuffer(imageUrl);

    console.log(image);
    return { data: image, contentType: "image/jpeg" };
  }

  return null;
};

const generateRandomUser = async (isFemale = false) => {
  const userLocation = generateRandomLocation();
  const password = crypto.randomBytes(10).toString("hex");
  const dateOfBirth = generateRandomDateOfBirth();
  const name = generateRandomName(isFemale);
  const profilePicture = await generateRandomAvatar(isFemale);

  return {
    username: `${name}${dateOfBirth.getFullYear()}`,
    email: `${isFemale ? "bot_female" : "bot_male"}${password}$gmail.com`,
    password,
    gender: isFemale ? "female" : "male",
    dateOfBirth,
    isBot: true,
    isAdmin: false,
    isVip: false,
    region: userLocation.region,
    city: userLocation.city,
    profilePicture,
    createdAt: Date.now(),
  };
};

module.exports = {
  generateRandomUser,
};
