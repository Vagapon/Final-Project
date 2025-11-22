
const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String },
    content: { type: String, required: true },
    sport: { type: String },
    location: { type: String },
    imageUrl: { type: String },
    likes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    shares: { type: Number, default: 0 }
  },
  { timestamps: true }
);

const Blog = mongoose.model('Blog', blogSchema);
module.exports = Blog;
