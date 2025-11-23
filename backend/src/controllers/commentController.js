const Comment = require('../models/Comment');
const Blog = require('../models/Blog');

// Get all comments for a blog (with nested replies)
exports.getCommentsByBlogId = async (req, res) => {
  try {
    const { blogId } = req.params;
    
    // Get all comments (both parent and replies)
    const allComments = await Comment.find({ blogId })
      .populate('userId', 'name email avatar')
      .populate('parentId', 'userId content')
      .sort({ createdAt: -1 });
    
    // Separate parent comments and replies
    const parentComments = allComments.filter(comment => !comment.parentId);
    const replies = allComments.filter(comment => comment.parentId);
    
    // Organize replies under their parent comments
    const commentsWithReplies = parentComments.map(parent => {
      const parentObj = parent.toObject();
      parentObj.replies = replies
        .filter(reply => reply.parentId && reply.parentId._id.toString() === parent._id.toString())
        .map(reply => reply.toObject())
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); // Sort replies by oldest first
      return parentObj;
    });
    
    return res.json({ success: true, data: commentsWithReplies });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return res.status(500).json({ success: false, message: 'Unable to load comments' });
  }
};

// Create a comment (or reply)
exports.createComment = async (req, res) => {
  try {
    const { blogId, content, parentId } = req.body;
    
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Comment content is required' });
    }
    
    if (!blogId) {
      return res.status(400).json({ success: false, message: 'Blog ID is required' });
    }
    
    // Check if blog exists
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }
    
    // If parentId is provided, verify the parent comment exists and belongs to the same blog
    if (parentId) {
      const parentComment = await Comment.findById(parentId);
      if (!parentComment) {
        return res.status(404).json({ success: false, message: 'Parent comment not found' });
      }
      if (parentComment.blogId.toString() !== blogId) {
        return res.status(400).json({ success: false, message: 'Parent comment does not belong to this blog' });
      }
    }
    
    const comment = await Comment.create({
      userId: req.user.id,
      blogId,
      parentId: parentId || null,
      content: content.trim()
    });
    
    // Update blog comment count (only for top-level comments, not replies)
    if (!parentId) {
      await Blog.findByIdAndUpdate(blogId, { $inc: { comments: 1 } });
    }
    
    const populatedComment = await Comment.findById(comment._id)
      .populate('userId', 'name email avatar')
      .populate('parentId', 'userId content');
    
    return res.status(201).json({ success: true, data: populatedComment });
  } catch (error) {
    console.error('Error creating comment:', error);
    return res.status(500).json({ success: false, message: 'Unable to create comment' });
  }
};

// Update a comment
exports.updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Comment content is required' });
    }
    
    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }
    
    // Check if user owns the comment or is admin/staff
    const UserRole = require('../models/UserModel/UserRole');
    const userRole = await UserRole.findOne({ user_id: req.user.id }).populate('role_id');
    const roleCode = userRole?.role_id?.code?.toUpperCase() || '';
    const isPrivileged = ['ADMIN', 'STAFF'].includes(roleCode);
    const isOwner = comment.userId.toString() === req.user.id;
    
    if (!isOwner && !isPrivileged) {
      return res.status(403).json({ success: false, message: 'You do not have permission to edit this comment' });
    }
    
    comment.content = content.trim();
    comment.updatedAt = new Date();
    await comment.save();
    
    const updatedComment = await Comment.findById(id)
      .populate('userId', 'name email avatar');
    
    return res.json({ success: true, data: updatedComment });
  } catch (error) {
    console.error('Error updating comment:', error);
    return res.status(500).json({ success: false, message: 'Unable to update comment' });
  }
};

// Delete a comment (and its replies)
exports.deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    
    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }
    
    // Check if user owns the comment or is admin/staff
    const UserRole = require('../models/UserModel/UserRole');
    const userRole = await UserRole.findOne({ user_id: req.user.id }).populate('role_id');
    const roleCode = userRole?.role_id?.code?.toUpperCase() || '';
    const isPrivileged = ['ADMIN', 'STAFF'].includes(roleCode);
    const isOwner = comment.userId.toString() === req.user.id;
    
    if (!isOwner && !isPrivileged) {
      return res.status(403).json({ success: false, message: 'You do not have permission to delete this comment' });
    }
    
    // Count replies before deletion
    const repliesCount = await Comment.countDocuments({ parentId: id });
    
    // Delete all replies first
    await Comment.deleteMany({ parentId: id });
    
    // Delete the comment itself
    await Comment.findByIdAndDelete(id);
    
    // Update blog comment count (only for top-level comments)
    if (!comment.parentId) {
      await Blog.findByIdAndUpdate(comment.blogId, { $inc: { comments: -(1 + repliesCount) } });
    }
    
    return res.json({ success: true, message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return res.status(500).json({ success: false, message: 'Unable to delete comment' });
  }
};

