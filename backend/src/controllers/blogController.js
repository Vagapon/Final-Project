const Blog = require('../models/Blog');
const UserRole = require('../models/UserModel/UserRole');

const PRIVILEGED_ROLES = ['ADMIN', 'STAFF'];

const hasPrivilegedRole = async (userId) => {
  if (!userId) return false;
  const userRole = await UserRole.findOne({ user_id: userId }).populate('role_id');
  const roleCode = userRole?.role_id?.code || '';
  return PRIVILEGED_ROLES.includes(roleCode.toUpperCase());
};

exports.getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find()
      .populate('userId', 'name email avatar')
      .sort({ createdAt: -1 });
    return res.json({ success: true, data: blogs });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return res.status(500).json({ success: false, message: 'Không thể tải danh sách blog' });
  }
};

exports.getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate('userId', 'name email avatar');
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog không tồn tại' });
    }
    return res.json({ success: true, data: blog });
  } catch (error) {
    console.error('Error fetching blog:', error);
    return res.status(500).json({ success: false, message: 'Không thể tải blog' });
  }
};

exports.createBlog = async (req, res) => {
  try {
    const { title, content, sport, location, imageUrl } = req.body;
    if (!content) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập nội dung bài viết' });
    }

    const blog = await Blog.create({
      userId: req.user.id,
      title,
      content,
      sport,
      location,
      imageUrl: req.file?.path || imageUrl
    });

    const populatedBlog = await blog.populate('userId', 'name email avatar');
    return res.status(201).json({ success: true, data: populatedBlog });
  } catch (error) {
    console.error('Error creating blog:', error);
    return res.status(500).json({ success: false, message: 'Không thể tạo blog' });
  }
};

exports.updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog không tồn tại' });
    }

    const isOwner = blog.userId.toString() === req.user.id;
    const canEdit = isOwner || (await hasPrivilegedRole(req.user.id));

    if (!canEdit) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền chỉnh sửa blog này' });
    }

    const { title, content, sport, location, imageUrl } = req.body;
    blog.title = typeof title !== 'undefined' ? title : blog.title;
    blog.content = typeof content !== 'undefined' ? content : blog.content;
    blog.sport = typeof sport !== 'undefined' ? sport : blog.sport;
    blog.location = typeof location !== 'undefined' ? location : blog.location;
    blog.imageUrl = req.file?.path || imageUrl || blog.imageUrl;
    blog.updatedAt = new Date();
    await blog.save();

    const populatedBlog = await blog.populate('userId', 'name email avatar');
    return res.json({ success: true, data: populatedBlog });
  } catch (error) {
    console.error('Error updating blog:', error);
    return res.status(500).json({ success: false, message: 'Không thể cập nhật blog' });
  }
};

exports.deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog không tồn tại' });
    }

    const isOwner = blog.userId.toString() === req.user.id;
    const canDelete = isOwner || (await hasPrivilegedRole(req.user.id));

    if (!canDelete) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền xóa blog này' });
    }

    await blog.deleteOne();
    return res.json({ success: true, message: 'Đã xóa blog' });
  } catch (error) {
    console.error('Error deleting blog:', error);
    return res.status(500).json({ success: false, message: 'Không thể xóa blog' });
  }
};

