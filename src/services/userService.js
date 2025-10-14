import api, { USE_MOCK_DATA } from './api';
import { mockUsers, departments, roles, userStatuses } from './mockData';

class UserService {
  async getUsers(filters = {}) {
    if (USE_MOCK_DATA) {
      return this.mockGetUsers(filters);
    }
    
    try {
      const response = await api.get('/users', { params: filters });
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch users');
    }
  }

  async getUserById(id) {
    if (USE_MOCK_DATA) {
      return this.mockGetUserById(id);
    }
    
    try {
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch user');
    }
  }

  async createUser(userData) {
    if (USE_MOCK_DATA) {
      return this.mockCreateUser(userData);
    }
    
    try {
      const response = await api.post('/users', userData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create user');
    }
  }

  async updateUser(id, userData) {
    if (USE_MOCK_DATA) {
      return this.mockUpdateUser(id, userData);
    }
    
    try {
      const response = await api.put(`/users/${id}`, userData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update user');
    }
  }

  async deleteUser(id) {
    if (USE_MOCK_DATA) {
      return this.mockDeleteUser(id);
    }
    
    try {
      await api.delete(`/users/${id}`);
      return { success: true };
    } catch (error) {
      throw new Error('Failed to delete user');
    }
  }

  getDepartments() {
    return departments;
  }

  getRoles() {
    return roles;
  }

  getUserStatuses() {
    return userStatuses;
  }

  // Mock implementations
  mockGetUsers(filters) {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filteredUsers = [...mockUsers];
        
        if (filters.role) {
          filteredUsers = filteredUsers.filter(user => user.role === filters.role);
        }
        
        if (filters.department) {
          filteredUsers = filteredUsers.filter(user => user.department === filters.department);
        }
        
        if (filters.status) {
          filteredUsers = filteredUsers.filter(user => user.status === filters.status);
        }
        
        resolve(filteredUsers);
      }, 500);
    });
  }

  mockGetUserById(id) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = mockUsers.find(u => u.id === parseInt(id));
        if (user) {
          resolve(user);
        } else {
          reject(new Error('User not found'));
        }
      }, 300);
    });
  }

  mockCreateUser(userData) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Check if username already exists
        if (mockUsers.some(u => u.username === userData.username)) {
          reject(new Error('Username already exists'));
          return;
        }
        
        // Check if email already exists
        if (mockUsers.some(u => u.email === userData.email)) {
          reject(new Error('Email already exists'));
          return;
        }
        
        const newUser = {
          id: Math.max(...mockUsers.map(u => u.id)) + 1,
          ...userData,
          createdAt: new Date().toISOString()
        };
        
        mockUsers.push(newUser);
        resolve(newUser);
      }, 800);
    });
  }

  mockUpdateUser(id, userData) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const userIndex = mockUsers.findIndex(u => u.id === parseInt(id));
        if (userIndex === -1) {
          reject(new Error('User not found'));
          return;
        }
        
        // Check if username already exists (excluding current user)
        if (userData.username && mockUsers.some(u => u.username === userData.username && u.id !== parseInt(id))) {
          reject(new Error('Username already exists'));
          return;
        }
        
        // Check if email already exists (excluding current user)
        if (userData.email && mockUsers.some(u => u.email === userData.email && u.id !== parseInt(id))) {
          reject(new Error('Email already exists'));
          return;
        }
        
        mockUsers[userIndex] = { ...mockUsers[userIndex], ...userData };
        resolve(mockUsers[userIndex]);
      }, 800);
    });
  }

  mockDeleteUser(id) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const userIndex = mockUsers.findIndex(u => u.id === parseInt(id));
        if (userIndex === -1) {
          reject(new Error('User not found'));
          return;
        }
        
        mockUsers.splice(userIndex, 1);
        resolve({ success: true });
      }, 500);
    });
  }
}

export const userService = new UserService();
