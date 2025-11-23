import { useEffect, useMemo, useState } from 'react';
import { Plus, Edit, Trash2, FileText, Loader2, Search } from 'lucide-react';
import { Modal, message } from 'antd';
import { blogApi } from '../../../api';
import { useAuth } from '../../Authen/AuthContext';

const defaultFormState = {
  content: '',
  location: '',
  imageFile: null
};

const formatDate = (value) => {
  if (!value) return 'Not specified';
  try {
    return new Date(value).toLocaleString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return value;
  }
};

const BlogManagement = () => {
  const { user } = useAuth();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [formData, setFormData] = useState(defaultFormState);
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState('');

  // Check if current user can edit/delete this blog
  const canEditBlog = (blog) => {
    if (!user) return false;
    if (user.role === 'ADMIN') return true; // Admin can edit everything
    
    if (user.role === 'STAFF') {
      // Staff can only edit if they created it or if creator is not admin
      if (blog.userIdRole === 'ADMIN') return false; // Staff cannot edit admin's blogs
      return true; // Staff can edit their own or other staff's blogs
    }
    
    return false;
  };

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const response = await blogApi.getBlogs();
      setBlogs(response.data?.data || []);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Unable to load blog list';
      message.error(errorMessage);
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const filteredBlogs = useMemo(() => {
    if (!searchTerm.trim()) return blogs;
    const lowerSearch = searchTerm.toLowerCase();
    return blogs.filter((blog) => {
      const contentMatch = blog.content?.toLowerCase().includes(lowerSearch);
      const authorMatch = blog.userId?.name?.toLowerCase().includes(lowerSearch);
      const locationMatch = blog.location?.toLowerCase().includes(lowerSearch);
      return contentMatch || authorMatch || locationMatch;
    });
  }, [blogs, searchTerm]);

  const openModal = (blog = null) => {
    if (blog) {
      setSelectedBlog(blog);
      setFormData({
        content: blog.content || '',
        location: blog.location || '',
        imageFile: null
      });
      setImagePreview(blog.imageUrl || '');
    } else {
      setSelectedBlog(null);
      setFormData(defaultFormState);
      setImagePreview('');
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    setSelectedBlog(null);
    setFormData(defaultFormState);
    setImagePreview('');
  };

  const handleSave = async () => {
    if (!formData.content.trim()) {
      message.warning('Please enter post content');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        content: formData.content.trim(),
        location: formData.location
      };

      if (formData.imageFile) {
        payload.image = formData.imageFile;
      }

      if (selectedBlog) {
        await blogApi.updateBlog(selectedBlog._id, payload);
        message.success('Blog updated successfully');
      } else {
        await blogApi.createBlog(payload);
        message.success('New blog created successfully');
      }

      closeModal();
      fetchBlogs();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'An error occurred, please try again';
      message.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (blog) => {
    Modal.confirm({
      title: 'Delete Blog',
      content: (
        <span>
          Are you sure you want to delete <strong>{blog.content?.slice(0, 30) || 'this blog'}</strong>?
        </span>
      ),
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await blogApi.deleteBlog(blog._id);
          message.success('Blog deleted');
          fetchBlogs();
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Unable to delete blog';
          message.error(errorMessage);
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-6 lg:px-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 rounded-xl">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Blog Management</h1>
              <p className="text-gray-500 text-sm">
                Create, edit and manage posts shared with the community
              </p>
            </div>
          </div>

          <div className="mt-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="relative w-full md:w-80">
                <div className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by content, author or location..."
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                onClick={() => openModal()}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Post
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
              Loading data...
            </div>
          ) : filteredBlogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-6">
              <FileText className="w-12 h-12 text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">No posts yet</h3>
              <p className="text-gray-500">
                {blogs.length === 0
                  ? 'Start sharing information by creating a new post.'
                  : 'No posts found matching the keywords.'}
              </p>
              {blogs.length === 0 && (
                <button
                  onClick={() => openModal()}
                  className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create First Post
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredBlogs.map((blog) => (
                <div key={blog._id} className="p-5 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                  <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-start">
                    <div>
                      <p className="text-sm text-gray-500 mt-1 flex flex-wrap gap-2">
                        <span>{blog.userId?.name || 'Unknown author'}</span>
                        <span>• Created on {formatDate(blog.createdAt)}</span>
                        {blog.location && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                            {blog.location}
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">Updated {formatDate(blog.updatedAt)}</p>
                    </div>
                    <div className="flex gap-2">
                      {canEditBlog(blog) && (
                        <button
                          onClick={() => openModal(blog)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>
                      )}
                      {canEditBlog(blog) && (
                        <button
                          onClick={() => handleDelete(blog)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                  {blog.imageUrl && (
                    <img
                      src={blog.imageUrl}
                      alt={blog.content?.slice(0, 30) || 'Blog'}
                      className="mt-4 rounded-xl w-full max-h-64 object-cover border border-gray-100 dark:border-gray-700"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  )}
                  <p className="mt-4 text-gray-700 dark:text-gray-200 whitespace-pre-line">{blog.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal
        title={selectedBlog ? 'Edit Post' : 'Create New Post'}
        open={modalOpen}
        okText={selectedBlog ? 'Update' : 'Create'}
        cancelText="Cancel"
        confirmLoading={saving}
        onCancel={closeModal}
        onOk={handleSave}
        maskClosable={!saving}
        closable={!saving}
        destroyOnClose
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
              rows={6}
              placeholder="Share post content..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                placeholder="e.g., My Dinh Stadium"
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
                  setFormData((prev) => ({ ...prev, imageFile: file }));
                  setImagePreview(file ? URL.createObjectURL(file) : selectedBlog?.imageUrl || '');
                }}
                className="w-full"
              />
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="preview"
                  className="mt-2 w-full h-32 object-cover rounded-lg border border-gray-100"
                />
              )}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BlogManagement;

