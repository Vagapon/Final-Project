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

const fieldStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "field_images",
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
  },
});

const blogStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "blog_images",
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
  },
});

const staffUpload = multer({ 
  storage: staffStorage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});
const eventUpload = multer({ 
  storage: eventStorage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});
const teamUpload = multer({ 
  storage: teamStrorage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});
const userUpload = multer({ 
  storage: userStorage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});
const fieldUpload = multer({ 
  storage: fieldStorage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});
const blogUpload = multer({ 
  storage: blogStorage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

module.exports = { cloudinary, staffUpload, eventUpload, teamUpload, userUpload, fieldUpload, blogUpload };
