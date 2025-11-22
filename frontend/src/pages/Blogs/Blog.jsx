import React, { useEffect, useState } from 'react';
import { Heart, MessageCircle, Share2, Send, Home, Users, Calendar, Bell, Settings, User, MapPin, Trophy, X, Edit, Trash2, Loader2, Image, Smile, ChevronDown, MoreHorizontal } from 'lucide-react';
import { blogApi } from '../../api';
import { message, Modal } from 'antd';
import { useAuth } from '../Authen/AuthContext';

const defaultAvatar = 'https://api.dicebear.com/7.x/avataaars/svg?seed=default';
const privilegedRoles = ['ADMIN', 'STAFF'];
const initialEditState = {
  content: '',
  location: '',
  imageFile: null,
  imageUrl: ''
};

const formatRelativeTime = (dateString) => {
  if (!dateString) return 'Vừa xong';
  const date = new Date(dateString);
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes < 1) return 'Vừa xong';
  if (diffMinutes < 60) return `${diffMinutes} phút trước`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} giờ trước`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} ngày trước`;
};

const Blog = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
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

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await blogApi.getBlogs();
      const data = response.data?.data || [];
      setPosts(data.map((post) => ({ ...post, liked: false })));
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Không thể tải bài viết';
      message.error(errorMessage);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const resetCreateForm = () => {
    setNewPost('');
    setNewLocation('');
    setNewImageFile(null);
    setNewImagePreview('');
  setShowLocationInput(false);
  };

  const handleCreatePost = async () => {
    if (!newPost.trim()) {
      message.warning('Vui lòng nhập nội dung bài viết');
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
      message.success('Đăng bài thành công');
      resetCreateForm();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Không thể đăng bài';
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
      message.warning('Vui lòng nhập nội dung bài viết');
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
      message.success('Cập nhật bài viết thành công');
      setEditingPost(null);
      setEditImagePreview('');
      setEditData(initialEditState);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Không thể cập nhật bài viết';
      message.error(errorMessage);
    } finally {
      setUpdating(false);
    }
  };

  const handleDeletePost = (post) => {
    Modal.confirm({
      title: 'Xóa bài viết',
      content: (
        <span>
          Bạn có chắc chắn muốn xóa <strong>{post.content?.slice(0, 30) || 'bài viết này'}</strong>?
        </span>
      ),
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await blogApi.deleteBlog(post._id);
          setPosts((prev) => prev.filter((item) => item._id !== post._id));
          message.success('Đã xóa bài viết');
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Không thể xóa bài viết';
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

  const sidebarItems = [
    { icon: Home, label: "Trang chủ", active: true },
    { icon: Users, label: "Tìm đội", badge: "3" },
    { icon: Calendar, label: "Sự kiện", badge: "2" },
    { icon: Trophy, label: "Giải đấu" },
    { icon: Bell, label: "Thông báo", badge: "5" },
    { icon: Settings, label: "Cài đặt" }
  ];

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
                
                <div className="flex items-center space-x-3 mb-4 pb-4 border-b">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-gray-50 via-slate-50 to-gray-100 flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-600" />
                  </div>
                </div>
                
                <nav className="space-y-2">
                  {sidebarItems.map((item, index) => (
                    <button
                      key={index}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left hover:bg-gray-100 ${
                        item.active ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                      }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <div className="flex items-center space-x-3">
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        )}

        <div className="flex">
        {/* Desktop Sidebar */}
          <div className="w-64 space-y-4 hidden lg:block flex-shrink-0 p-4">
            <div className="p-4">

              <nav className="space-y-2">
                {sidebarItems.map((item, index) => (
                  <button
                    key={index}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left hover:bg-gray-100 ${
                      item.active ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                        {item.badge}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            {/* Quick Stats */}
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Thống kê</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Đội đã tham gia</span>
                  <span className="font-semibold text-blue-600">12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Trận đấu</span>
                  <span className="font-semibold text-green-600">25</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Điểm số</span>
                  <span className="font-semibold text-yellow-600">1,450</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0 max-w-3xl mx-auto px-3 sm:px-4 py-4 lg:py-6 space-y-4 lg:space-y-6">
            {/* Create Post */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-start gap-3 px-4 py-3">
                <img
                  src={user?.avatar || defaultAvatar}
                  alt={user?.name || 'Bạn'}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900">{user?.name || 'Bạn'}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                      Admin
                    </span>
                  </div>
                  <button
                    type="button"
                    className="mt-1 inline-flex items-center gap-1 px-2 py-1 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50"
                  >
                    Bạn bè
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <div className="px-4">
                <textarea
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder={`${user?.name?.split(' ')[0] || 'Bạn'} ơi, bạn đang nghĩ gì thế?`}
                  className="w-full text-lg text-gray-900 placeholder-gray-400 border-none focus:ring-0 resize-none min-h-[120px]"
                />
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-r from-pink-500 to-yellow-500 text-white font-semibold text-sm">
                    Aa
                  </div>
                  <span>Thêm vào bài viết của bạn</span>
                </div>
                { (showLocationInput || newLocation) && (
                  <div className="flex items-center gap-2 border border-gray-200 rounded-2xl px-3 py-2 text-sm text-gray-600 mt-4">
                    <MapPin className="w-4 h-4 text-red-500" />
                    <input
                      type="text"
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      placeholder="Nhập địa điểm của bạn"
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
                  <span className="text-sm font-medium text-gray-600">Thêm vào bài viết của bạn</span>
                  <div className="flex items-center gap-2">
                    <label
                      className="w-9 h-9 rounded-full bg-green-50 text-green-600 flex items-center justify-center cursor-pointer hover:bg-green-100"
                      title="Ảnh/video"
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
                      title="Gắn thẻ bạn bè"
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
                      title="Cảm xúc/hoạt động"
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
                      title="Tuỳ chọn khác"
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
                  Đăng
                </button>
              </div>
            </div>

            {/* Posts */}
            <div className="space-y-4 lg:space-y-6">
              {loading ? (
                <div className="bg-white rounded-lg p-6 flex flex-col items-center justify-center text-gray-500">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
                  Đang tải bài viết...
                </div>
              ) : posts.length === 0 ? (
                <div className="bg-white rounded-lg p-6 text-center text-gray-500">
                  Chưa có bài viết nào. Hãy là người đầu tiên chia sẻ!
                </div>
              ) : (
                posts.map((post) => {
                  const author = post.userId || {};
                  const canManage = canManagePost(post);
                  return (
                    <div key={post._id} className="bg-white rounded-lg p-3 sm:p-4 overflow-hidden">
                  {/* Post Header */}
                  <div className="p-3 sm:p-4 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <img
                          src={author.avatar || defaultAvatar}
                          alt={author.name || 'Người dùng'}
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex-shrink-0 object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{author.name || 'Người dùng'}</h3>
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
                                  <p className="font-semibold text-sm text-gray-900">Quan tâm</p>
                                  <p className="text-xs text-gray-500">Bạn sẽ nhìn thấy nhiều bài viết tương tự hơn.</p>
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
                                  <p className="font-semibold text-sm text-gray-900">Không quan tâm</p>
                                  <p className="text-xs text-gray-500">Bạn sẽ nhìn thấy ít bài viết tương tự hơn.</p>
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
                                Chỉnh sửa bài viết
                              </button>
                              <button
                                onClick={() => {
                                  handleDeletePost(post);
                                  setOpenMenuPostId(null);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-sm text-red-600"
                              >
                                <Trash2 className="w-4 h-4" />
                                Xóa bài viết
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
                      <span>{post.likes || 0} lượt thích</span>
                      <div className="flex space-x-2 sm:space-x-4">
                        <span>{post.comments || 0} bình luận</span>
                        <span>{post.shares || 0} chia sẻ</span>
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
                        <span className="hidden sm:inline">Thích</span>
                      </button>
                      <button className="flex items-center justify-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-xs sm:text-sm">
                        <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="hidden sm:inline">Bình luận</span>
                      </button>
                      <button className="flex items-center justify-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-xs sm:text-sm">
                        <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="hidden sm:inline">Chia sẻ</span>
                      </button>
                    </div>
                  </div>

                  {/* Comment Section */}
                  <div className="px-3 sm:px-4 pb-3 sm:pb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-gray-50 via-slate-50 to-gray-100 flex items-center justify-center flex-shrink-0">
                        <User className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                      </div>
                      <div className="flex-1 flex items-center space-x-2">
                        <input
                          type="text"
                          placeholder="Viết bình luận..."
                          className="flex-1 px-3 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-full flex-shrink-0">
                          <Send className="w-3 h-3 sm:w-4 sm:h-4" />
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
            {/* Sponsored Events */}
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Sự kiện nổi bật</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Giải bóng đá phố</h4>
                    <p className="text-sm text-gray-500">Thứ 7, 15:00</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Giao hữu cầu lông</h4>
                    <p className="text-sm text-gray-500">Chủ nhật, 8:00</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Users */}
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Đang hoạt động</h3>
              <div className="space-y-3">
                {[1, 2, 3, 4].map((user) => (
                  <div key={user} className="flex items-center space-x-3">
                    <div className="relative">
                      <img
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user + 10}`}
                        alt={`User ${user}`}
                        className="w-8 h-8 rounded-full"
                      />
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <span className="text-sm text-gray-700">Người dùng {user}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Join */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-4 text-white">
              <h3 className="font-semibold mb-2">Tham gia ngay!</h3>
              <p className="text-sm opacity-90 mb-3">
                Tìm đội bóng gần bạn và tham gia ngay hôm nay
              </p>
              <button className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                Khám phá ngay
              </button>
            </div>
          </div>
        </div>
      </div>

      <Modal
        title="Chỉnh sửa bài viết"
        open={!!editingPost}
        okText="Lưu"
        cancelText="Hủy"
        confirmLoading={updating}
        onCancel={handleCloseEditModal}
        onOk={handleUpdatePost}
        destroyOnClose
        maskClosable={!updating}
      >
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung</label>
            <textarea
              value={editData.content}
              onChange={(e) => setEditData((prev) => ({ ...prev, content: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Địa điểm</label>
              <input
                type="text"
                value={editData.location}
                onChange={(e) => setEditData((prev) => ({ ...prev, location: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ảnh (tùy chọn)</label>
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
    </div>
  );
};

export default Blog;