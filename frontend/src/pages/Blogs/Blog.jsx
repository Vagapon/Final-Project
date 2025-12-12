import React, { useEffect, useState } from 'react';
import { Heart, MessageCircle, Send, Home, Users, Calendar, Bell, Settings, User, MapPin, Trophy, X, Edit, Trash2, Loader2, Image, Smile, ChevronDown, MoreHorizontal } from 'lucide-react';
import { blogApi, commentApi, eventApi, teamApi, userApi, fieldApi } from '../../api';
import { message, Modal } from 'antd';
import { useAuth } from '../Authen/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSocket } from '../../contexts/SocketContext';
import UserProfileViewModal from '../../components/UserProfileViewModal';

const defaultAvatar = 'https://api.dicebear.com/7.x/avataaars/svg?seed=default';
const privilegedRoles = ['ADMIN', 'STAFF'];
const initialEditState = {
  content: '',
  location: '',
  imageFile: null,
  imageUrl: ''
};

const formatRelativeTime = (dateString) => {
  if (!dateString) return 'Just now';
  const date = new Date(dateString);
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
};

const Blog = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [postFilter, setPostFilter] = useState('all'); // 'all', 'following', 'myPosts'
  const { isUserOnline } = useSocket();
  const [newPost, setNewPost] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [newImageFile, setNewImageFile] = useState(null);
  const [newImagePreview, setNewImagePreview] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [openMenuPostId, setOpenMenuPostId] = useState(null);
  const [editData, setEditData] = useState(initialEditState);
  const [updating, setUpdating] = useState(false);
  const [editImagePreview, setEditImagePreview] = useState('');
  
  // Comment states
  const [comments, setComments] = useState({}); // { postId: [comments with replies] }
  const [commentInputs, setCommentInputs] = useState({}); // { postId: 'comment text' }
  const [replyInputs, setReplyInputs] = useState({}); // { commentId: 'reply text' }
  const [replyingToCommentId, setReplyingToCommentId] = useState(null); // Currently replying to comment ID
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState('');
  const [loadingComments, setLoadingComments] = useState({}); // { postId: true/false }
  const [submittingComment, setSubmittingComment] = useState({}); // { postId: true/false }
  const [submittingReply, setSubmittingReply] = useState({}); // { commentId: true/false }
  const [expandedComments, setExpandedComments] = useState({}); // { postId: true/false }
  const [expandedReplies, setExpandedReplies] = useState({}); // { commentId: true/false }
  
  // User profile modal states
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUserData, setSelectedUserData] = useState(null);
  const [openUserMenuId, setOpenUserMenuId] = useState(null);
  
  // Sidebar data states
  const [userStats, setUserStats] = useState({
    teamsJoined: 0,
    matches: 0,
    points: 0
  });
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [fields, setFields] = useState([]);
  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [loadingActiveUsers, setLoadingActiveUsers] = useState(false);
  const [loadingFields, setLoadingFields] = useState(false);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await blogApi.getBlogs();
      const data = response.data?.data || [];
      const postsWithLiked = data.map((post) => ({ ...post, liked: false }));
      setPosts(postsWithLiked);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Unable to load posts';
      message.error(errorMessage);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (blogId) => {
    if (!blogId) return;
    
    setLoadingComments(prev => ({ ...prev, [blogId]: true }));
    try {
      const response = await commentApi.getCommentsByBlogId(blogId);
      const commentsData = response.data?.data || [];
      // Comments are already organized with replies nested
      setComments(prev => ({ ...prev, [blogId]: commentsData }));
    } catch (error) {
      console.error('Error fetching comments:', error);
      setComments(prev => ({ ...prev, [blogId]: [] }));
    } finally {
      setLoadingComments(prev => ({ ...prev, [blogId]: false }));
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchSidebarData();
  }, [user]);

  // Fetch sidebar data
  const fetchSidebarData = async () => {
    await Promise.all([
      fetchUserStatistics(),
      fetchFeaturedEvents(),
      fetchActiveUsers(),
      fetchFields()
    ]);
  };

  // Fetch fields
  const fetchFields = async () => {
    setLoadingFields(true);
    try {
      const response = await fieldApi.getAllFields();
      const fieldsData = response.data?.data || response.data || [];
      setFields(fieldsData.slice(0, 10)); // Limit to 10 fields
    } catch (error) {
      console.error('Error fetching fields:', error);
      setFields([]);
    } finally {
      setLoadingFields(false);
    }
  };

  // Fetch user statistics
  const fetchUserStatistics = async () => {
    if (!user?._id) {
      setUserStats({ teamsJoined: 0, matches: 0, points: 0 });
      return;
    }
    
    setLoadingStats(true);
    try {
      // Get user's team
      let teamsJoined = 0;
      try {
        const teamResponse = await teamApi.getMyTeam();
        if (teamResponse.data) {
          teamsJoined = 1;
        }
      } catch (err) {
        // User has no team
        teamsJoined = 0;
      }

      // Get matches and points from user stats API
      let matches = 0;
      let points = 0;
      try {
        const statsResponse = await userApi.getUserStats();
        const statsData = statsResponse.data?.data || statsResponse.data || {};
        matches = statsData.matches || 0;
        points = statsData.points || 0;
      } catch (err) {
        // If no stats API, keep at 0
        matches = 0;
        points = 0;
      }

      setUserStats({
        teamsJoined,
        matches,
        points
      });
    } catch (error) {
      console.error('Error fetching user statistics:', error);
      setUserStats({ teamsJoined: 0, matches: 0, points: 0 });
    } finally {
      setLoadingStats(false);
    }
  };

  // Fetch featured events
  const fetchFeaturedEvents = async () => {
    setLoadingEvents(true);
    try {
      const response = await eventApi.getAllEvents({ 
        limit: 2,
        status: 'active' // or 'upcoming', 'ongoing'
      });
      const events = response.data?.data || response.data || [];
      
      // Get first 2 active/upcoming events
      const featured = events
        .filter(event => ['active', 'upcoming', 'ongoing'].includes(event.status?.toLowerCase()))
        .slice(0, 2)
        .map(event => ({
          _id: event._id,
          name: event.name,
          startDate: event.startDate,
          status: event.status,
          imageUrl: event.imageUrl || event.avatar
        }));
      
      setFeaturedEvents(featured);
    } catch (error) {
      console.error('Error fetching featured events:', error);
      setFeaturedEvents([]);
    } finally {
      setLoadingEvents(false);
    }
  };

  // Fetch all users (both online and offline)
  const fetchActiveUsers = async () => {
    setLoadingActiveUsers(true);
    try {
      const response = await userApi.getAllUsers({});
      const users = response.data?.data || response.data || [];
      
      // Get all users (excluding current user)
      const allUsers = users
        .filter(u => u._id !== user?._id)
        .map(u => ({
          _id: u._id,
          name: u.name,
          avatar: u.avatar,
          isActive: u.isActive !== false, // Consider user active if isActive is not explicitly false
          lastActive: u.lastActive || u.updatedAt || u.createdAt
        }));
      
      setActiveUsers(allUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      setActiveUsers([]);
    } finally {
      setLoadingActiveUsers(false);
    }
  };

  const resetCreateForm = () => {
    setNewPost('');
    setNewLocation('');
    setNewImageFile(null);
    setNewImagePreview('');
  setShowLocationInput(false);
  };

  const handleCreatePost = async () => {
    if (!newPost.trim()) {
      message.warning('Please enter post content');
      return;
    }

    setCreating(true);
    try {
      const payload = {
        content: newPost.trim(),
        location: newLocation || undefined
      };

      if (newImageFile) {
        payload.image = newImageFile;
      }

      const response = await blogApi.createBlog(payload);
      const created = response.data?.data;
      if (created) {
        setPosts((prev) => [{ ...created, liked: false }, ...prev]);
      }
      message.success('Post published successfully');
      resetCreateForm();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Unable to publish post';
      message.error(errorMessage);
    } finally {
      setCreating(false);
    }
  };

  const handleLike = (postId) => {
    setPosts((prev) =>
      prev.map((post) =>
        post._id === postId
          ? {
              ...post,
              liked: !post.liked,
              likes: (post.likes || 0) + (post.liked ? -1 : 1)
            }
          : post
      )
    );
  };

  const canManagePost = (post) => {
    if (!user) return false;
    if (post.userId?._id === user._id) return true;
    return privilegedRoles.includes((user.role || '').toUpperCase());
  };

  const openEditModal = (post) => {
    setEditingPost(post);
    setEditData({
      content: post.content || '',
      location: post.location || '',
      imageFile: null,
      imageUrl: post.imageUrl || ''
    });
    setEditImagePreview(post.imageUrl || '');
  };

  const handleUpdatePost = async () => {
    if (!editingPost) return;
    if (!editData.content.trim()) {
      message.warning('Please enter post content');
      return;
    }

    setUpdating(true);
    try {
      const payload = {
        content: editData.content.trim(),
        location: editData.location || undefined
      };

      if (editData.imageFile) {
        payload.image = editData.imageFile;
      }

      const response = await blogApi.updateBlog(editingPost._id, payload);
      const updated = response.data?.data;
      setPosts((prev) =>
        prev.map((post) =>
          post._id === editingPost._id
            ? { ...(updated || post), liked: post.liked }
            : post
        )
      );
      message.success('Post updated successfully');
      setEditingPost(null);
      setEditImagePreview('');
      setEditData(initialEditState);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Unable to update post';
      message.error(errorMessage);
    } finally {
      setUpdating(false);
    }
  };

  const handleDeletePost = (post) => {
    Modal.confirm({
      title: 'Delete Post',
      content: (
        <span>
          Are you sure you want to delete <strong>{post.content?.slice(0, 30) || 'this post'}</strong>?
        </span>
      ),
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await blogApi.deleteBlog(post._id);
          setPosts((prev) => prev.filter((item) => item._id !== post._id));
          message.success('Post deleted');
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Unable to delete post';
          message.error(errorMessage);
        }
      }
    });
  };

  const handleCloseEditModal = () => {
    if (updating) return;
    setEditingPost(null);
    setEditData(initialEditState);
    setEditImagePreview('');
  };

  // Comment handlers
  const handleCommentInputChange = (postId, value) => {
    setCommentInputs(prev => ({ ...prev, [postId]: value }));
  };

  const handleSubmitComment = async (postId) => {
    if (!user) {
      message.warning('Please login to comment');
      return;
    }
    
    const commentText = commentInputs[postId]?.trim();
    if (!commentText) {
      message.warning('Please enter a comment');
      return;
    }

    setSubmittingComment(prev => ({ ...prev, [postId]: true }));
    try {
      const response = await commentApi.createComment({
        blogId: postId,
        content: commentText
      });
      
      const newComment = response.data?.data;
      if (newComment) {
        // Add new comment with empty replies array
        const commentWithReplies = { ...newComment, replies: [] };
        setComments(prev => ({
          ...prev,
          [postId]: [commentWithReplies, ...(prev[postId] || [])]
        }));
        
        // Update post comment count
        setPosts(prev => prev.map(post => 
          post._id === postId 
            ? { ...post, comments: (post.comments || 0) + 1 }
            : post
        ));
        
        // Auto-expand comments section if not already expanded
        if (!expandedComments[postId]) {
          setExpandedComments(prev => ({ ...prev, [postId]: true }));
        }
      }
      
      setCommentInputs(prev => ({ ...prev, [postId]: '' }));
      message.success('Comment added successfully');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Unable to add comment';
      message.error(errorMessage);
    } finally {
      setSubmittingComment(prev => ({ ...prev, [postId]: false }));
    }
  };

  const handleReplyInputChange = (commentId, value) => {
    setReplyInputs(prev => ({ ...prev, [commentId]: value }));
  };

  const handleSubmitReply = async (postId, parentCommentId) => {
    if (!user) {
      message.warning('Please login to reply');
      return;
    }
    
    const replyText = replyInputs[parentCommentId]?.trim();
    if (!replyText) {
      message.warning('Please enter a reply');
      return;
    }

    setSubmittingReply(prev => ({ ...prev, [parentCommentId]: true }));
    try {
      const response = await commentApi.createComment({
        blogId: postId,
        content: replyText,
        parentId: parentCommentId
      });
      
      const newReply = response.data?.data;
      if (newReply) {
        // Add reply to the parent comment's replies array
        setComments(prev => ({
          ...prev,
          [postId]: (prev[postId] || []).map(comment => {
            if (comment._id === parentCommentId) {
              return {
                ...comment,
                replies: [...(comment.replies || []), newReply]
              };
            }
            return comment;
          })
        }));
      }
      
      setReplyInputs(prev => ({ ...prev, [parentCommentId]: '' }));
      setReplyingToCommentId(null);
      message.success('Reply added successfully');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Unable to add reply';
      message.error(errorMessage);
    } finally {
      setSubmittingReply(prev => ({ ...prev, [parentCommentId]: false }));
    }
  };

  const toggleReplyInput = (commentId) => {
    if (replyingToCommentId === commentId) {
      setReplyingToCommentId(null);
      setReplyInputs(prev => ({ ...prev, [commentId]: '' }));
    } else {
      setReplyingToCommentId(commentId);
    }
  };

  const handleEditComment = (comment) => {
    setEditingCommentId(comment._id);
    setEditingCommentText(comment.content);
  };

  const handleCancelEditComment = () => {
    setEditingCommentId(null);
    setEditingCommentText('');
  };

  const handleUpdateComment = async (commentId, blogId, isReply = false, parentCommentId = null) => {
    if (!editingCommentText.trim()) {
      message.warning('Please enter a comment');
      return;
    }

    try {
      const response = await commentApi.updateComment(commentId, {
        content: editingCommentText.trim()
      });
      
      const updatedComment = response.data?.data;
      if (updatedComment) {
        if (isReply && parentCommentId) {
          // Update reply in parent comment's replies array
          setComments(prev => ({
            ...prev,
            [blogId]: (prev[blogId] || []).map(comment => {
              if (comment._id === parentCommentId) {
                return {
                  ...comment,
                  replies: (comment.replies || []).map(reply =>
                    reply._id === commentId ? updatedComment : reply
                  )
                };
              }
              return comment;
            })
          }));
        } else {
          // Update top-level comment
          setComments(prev => ({
            ...prev,
            [blogId]: (prev[blogId] || []).map(comment =>
              comment._id === commentId ? { ...updatedComment, replies: comment.replies || [] } : comment
            )
          }));
        }
      }
      
      setEditingCommentId(null);
      setEditingCommentText('');
      message.success('Comment updated successfully');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Unable to update comment';
      message.error(errorMessage);
    }
  };

  const handleDeleteComment = (comment, blogId, isReply = false, parentCommentId = null) => {
    Modal.confirm({
      title: 'Delete Comment',
      content: 'Are you sure you want to delete this comment?',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await commentApi.deleteComment(comment._id);
          
          if (isReply && parentCommentId) {
            // Remove reply from parent comment's replies array
            setComments(prev => ({
              ...prev,
              [blogId]: (prev[blogId] || []).map(c => {
                if (c._id === parentCommentId) {
                  return {
                    ...c,
                    replies: (c.replies || []).filter(r => r._id !== comment._id)
                  };
                }
                return c;
              })
            }));
          } else {
            // Remove top-level comment
            setComments(prev => ({
              ...prev,
              [blogId]: (prev[blogId] || []).filter(c => c._id !== comment._id)
            }));
            
            // Update post comment count (only for top-level comments)
            const commentToDelete = comments[blogId]?.find(c => c._id === comment._id);
            const repliesCount = commentToDelete?.replies?.length || 0;
            setPosts(prev => prev.map(post => 
              post._id === blogId 
                ? { ...post, comments: Math.max((post.comments || 0) - (1 + repliesCount), 0) }
                : post
            ));
          }
          
          message.success('Comment deleted successfully');
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Unable to delete comment';
          message.error(errorMessage);
        }
      }
    });
  };

  const canManageComment = (comment) => {
    if (!user) return false;
    if (comment.userId?._id === user._id) return true;
    return privilegedRoles.includes((user.role || '').toUpperCase());
  };

  const toggleComments = (postId) => {
    const willExpand = !expandedComments[postId];
    setExpandedComments(prev => ({ ...prev, [postId]: willExpand }));
    
    // Fetch comments if expanding and not already loaded
    if (willExpand && !comments[postId] && !loadingComments[postId]) {
      fetchComments(postId);
    }
  };

  // Handle user menu actions
  const handleViewProfile = (author) => {
    if (!author || !author._id) return;
    setSelectedUserId(author._id);
    setSelectedUserData(author);
    setShowProfileModal(true);
    setOpenUserMenuId(null);
  };

  const handleStartChat = (author) => {
    if (!author || !author._id) return;
    if (!user) {
      message.warning('Please login to start a chat');
      return;
    }
    // Navigate to chat with user ID in state or query param
    navigate('/chat', { state: { userId: author._id, userName: author.name } });
    setOpenUserMenuId(null);
  };

  // Navigation handlers
  const handleNavigate = (path) => {
    navigate(path);
    setSidebarOpen(false); // Close mobile sidebar
  };

  const handleViewMyProfile = () => {
    if (user?._id) {
      setSelectedUserId(user._id);
      setSelectedUserData(user);
      setShowProfileModal(true);
    }
  };

  // Determine active route
  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  const sidebarItems = [
    { 
      icon: Home, 
      label: "Home", 
      path: "/",
      active: isActiveRoute("/")
    },
    { 
      icon: Users, 
      label: "My Team", 
      path: "/myteam",
      active: isActiveRoute("/myteam")
    },
    { 
      icon: Calendar, 
      label: "Events", 
      path: "/challenge",
      active: isActiveRoute("/challenge")
    },
    { 
      icon: MapPin, 
      label: "Book Field", 
      path: "/book",
      active: isActiveRoute("/book") || location.pathname.startsWith("/booking")
    },
    { 
      icon: MessageCircle, 
      label: "Chat", 
      path: "/chat",
      active: isActiveRoute("/chat")
    }
  ];

  // Filter posts based on selected filter
  const filteredPosts = React.useMemo(() => {
    if (postFilter === 'myPosts') {
      return posts.filter(post => post.userId?._id === user?._id);
    }
    // For 'all' and 'following', return all posts (following can be implemented later with follow feature)
    return posts;
  }, [posts, postFilter, user?._id]);

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-50 via-slate-50 to-gray-100">
      <div className="w-full">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)}>
            <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out" onClick={(e) => e.stopPropagation()}>
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Menu</h2>
                  <button onClick={() => setSidebarOpen(false)} className="p-1 hover:bg-gray-100 rounded">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Football Fields Section */}
                <div className="mb-4 pb-4 border-b">
                  <h3 className="font-semibold text-gray-900 mb-3 text-sm flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-green-600" />
                    Football Fields
                  </h3>
                  {loadingFields ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    </div>
                  ) : fields.length === 0 ? (
                    <div className="text-center py-2 text-gray-500 text-xs">
                      No fields available
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                      {fields.map((field) => (
                        <div
                          key={field._id}
                          onClick={() => {
                            navigate(`/book`);
                            setSidebarOpen(false);
                          }}
                          className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          {field.imageUrl ? (
                            <img
                              src={field.imageUrl}
                              alt={field.name}
                              className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div 
                            className={`w-8 h-8 rounded-lg bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center text-white font-semibold text-xs flex-shrink-0 ${field.imageUrl ? 'hidden' : ''}`}
                          >
                            {field.name?.charAt(0)?.toUpperCase() || 'F'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 text-xs truncate">{field.name || 'Unnamed Field'}</p>
                            {field.address && (
                              <p className="text-xs text-gray-500 truncate">{field.address}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Online/Offline Users Section */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 text-sm flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    Users
                  </h3>
                  {loadingActiveUsers ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    </div>
                  ) : activeUsers.length === 0 ? (
                    <div className="text-center py-2 text-gray-500 text-xs">
                      No users found
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                      {activeUsers.map((activeUser) => {
                        const isOnline = isUserOnline(activeUser._id);
                        return (
                          <div 
                            key={activeUser._id} 
                            className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors"
                            onClick={() => {
                              handleViewProfile(activeUser);
                              setSidebarOpen(false);
                            }}
                          >
                            <div className="relative flex-shrink-0">
                              <img
                                src={activeUser.avatar || defaultAvatar}
                                alt={activeUser.name || 'User'}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                              {isOnline ? (
                                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                              ) : (
                                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-gray-400 rounded-full border-2 border-white"></div>
                              )}
                            </div>
                            <span className={`text-xs truncate flex-1 ${isOnline ? 'text-gray-700' : 'text-gray-500'}`}>
                              {activeUser.name || 'User'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex">
        {/* Desktop Sidebar */}
          <div className="w-64 space-y-4 hidden lg:block flex-shrink-0 p-4">
            {/* Football Fields Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-green-600" />
                Football Fields
              </h3>
              {loadingFields ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                </div>
              ) : fields.length === 0 ? (
                <div className="text-center py-4 text-gray-500 text-sm">
                  No fields available
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                  {fields.map((field) => (
                    <div
                      key={field._id}
                      onClick={() => navigate(`/book`)}
                      className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      {field.imageUrl ? (
                        <img
                          src={field.imageUrl}
                          alt={field.name}
                          className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div 
                        className={`w-10 h-10 rounded-lg bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 ${field.imageUrl ? 'hidden' : ''}`}
                      >
                        {field.name?.charAt(0)?.toUpperCase() || 'F'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">{field.name || 'Unnamed Field'}</p>
                        {field.address && (
                          <p className="text-xs text-gray-500 truncate">{field.address}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Online/Offline Users Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Users
              </h3>
              {loadingActiveUsers ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                </div>
              ) : activeUsers.length === 0 ? (
                <div className="text-center py-4 text-gray-500 text-sm">
                  No users found
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                  {activeUsers.map((activeUser) => {
                    const isOnline = isUserOnline(activeUser._id);
                    return (
                      <div 
                        key={activeUser._id} 
                        className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors"
                        onClick={() => handleViewProfile(activeUser)}
                      >
                        <div className="relative flex-shrink-0">
                          <img
                            src={activeUser.avatar || defaultAvatar}
                            alt={activeUser.name || 'User'}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          {isOnline ? (
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                          ) : (
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-gray-400 rounded-full border-2 border-white"></div>
                          )}
                        </div>
                        <span className={`text-sm truncate flex-1 ${isOnline ? 'text-gray-700' : 'text-gray-500'}`}>
                          {activeUser.name || 'User'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Statistics</h3>
              {loadingStats ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Teams Joined</span>
                    <span className="font-semibold text-blue-600">{userStats.teamsJoined}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Matches</span>
                    <span className="font-semibold text-green-600">{userStats.matches}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Points</span>
                    <span className="font-semibold text-yellow-600">{userStats.points.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0 max-w-3xl mx-auto px-3 sm:px-4 py-4 lg:py-6 space-y-4 lg:space-y-6">
            {/* Create Post */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-start gap-3 px-4 py-3">
                <img
                  src={user?.avatar || defaultAvatar}
                  alt={user?.name || 'You'}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900">{user?.name || 'You'}</p>
                 
                  </div>
                  <button
                    type="button"
                    className="mt-1 inline-flex items-center gap-1 px-2 py-1 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50"
                  >
                    Friends
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <div className="px-4">
                <textarea
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder={`What's on your mind, ${user?.name?.split(' ')[0] || 'friend'}?`}
                  className="w-full text-lg text-gray-900 placeholder-gray-400 border-none focus:ring-0 resize-none min-h-[120px]"
                />
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-r from-pink-500 to-yellow-500 text-white font-semibold text-sm">
                    Aa
                  </div>
                  <span>Add to your post</span>
                </div>
                { (showLocationInput || newLocation) && (
                  <div className="flex items-center gap-2 border border-gray-200 rounded-2xl px-3 py-2 text-sm text-gray-600 mt-4">
                    <MapPin className="w-4 h-4 text-red-500" />
                    <input
                      type="text"
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      placeholder="Enter your location"
                      className="flex-1 bg-transparent focus:outline-none"
                    />
                    {newLocation && (
                      <button
                        type="button"
                        onClick={() => setNewLocation('')}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
                {newImagePreview && (
                  <div className="relative mt-4">
                    <img
                      src={newImagePreview}
                      alt="preview"
                      className="w-full rounded-2xl border border-gray-100 object-cover max-h-96"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setNewImageFile(null);
                        setNewImagePreview('');
                      }}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              <div className="px-4 pb-4 space-y-3">
                <div className="mt-4 border border-gray-200 rounded-2xl px-4 py-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Add to your post</span>
                  <div className="flex items-center gap-2">
                    <label
                      className="w-9 h-9 rounded-full bg-green-50 text-green-600 flex items-center justify-center cursor-pointer hover:bg-green-100"
                      title="Photo/Video"
                    >
                      <Image className="w-5 h-5" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setNewImageFile(file);
                          setNewImagePreview(file ? URL.createObjectURL(file) : '');
                        }}
                      />
                    </label>
                    <button
                      type="button"
                      className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center"
                      title="Tag friends"
                    >
                      <Users className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowLocationInput(true)}
                      className="w-9 h-9 rounded-full bg-red-50 text-red-500 flex items-center justify-center"
                      title="Check in"
                    >
                      <MapPin className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      className="w-9 h-9 rounded-full bg-yellow-50 text-yellow-600 flex items-center justify-center"
                      title="Feeling/Activity"
                    >
                      <Smile className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      className="w-9 h-9 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center text-xs font-bold"
                      title="GIF"
                    >
                      GIF
                    </button>
                    <button
                      type="button"
                      className="w-9 h-9 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center"
                      title="More options"
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <button
                  onClick={handleCreatePost}
                  disabled={!newPost.trim() || creating}
                  className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-semibold hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-500 transition-colors flex items-center justify-center gap-2"
                >
                  {creating && <Loader2 className="w-4 h-4 animate-spin" />}
                  Publish
                </button>
              </div>
            </div>

            {/* Posts */}
            <div className="space-y-4 lg:space-y-6">
              {loading ? (
                <div className="bg-white rounded-lg p-6 flex flex-col items-center justify-center text-gray-500">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
                  Loading posts...
                </div>
              ) : filteredPosts.length === 0 ? (
                <div className="bg-white rounded-lg p-6 text-center text-gray-500">
                  {postFilter === 'myPosts' 
                    ? "You haven't posted anything yet. Be the first to share!"
                    : postFilter === 'following'
                    ? "No posts from people you follow yet."
                    : "No posts yet. Be the first to share!"
                  }
                </div>
              ) : (
                filteredPosts.map((post) => {
                  const author = post.userId || {};
                  const canManage = canManagePost(post);
                  return (
                    <div key={post._id} className="bg-white rounded-lg p-3 sm:p-4 overflow-hidden">
                  {/* Post Header */}
                  <div className="p-3 sm:p-4 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 min-w-0 flex-1 relative">
                        <div className="relative">
                          <img
                            src={author.avatar || defaultAvatar}
                            alt={author.name || 'User'}
                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex-shrink-0 object-cover cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                            onClick={() => setOpenUserMenuId(openUserMenuId === post._id ? null : post._id)}
                          />
                          {openUserMenuId === post._id && (
                            <div className="absolute left-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-30 overflow-hidden">
                              <button
                                onClick={() => handleViewProfile(author)}
                                className="w-full flex items-center space-x-2 px-4 py-3 hover:bg-gray-50 text-left transition-colors"
                              >
                                <User className="w-4 h-4 text-gray-600" />
                                <span className="text-sm text-gray-700">View Profile</span>
                              </button>
                              <button
                                onClick={() => handleStartChat(author)}
                                className="w-full flex items-center space-x-2 px-4 py-3 hover:bg-gray-50 text-left transition-colors"
                              >
                                <MessageCircle className="w-4 h-4 text-blue-600" />
                                <span className="text-sm text-gray-700">Start Chat</span>
                              </button>
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 
                              className="font-semibold text-gray-900 text-sm sm:text-base truncate cursor-pointer hover:text-blue-600 transition-colors"
                              onClick={() => setOpenUserMenuId(openUserMenuId === post._id ? null : post._id)}
                            >
                              {author.name || 'User'}
                            </h3>
                            {author.verified && (
                              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-white text-xs">✓</span>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 text-xs sm:text-sm text-gray-500">
                            <span>{formatRelativeTime(post.createdAt)}</span>
                            {post.location && (
                              <div className="flex items-center space-x-1 mt-1 sm:mt-0">
                                <span className="hidden sm:inline">•</span>
                                <MapPin className="w-3 h-3" />
                                <span className="truncate">{post.location}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      {canManage && (
                        <div className="relative">
                          <button
                            onClick={() =>
                              setOpenMenuPostId((prev) => (prev === post._id ? null : post._id))
                            }
                            className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
                          >
                            <MoreHorizontal className="w-5 h-5" />
                          </button>
                          {openMenuPostId === post._id && (
                            <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-lg border border-gray-100 z-20 overflow-hidden">
                              <button
                                onClick={() => {
                                  handleLike(post._id);
                                  setOpenMenuPostId(null);
                                }}
                                className="w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-50 text-left"
                              >
                                <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                                  +
                                </div>
                                <div>
                                  <p className="font-semibold text-sm text-gray-900">Interested</p>
                                  <p className="text-xs text-gray-500">You'll see more similar posts.</p>
                                </div>
                              </button>
                              <button
                                onClick={() => {
                                  setOpenMenuPostId(null);
                                  setTimeout(() => handleDeletePost(post), 0);
                                }}
                                className="w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-50 text-left"
                              >
                                <div className="w-7 h-7 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center">
                                  -
                                </div>
                                <div>
                                  <p className="font-semibold text-sm text-gray-900">Not Interested</p>
                                  <p className="text-xs text-gray-500">You'll see fewer similar posts.</p>
                                </div>
                              </button>
                              <div className="border-t border-gray-100" />
                              <button
                                onClick={() => {
                                  openEditModal(post);
                                  setOpenMenuPostId(null);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-sm text-gray-700"
                              >
                                <Edit className="w-4 h-4 text-blue-500" />
                                Edit Post
                              </button>
                              <button
                                onClick={() => {
                                  handleDeletePost(post);
                                  setOpenMenuPostId(null);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-sm text-red-600"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete Post
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="p-3 sm:p-4">
                    <p className="text-gray-900 mb-3 text-sm sm:text-base whitespace-pre-line">{post.content}</p>
                    {post.imageUrl && (
                      <img
                        src={post.imageUrl}
                        alt={post.content?.slice(0, 30) || 'Post content'}
                        className="w-full h-48 sm:h-64 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    )}
                  </div>

                  {/* Post Actions */}
                  <div className="px-3 sm:px-4 py-2 border-t border-gray-100">
                    <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500 mb-3">
                      <span>{post.likes || 0} like{post.likes !== 1 ? 's' : ''}</span>
                      <div className="flex space-x-2 sm:space-x-4">
                        <span>{post.comments || 0} comment{post.comments !== 1 ? 's' : ''}</span>
                        <span>{post.shares || 0} share{post.shares !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      <button
                        onClick={() => handleLike(post._id)}
                        className={`flex items-center justify-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 rounded-lg hover:bg-gray-100 text-xs sm:text-sm ${
                          post.liked ? 'text-red-500' : 'text-gray-600'
                        }`}
                      >
                        <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${post.liked ? 'fill-current' : ''}`} />
                        <span className="hidden sm:inline">Like</span>
                      </button>
                      <button 
                        onClick={() => toggleComments(post._id)}
                        className="flex items-center justify-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-xs sm:text-sm"
                      >
                        <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="hidden sm:inline">Comment</span>
                      </button>
                      <button 
                        onClick={() => {
                          if (!user) {
                            message.warning('Please login to send a message');
                            return;
                          }
                          const author = post.userId || {};
                          if (author._id) {
                            navigate('/chat', { state: { userId: author._id, userName: author.name } });
                          } else {
                            message.warning('Unable to start chat with this user');
                          }
                        }}
                        className="flex items-center justify-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-xs sm:text-sm"
                      >
                        <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="hidden sm:inline">Message</span>
                      </button>
                    </div>
                  </div>

                  {/* Comment Section */}
                  <div className="px-3 sm:px-4 pb-3 sm:pb-4 border-t border-gray-100">
                    {/* Comments List */}
                    {expandedComments[post._id] && (
                      <div className="mt-4 space-y-3 max-h-96 overflow-y-auto">
                        {loadingComments[post._id] ? (
                          <div className="flex items-center justify-center py-4">
                            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                          </div>
                        ) : (comments[post._id] || []).length === 0 ? (
                          <div className="text-center py-4 text-gray-500 text-sm">
                            No comments yet. Be the first to comment!
                          </div>
                        ) : (
                          (comments[post._id] || []).map((comment) => {
                            const commentAuthor = comment.userId || {};
                            const canManage = canManageComment(comment);
                            const isEditing = editingCommentId === comment._id;
                            const isReplying = replyingToCommentId === comment._id;
                            const replies = comment.replies || [];
                            const hasReplies = replies.length > 0;
                            
                            return (
                              <div key={comment._id} className="space-y-2">
                                {/* Main Comment */}
                                <div className="flex items-start space-x-3 group">
                                  <img
                                    src={commentAuthor.avatar || defaultAvatar}
                                    alt={commentAuthor.name || 'User'}
                                    className="w-8 h-8 rounded-full flex-shrink-0 object-cover"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="bg-gray-50 rounded-2xl px-3 py-2">
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="font-semibold text-sm text-gray-900">
                                          {commentAuthor.name || 'User'}
                                        </span>
                                        {canManage && !isEditing && (
                                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                              onClick={() => handleEditComment(comment)}
                                              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                              title="Edit"
                                            >
                                              <Edit className="w-3 h-3" />
                                            </button>
                                            <button
                                              onClick={() => handleDeleteComment(comment, post._id, false, null)}
                                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                                              title="Delete"
                                            >
                                              <Trash2 className="w-3 h-3" />
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                      {isEditing ? (
                                        <div className="space-y-2">
                                          <textarea
                                            value={editingCommentText}
                                            onChange={(e) => setEditingCommentText(e.target.value)}
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                            rows={2}
                                            autoFocus
                                          />
                                          <div className="flex items-center gap-2">
                                            <button
                                              onClick={() => handleUpdateComment(comment._id, post._id, false, null)}
                                              className="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                            >
                                              Save
                                            </button>
                                            <button
                                              onClick={handleCancelEditComment}
                                              className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                                            >
                                              Cancel
                                            </button>
                                          </div>
                                        </div>
                                      ) : (
                                        <p className="text-sm text-gray-700 whitespace-pre-line">{comment.content}</p>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-3 mt-1 ml-1">
                                      <span className="text-xs text-gray-500">
                                        {formatRelativeTime(comment.createdAt)}
                                      </span>
                                      {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
                                        <span className="text-xs text-gray-400">(edited)</span>
                                      )}
                                      {!isEditing && (
                                        <button
                                          onClick={() => toggleReplyInput(comment._id)}
                                          className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                                        >
                                          Reply
                                        </button>
                                      )}
                                      {hasReplies && (
                                        <button
                                          onClick={() => setExpandedReplies(prev => ({ ...prev, [comment._id]: !prev[comment._id] }))}
                                          className="text-xs text-gray-500 hover:text-gray-700"
                                        >
                                          {expandedReplies[comment._id] ? 'Hide' : 'Show'} {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Replies Section */}
                                {hasReplies && expandedReplies[comment._id] && (
                                  <div className="ml-11 space-y-2 border-l-2 border-gray-200 pl-3">
                                    {replies.map((reply) => {
                                      const replyAuthor = reply.userId || {};
                                      const canManageReply = canManageComment(reply);
                                      const isEditingReply = editingCommentId === reply._id;
                                      
                                      return (
                                        <div key={reply._id} className="flex items-start space-x-2 group">
                                          <img
                                            src={replyAuthor.avatar || defaultAvatar}
                                            alt={replyAuthor.name || 'User'}
                                            className="w-6 h-6 rounded-full flex-shrink-0 object-cover"
                                          />
                                          <div className="flex-1 min-w-0">
                                            <div className="bg-gray-50 rounded-xl px-2 py-1.5">
                                              <div className="flex items-center justify-between mb-1">
                                                <span className="font-semibold text-xs text-gray-900">
                                                  {replyAuthor.name || 'User'}
                                                </span>
                                                {canManageReply && !isEditingReply && (
                                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                      onClick={() => handleEditComment(reply)}
                                                      className="p-0.5 text-blue-600 hover:bg-blue-50 rounded"
                                                      title="Edit"
                                                    >
                                                      <Edit className="w-2.5 h-2.5" />
                                                    </button>
                                                    <button
                                                      onClick={() => handleDeleteComment(reply, post._id, true, comment._id)}
                                                      className="p-0.5 text-red-600 hover:bg-red-50 rounded"
                                                      title="Delete"
                                                    >
                                                      <Trash2 className="w-2.5 h-2.5" />
                                                    </button>
                                                  </div>
                                                )}
                                              </div>
                                              {isEditingReply ? (
                                                <div className="space-y-1.5">
                                                  <textarea
                                                    value={editingCommentText}
                                                    onChange={(e) => setEditingCommentText(e.target.value)}
                                                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                                    rows={2}
                                                    autoFocus
                                                  />
                                                  <div className="flex items-center gap-1.5">
                                                    <button
                                                      onClick={() => handleUpdateComment(reply._id, post._id, true, comment._id)}
                                                      className="px-2 py-0.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                                                    >
                                                      Save
                                                    </button>
                                                    <button
                                                      onClick={handleCancelEditComment}
                                                      className="px-2 py-0.5 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                                                    >
                                                      Cancel
                                                    </button>
                                                  </div>
                                                </div>
                                              ) : (
                                                <p className="text-xs text-gray-700 whitespace-pre-line">{reply.content}</p>
                                              )}
                                            </div>
                                            <div className="flex items-center gap-2 mt-0.5 ml-1">
                                              <span className="text-xs text-gray-400">
                                                {formatRelativeTime(reply.createdAt)}
                                              </span>
                                              {reply.updatedAt && reply.updatedAt !== reply.createdAt && (
                                                <span className="text-xs text-gray-300">(edited)</span>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}

                                {/* Reply Input */}
                                {isReplying && (
                                  <div className="ml-11 flex items-center space-x-2">
                                    <img
                                      src={user?.avatar || defaultAvatar}
                                      alt={user?.name || 'You'}
                                      className="w-6 h-6 rounded-full flex-shrink-0 object-cover"
                                    />
                                    <div className="flex-1 flex items-center space-x-2">
                                      <input
                                        type="text"
                                        value={replyInputs[comment._id] || ''}
                                        onChange={(e) => handleReplyInputChange(comment._id, e.target.value)}
                                        onKeyPress={(e) => {
                                          if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSubmitReply(post._id, comment._id);
                                          }
                                        }}
                                        placeholder="Write a reply..."
                                        disabled={submittingReply[comment._id]}
                                        className="flex-1 px-2 py-1.5 text-xs bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                        autoFocus
                                      />
                                      <button
                                        onClick={() => handleSubmitReply(post._id, comment._id)}
                                        disabled={!replyInputs[comment._id]?.trim() || submittingReply[comment._id]}
                                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                      >
                                        {submittingReply[comment._id] ? (
                                          <Loader2 className="w-3 h-3 animate-spin" />
                                        ) : (
                                          <Send className="w-3 h-3" />
                                        )}
                                      </button>
                                      <button
                                        onClick={() => toggleReplyInput(comment._id)}
                                        className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                    
                    {/* Comment Input */}
                    <div className="mt-4 flex items-center space-x-3">
                      <img
                        src={user?.avatar || defaultAvatar}
                        alt={user?.name || 'You'}
                        className="w-8 h-8 rounded-full flex-shrink-0 object-cover"
                      />
                      <div className="flex-1 flex items-center space-x-2">
                        <input
                          type="text"
                          value={commentInputs[post._id] || ''}
                          onChange={(e) => handleCommentInputChange(post._id, e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSubmitComment(post._id);
                            }
                          }}
                          placeholder={user ? "Write a comment..." : "Login to comment..."}
                          disabled={!user || submittingComment[post._id]}
                          className="flex-1 px-3 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <button
                          onClick={() => handleSubmitComment(post._id)}
                          disabled={!user || !commentInputs[post._id]?.trim() || submittingComment[post._id]}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-full flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {submittingComment[post._id] ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Sidebar - Hidden on mobile and tablet */}
          <div className="w-80 space-y-4 hidden xl:block flex-shrink-0 p-4">
            {/* Featured Events */}
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Featured Events</h3>
              {loadingEvents ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                </div>
              ) : featuredEvents.length === 0 ? (
                <div className="text-center py-4 text-gray-500 text-sm">
                  No featured events available
                </div>
              ) : (
                <div className="space-y-3">
                  {featuredEvents.map((event) => {
                    const eventDate = event.startDate ? new Date(event.startDate) : null;
                    const formattedDate = eventDate 
                      ? eventDate.toLocaleDateString('en-US', { weekday: 'short', hour: '2-digit', minute: '2-digit' })
                      : 'TBD';
                    
                    return (
                      <div 
                        key={event._id} 
                        className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                        onClick={() => navigate(`/challenges/${event._id}`)}
                      >
                        {event.imageUrl ? (
                          <img
                            src={event.imageUrl}
                            alt={event.name}
                            className="w-12 h-12 rounded-lg object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div 
                          className={`w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center ${event.imageUrl ? 'hidden' : ''}`}
                        >
                          <Trophy className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">{event.name}</h4>
                          <p className="text-sm text-gray-500">{formattedDate}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Active Users */}
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Active Now</h3>
              {loadingActiveUsers ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                </div>
              ) : activeUsers.length === 0 ? (
                <div className="text-center py-4 text-gray-500 text-sm">
                  No users found
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                  {activeUsers.map((activeUser) => (
                    <div 
                      key={activeUser._id} 
                      className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors"
                      onClick={() => handleViewProfile(activeUser)}
                    >
                      <div className="relative flex-shrink-0">
                        <img
                          src={activeUser.avatar || defaultAvatar}
                          alt={activeUser.name || 'User'}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        {activeUser.isActive ? (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        ) : (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-gray-400 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      <span className={`text-sm truncate flex-1 ${activeUser.isActive ? 'text-gray-700' : 'text-gray-500'}`}>
                        {activeUser.name || 'User'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Join */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-4 text-white">
              <h3 className="font-semibold mb-2">Join Now!</h3>
              <p className="text-sm opacity-90 mb-3">
                Find teams near you and join today
              </p>
              <button className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                Explore Now
              </button>
            </div>
          </div>
        </div>
      </div>

      <Modal
        title="Edit Post"
        open={!!editingPost}
        okText="Save"
        cancelText="Cancel"
        confirmLoading={updating}
        onCancel={handleCloseEditModal}
        onOk={handleUpdatePost}
        destroyOnClose
        maskClosable={!updating}
      >
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <textarea
              value={editData.content}
              onChange={(e) => setEditData((prev) => ({ ...prev, content: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={editData.location}
                onChange={(e) => setEditData((prev) => ({ ...prev, location: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image (optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setEditData((prev) => ({ ...prev, imageFile: file }));
                  setEditImagePreview(file ? URL.createObjectURL(file) : editData.imageUrl || '');
                }}
                className="w-full"
              />
            </div>
          </div>
          {(editImagePreview || editData.imageUrl) && (
            <img
              src={editImagePreview || editData.imageUrl}
              alt="preview"
              className="w-full h-40 object-cover rounded-lg border border-gray-200"
            />
          )}
        </div>
      </Modal>

      {/* User Profile Modal */}
      <UserProfileViewModal
        isOpen={showProfileModal}
        onClose={() => {
          setShowProfileModal(false);
          setSelectedUserId(null);
          setSelectedUserData(null);
        }}
        userId={selectedUserId}
        userData={selectedUserData}
        onChatClick={() => handleStartChat(selectedUserData)}
      />
    </div>
  );
};

export default Blog;