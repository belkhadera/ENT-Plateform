import axios from 'axios';
import { clearSession, getRefreshToken, getToken, setRefreshToken, setToken } from '../utils/auth';

const getDefaultBrowserBaseUrl = (serviceName, port) => {
  if (typeof window === 'undefined') {
    return `http://localhost:${port}`;
  }

  return `/api/${serviceName}`;
};

const coreServiceUrl = import.meta.env.VITE_CORE_SERVICE_URL || getDefaultBrowserBaseUrl('core', 8001);
const uploadServiceUrl = import.meta.env.VITE_UPLOAD_SERVICE_URL || getDefaultBrowserBaseUrl('upload', 8002);
const downloadServiceUrl = import.meta.env.VITE_DOWNLOAD_SERVICE_URL || getDefaultBrowserBaseUrl('download', 8003);
const adminServiceUrl = import.meta.env.VITE_ADMIN_SERVICE_URL || getDefaultBrowserBaseUrl('admin', 8004);
const chatServiceUrl = import.meta.env.VITE_CHAT_SERVICE_URL || getDefaultBrowserBaseUrl('chat', 8005);

let refreshPromise = null;

const requestNewAccessToken = async () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error('Aucun refresh token disponible.');
  }

  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${coreServiceUrl}/auth/refresh`, { refresh_token: refreshToken })
      .then((response) => {
        const nextTokens = response.data || {};
        const nextAccessToken = nextTokens.access_token;
        if (!nextAccessToken) {
          throw new Error('Refresh token response missing access token.');
        }

        setToken(nextAccessToken);
        if (nextTokens.refresh_token) {
          setRefreshToken(nextTokens.refresh_token);
        }

        return nextTokens;
      })
      .catch((error) => {
        clearSession();
        throw error;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

const createClient = (baseURL) => {
  const client = axios.create({ baseURL });
  client.interceptors.request.use(
    (config) => {
      const token = getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error?.config;
      const status = error?.response?.status;
      const requestPath = originalRequest?.url || '';

      if (
        status !== 401 ||
        !originalRequest ||
        originalRequest._retry ||
        requestPath.includes('/auth/token') ||
        requestPath.includes('/auth/refresh')
      ) {
        return Promise.reject(error);
      }

      try {
        originalRequest._retry = true;
        const tokenPayload = await requestNewAccessToken();
        originalRequest.headers = {
          ...(originalRequest.headers || {}),
          Authorization: `Bearer ${tokenPayload.access_token}`,
        };
        return client(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }
  );
  return client;
};

const coreApi = createClient(coreServiceUrl);
const uploadApi = createClient(uploadServiceUrl);
const downloadApi = createClient(downloadServiceUrl);
const adminApi = createClient(adminServiceUrl);
const chatApi = createClient(chatServiceUrl);

export const getApiErrorMessage = (error, fallback = 'Une erreur est survenue.') => {
  if (error?.response?.data?.detail) {
    const { detail } = error.response.data;
    if (typeof detail === 'string') {
      return detail;
    }
    if (detail?.error_description) {
      return detail.error_description;
    }
    if (detail?.error) {
      return detail.error;
    }
    return JSON.stringify(detail);
  }

  if (error?.response?.data?.error_description) {
    return error.response.data.error_description;
  }

  if (error?.message) {
    return error.message;
  }

  return fallback;
};

export const loginUser = async (username, password) => {
  const response = await coreApi.post('/auth/token', { username, password });
  return response.data;
};

export const refreshUserToken = async () => {
  return requestNewAccessToken();
};

export const fetchCurrentUser = async () => {
  const response = await coreApi.get('/auth/me');
  return response.data;
};

export const fetchCourses = async () => {
  const response = await downloadApi.get('/courses');
  return response.data;
};

export const fetchCourseDownloadUrl = async (courseId) => {
  const response = await downloadApi.get(`/courses/${courseId}/download-url`);
  return response.data;
};

export const downloadCourseFile = async (courseId, config = {}) => {
  return downloadApi.get(`/courses/${courseId}/download`, {
    responseType: 'blob',
    ...config,
  });
};

export const createCourse = async (formData, config = {}) => {
  const response = await uploadApi.post('/courses', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    ...config,
  });
  return response.data;
};

export const deleteCourse = async (courseId) => {
  const response = await uploadApi.delete(`/courses/${courseId}`);
  return response.data;
};

export const listUsers = async () => {
  const response = await adminApi.get('/users');
  return response.data;
};

export const createUser = async (payload) => {
  const response = await adminApi.post('/users', payload);
  return response.data;
};

export const registerUser = async (payload) => {
  const response = await axios.post(`${adminServiceUrl}/register`, payload);
  return response.data;
};

export const updateUser = async (userId, payload) => {
  const response = await adminApi.put(`/users/${userId}`, payload);
  return response.data;
};

export const deleteUser = async (userId) => {
  await adminApi.delete(`/users/${userId}`);
};

export const resetUserPassword = async (userId, password) => {
  const response = await adminApi.put(`/users/${userId}/password`, { password });
  return response.data;
};

export const fetchAdminCourses = async () => {
  const response = await adminApi.get('/courses');
  return response.data;
};

export const sendChatMessage = async (payload) => {
  const response = await chatApi.post('/chat', payload);
  return response.data;
};

export const sendPublicChatMessage = async (payload) => {
  const response = await chatApi.post('/chat/public', payload);
  return response.data;
};
