import { useEffect, useMemo, useState } from 'react';
import { Plus, Edit, Trash2, FileText, Loader2, Search } from 'lucide-react';
import { Modal, message } from 'antd';
import { blogApi } from '../../../api';

const defaultFormState = {
  content: '',
  location: '',
  imageFile: null
};

const formatDate = (value) => {
  if (!value) return 'Không xác định';
  try {
    return new Date(value).toLocaleString('vi-VN', {
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
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [formData, setFormData] = useState(defaultFormState);
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState('');

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const response = await blogApi.getBlogs();
      setBlogs(response.data?.data || []);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Không thể tải danh sách blog';
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
      message.warning('Vui lòng nhập nội dung bài viết');
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
        message.success('Cập nhật blog thành công');
      } else {
        await blogApi.createBlog(payload);
        message.success('Tạo blog mới thành công');
      }

      closeModal();
      fetchBlogs();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại';
      message.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (blog) => {
    Modal.confirm({
      title: 'Xóa blog',
      content: (
        <span>
          Bạn có chắc chắn muốn xóa <strong>{blog.content?.slice(0, 30) || 'blog này'}</strong>?
        </span>
      ),
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await blogApi.deleteBlog(blog._id);
          message.success('Đã xóa blog');
          fetchBlogs();
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Không thể xóa blog';
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
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Quản lý Blog</h1>
              <p className="text-gray-500 text-sm">
                Tạo, chỉnh sửa và quản lý các bài viết chia sẻ đến cộng đồng
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
                  placeholder="Tìm kiếm theo nội dung, tác giả hoặc địa điểm..."
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                onClick={() => openModal()}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                Thêm bài viết
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
              Đang tải dữ liệu...
            </div>
          ) : filteredBlogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-6">
              <FileText className="w-12 h-12 text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">Chưa có bài viết</h3>
              <p className="text-gray-500">
                {blogs.length === 0
                  ? 'Hãy bắt đầu chia sẻ thông tin bằng cách tạo bài viết mới.'
                  : 'Không tìm thấy bài viết phù hợp với từ khóa.'}
              </p>
              {blogs.length === 0 && (
                <button
                  onClick={() => openModal()}
                  className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Tạo bài viết đầu tiên
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
                        <span>{blog.userId?.name || 'Không rõ tác giả'}</span>
                        <span>• Tạo ngày {formatDate(blog.createdAt)}</span>
                        {blog.location && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                            {blog.location}
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">Cập nhật {formatDate(blog.updatedAt)}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openModal(blog)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Edit className="w-4 h-4" />
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(blog)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                        Xóa
                      </button>
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
        title={selectedBlog ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}
        open={modalOpen}
        okText={selectedBlog ? 'Cập nhật' : 'Tạo mới'}
        cancelText="Hủy"
        confirmLoading={saving}
        onCancel={closeModal}
        onOk={handleSave}
        maskClosable={!saving}
        closable={!saving}
        destroyOnClose
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
              rows={6}
              placeholder="Chia sẻ nội dung bài viết..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Địa điểm</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                placeholder="Ví dụ: Sân Mỹ Đình"
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

