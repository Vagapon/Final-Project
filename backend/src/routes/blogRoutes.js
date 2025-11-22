const express = require('express');
const router = express.Router();

const blogController = require('../controllers/blogController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { blogUpload } = require('../config/cloudinary');

router.get('/', blogController.getAllBlogs);
router.get('/:id', blogController.getBlogById);
router.post('/', verifyToken, blogUpload.single('image'), blogController.createBlog);
router.put('/:id', verifyToken, blogUpload.single('image'), blogController.updateBlog);
router.delete('/:id', verifyToken, blogController.deleteBlog);

module.exports = router;

