import api, { USE_MOCK_DATA } from './api';
import { mockRosters, mockUsers, departments } from './mockData';

class RosterService {
  async getRosters(filters = {}) {
    if (USE_MOCK_DATA) {
      return this.mockGetRosters(filters);
    }
    
    try {
      const response = await api.get('/rosters', { params: filters });
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch rosters');
    }
  }

  async getRosterById(id) {
    if (USE_MOCK_DATA) {
      return this.mockGetRosterById(id);
    }
    
    try {
      const response = await api.get(`/rosters/${id}`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch roster');
    }
  }

  async createRoster(rosterData) {
    if (USE_MOCK_DATA) {
      return this.mockCreateRoster(rosterData);
    }
    
    try {
      const response = await api.post('/rosters', rosterData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create roster');
    }
  }

  async updateRoster(id, rosterData) {
    if (USE_MOCK_DATA) {
      return this.mockUpdateRoster(id, rosterData);
    }
    
    try {
      const response = await api.put(`/rosters/${id}`, rosterData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update roster');
    }
  }

  async deleteRoster(id) {
    if (USE_MOCK_DATA) {
      return this.mockDeleteRoster(id);
    }
    
    try {
      await api.delete(`/rosters/${id}`);
      return { success: true };
    } catch (error) {
      throw new Error('Failed to delete roster');
    }
  }

  async getUserRosters(userId) {
    if (USE_MOCK_DATA) {
      return this.mockGetUserRosters(userId);
    }
    
    try {
      const response = await api.get(`/users/${userId}/rosters`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch user rosters');
    }
  }

  getDepartments() {
    return departments;
  }

  // Mock implementations
  mockGetRosters(filters) {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filteredRosters = [...mockRosters];
        
        if (filters.department) {
          filteredRosters = filteredRosters.filter(roster => roster.department === filters.department);
        }
        
        if (filters.startDate) {
          filteredRosters = filteredRosters.filter(roster => roster.startDate >= filters.startDate);
        }
        
        if (filters.endDate) {
          filteredRosters = filteredRosters.filter(roster => roster.endDate <= filters.endDate);
        }
        
        // Add user details to rosters
        const rostersWithUsers = filteredRosters.map(roster => ({
          ...roster,
          shifts: roster.shifts.map(shift => ({
            ...shift,
            assignedUsers: shift.assignedUsers.map(userId => 
              mockUsers.find(user => user.id === userId)
            ).filter(Boolean)
          })),
          createdByUser: mockUsers.find(user => user.id === roster.createdBy)
        }));
        
        resolve(rostersWithUsers);
      }, 500);
    });
  }

  mockGetRosterById(id) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const roster = mockRosters.find(r => r.id === parseInt(id));
        if (roster) {
          const rosterWithUsers = {
            ...roster,
            shifts: roster.shifts.map(shift => ({
              ...shift,
              assignedUsers: shift.assignedUsers.map(userId => 
                mockUsers.find(user => user.id === userId)
              ).filter(Boolean)
            })),
            createdByUser: mockUsers.find(user => user.id === roster.createdBy)
          };
          resolve(rosterWithUsers);
        } else {
          reject(new Error('Roster not found'));
        }
      }, 300);
    });
  }

  mockCreateRoster(rosterData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newRoster = {
          id: Math.max(...mockRosters.map(r => r.id)) + 1,
          ...rosterData,
          createdAt: new Date().toISOString()
        };
        
        mockRosters.push(newRoster);
        resolve(newRoster);
      }, 800);
    });
  }

  mockUpdateRoster(id, rosterData) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const rosterIndex = mockRosters.findIndex(r => r.id === parseInt(id));
        if (rosterIndex === -1) {
          reject(new Error('Roster not found'));
          return;
        }
        
        mockRosters[rosterIndex] = { ...mockRosters[rosterIndex], ...rosterData };
        resolve(mockRosters[rosterIndex]);
      }, 800);
    });
  }

  mockDeleteRoster(id) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const rosterIndex = mockRosters.findIndex(r => r.id === parseInt(id));
        if (rosterIndex === -1) {
          reject(new Error('Roster not found'));
          return;
        }
        
        mockRosters.splice(rosterIndex, 1);
        resolve({ success: true });
      }, 500);
    });
  }

  mockGetUserRosters(userId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const userRosters = mockRosters.filter(roster => 
          roster.shifts.some(shift => 
            shift.assignedUsers.includes(parseInt(userId))
          )
        );
        
        const rostersWithUsers = userRosters.map(roster => ({
          ...roster,
          shifts: roster.shifts.map(shift => ({
            ...shift,
            assignedUsers: shift.assignedUsers.map(userId => 
              mockUsers.find(user => user.id === userId)
            ).filter(Boolean)
          })),
          createdByUser: mockUsers.find(user => user.id === roster.createdBy)
        }));
        
        resolve(rostersWithUsers);
      }, 500);
    });
  }
}

export const rosterService = new RosterService();
