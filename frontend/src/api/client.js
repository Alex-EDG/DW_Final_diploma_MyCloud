import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// JWT добавляем токен к каждому запросу
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${ token }`;
  };
  
  return config;
});

// Обработка ошибок
apiClient.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    
    // Ошибка 401 и если это не запрос на обновление токена
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(`${ API_BASE_URL }/auth/refresh/`, {
          refresh: refreshToken
        });
        
        localStorage.setItem('access_token', response.data.access);
        apiClient.defaults.headers.common[ 'Authorization' ] = `Bearer ${ response.data.access }`;
        return apiClient(originalRequest);
      } catch (error) {
        // Если не удалось обновить токен - разлогиниваем
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(error);
      };
    };

    return Promise.reject(error);
  }
);

// Создание отдельного экземпляра для скачивания файла
export const downloadClient = axios.create({
  baseURL: API_BASE_URL,
  responseType: 'blob',
  withCredentials: true
});

export default apiClient;
