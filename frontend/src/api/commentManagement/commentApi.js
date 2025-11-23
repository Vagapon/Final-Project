import axiosClient from '../axiosClient';

const commentApi = {
  getCommentsByBlogId: (blogId) => axiosClient.get(`/comments/blog/${blogId}`),
  createComment: (data) => axiosClient.post('/comments', data),
  updateComment: (id, data) => axiosClient.put(`/comments/${id}`, data),
  deleteComment: (id) => axiosClient.delete(`/comments/${id}`)
};

export default commentApi;

