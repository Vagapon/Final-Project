const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const staffStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "staff_avatars",
    allowed_formats: ["jpg", "jpeg", "png"],
  },
});

const eventStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "event-banners",
    allowed_formats: ["jpg", "jpeg", "png"],
  },
});
  const teamStrorage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "team",
      allowed_formats: ["jpg", "jpeg", "png"],
    },
  });
  const userStorage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "user_avatars",
      allowed_formats: ["jpg", "jpeg", "png"],
    },
  });

const staffUpload = multer({ storage: staffStorage });
const eventUpload = multer({ storage: eventStorage });
const teamUpload = multer({ storage: teamStrorage });
const userUpload = multer({ storage: userStorage });

module.exports = { cloudinary, staffUpload, eventUpload, teamUpload, userUpload };
