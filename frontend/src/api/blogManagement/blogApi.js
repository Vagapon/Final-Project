import axiosClient from '../axiosClient';

const buildFormData = (data) => {
  if (data instanceof FormData) return data;
  const formData = new FormData();
  Object.entries(data || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value);
    }
  });
  return formData;
};

const multipartConfig = {
  headers: {
    'Content-Type': 'multipart/form-data'
  }
};

const blogApi = {
  getBlogs: (params = {}) => axiosClient.get('/blogs', { params }),
  getBlogById: (id) => axiosClient.get(`/blogs/${id}`),
  createBlog: (data) => axiosClient.post('/blogs', buildFormData(data), multipartConfig),
  updateBlog: (id, data) => axiosClient.put(`/blogs/${id}`, buildFormData(data), multipartConfig),
  deleteBlog: (id) => axiosClient.delete(`/blogs/${id}`)
};

export default blogApi;

