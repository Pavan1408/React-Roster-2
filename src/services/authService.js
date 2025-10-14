import api, { USE_MOCK_DATA } from './api';
import { mockUsers, mockCredentials } from './mockData';

class AuthService {
  async login(credentials) {
    if (USE_MOCK_DATA) {
      return this.mockLogin(credentials);
    }
    
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  }

  async getCurrentUser() {
    if (USE_MOCK_DATA) {
      return this.mockGetCurrentUser();
    }
    
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      throw new Error('Failed to get current user');
    }
  }

  async refreshToken() {
    if (USE_MOCK_DATA) {
      return this.mockRefreshToken();
    }
    
    try {
      const response = await api.post('/auth/refresh');
      return response.data;
    } catch (error) {
      throw new Error('Token refresh failed');
    }
  }

  // Mock implementations
  mockLogin(credentials) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const { username, password } = credentials;
        
        if (mockCredentials[username] === password) {
          const user = mockUsers.find(u => u.username === username);
          if (user && user.status === 'Active') {
            resolve({
              user,
              token: `mock-token-${user.id}-${Date.now()}`,
              refreshToken: `mock-refresh-${user.id}-${Date.now()}`
            });
          } else {
            reject(new Error('User account is inactive'));
          }
        } else {
          reject(new Error('Invalid username or password'));
        }
      }, 1000); // Simulate network delay
    });
  }

  mockGetCurrentUser() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const token = localStorage.getItem('token');
        if (token && token.startsWith('mock-token-')) {
          const userId = parseInt(token.split('-')[2]);
          const user = mockUsers.find(u => u.id === userId);
          if (user) {
            resolve(user);
          } else {
            reject(new Error('User not found'));
          }
        } else {
          reject(new Error('Invalid token'));
        }
      }, 500);
    });
  }

  mockRefreshToken() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const token = localStorage.getItem('token');
        if (token && token.startsWith('mock-token-')) {
          const userId = parseInt(token.split('-')[2]);
          resolve({
            token: `mock-token-${userId}-${Date.now()}`,
            refreshToken: `mock-refresh-${userId}-${Date.now()}`
          });
        } else {
          reject(new Error('Invalid refresh token'));
        }
      }, 500);
    });
  }
}

export const authService = new AuthService();
