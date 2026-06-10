import axios from 'axios';

const API_BASE = "https://amused-joy-production.up.railway.app/api";

const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

// Users
export const userAPI = {
  getMe: () => api.get('/users/me'),
  updateProfile: (data) => api.put('/users/me', data),
  getById: (id) => api.get(`/users/${id}`),
  getAllAlumni: () => api.get('/users/alumni'),
  searchAlumni: (keyword) => api.get(`/users/alumni/search?keyword=${keyword}`),
  getAlumniByCompany: (company) => api.get(`/users/alumni/company?company=${company}`),
  getAlumniByDomain: (domain) => api.get(`/users/alumni/domain?domain=${domain}`),
};

// Jobs
export const jobAPI = {
  getAll: () => api.get('/jobs'),
  getById: (id) => api.get(`/jobs/${id}`),
  search: (keyword) => api.get(`/jobs/search?keyword=${keyword}`),
  getByType: (type) => api.get(`/jobs/type/${type}`),
  create: (data) => api.post('/jobs', data),
  update: (id, data) => api.put(`/jobs/${id}`, data),
  delete: (id) => api.delete(`/jobs/${id}`),
};

// Messages
export const messageAPI = {
  send: (receiverId, content) => api.post(`/messages/${receiverId}`, { content }),
  getConversation: (userId) => api.get(`/messages/conversation/${userId}`),
  getPartners: () => api.get('/messages/partners'),
  getUnreadCount: () => api.get('/messages/unread-count'),
};

// Forum
export const forumAPI = {
  getAllPosts: () => api.get('/forum/posts'),
  getByCategory: (cat) => api.get(`/forum/posts/category/${cat}`),
  getById: (id) => api.get(`/forum/posts/${id}`),
  search: (keyword) => api.get(`/forum/posts/search?keyword=${keyword}`),
  create: (data) => api.post('/forum/posts', data),
  like: (id) => api.post(`/forum/posts/${id}/like`),
  delete: (id) => api.delete(`/forum/posts/${id}`),
  getComments: (postId) => api.get(`/forum/posts/${postId}/comments`),
  addComment: (postId, content) => api.post(`/forum/posts/${postId}/comments`, { content }),
};

// Events
export const eventAPI = {
  getAll: () => api.get('/events'),
  getUpcoming: () => api.get('/events/upcoming'),
  getById: (id) => api.get(`/events/${id}`),
  create: (data) => api.post('/events', data),
  register: (id) => api.post(`/events/${id}/register`),
  delete: (id) => api.delete(`/events/${id}`),
};

// Mentorship
export const mentorshipAPI = {
  sendRequest: (mentorId, data) => api.post(`/mentorship/request/${mentorId}`, data),
  getSent: () => api.get('/mentorship/sent'),
  getReceived: () => api.get('/mentorship/received'),
  updateStatus: (id, status) => api.put(`/mentorship/${id}/status`, { status }),
};

export default api;
