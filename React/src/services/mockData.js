// Mock data for development
export const mockUsers = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@company.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'Admin',
    department: 'IT',
    status: 'Active',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 2,
    username: 'supervisor1',
    email: 'supervisor1@company.com',
    firstName: 'John',
    lastName: 'Supervisor',
    role: 'Supervisor',
    department: 'Operations',
    status: 'Active',
    createdAt: '2024-01-02T00:00:00Z'
  },
  {
    id: 3,
    username: 'employee1',
    email: 'employee1@company.com',
    firstName: 'Jane',
    lastName: 'Employee',
    role: 'Employee',
    department: 'Operations',
    status: 'Active',
    createdAt: '2024-01-03T00:00:00Z'
  },
  {
    id: 4,
    username: 'employee2',
    email: 'employee2@company.com',
    firstName: 'Bob',
    lastName: 'Worker',
    role: 'Employee',
    department: 'Sales',
    status: 'Active',
    createdAt: '2024-01-04T00:00:00Z'
  },
  {
    id: 5,
    username: 'employee3',
    email: 'employee3@company.com',
    firstName: 'Alice',
    lastName: 'Smith',
    role: 'Employee',
    department: 'IT',
    status: 'Inactive',
    createdAt: '2024-01-05T00:00:00Z'
  }
];

export const mockCredentials = {
  'admin': 'admin123',
  'supervisor1': 'super123',
  'employee1': 'emp123',
  'employee2': 'emp123',
  'employee3': 'emp123'
};

export const mockRosters = [
  {
    id: 1,
    name: 'Operations Team - Week 1',
    department: 'Operations',
    startDate: '2024-10-14',
    endDate: '2024-10-20',
    shifts: [
      {
        id: 1,
        name: 'First Shift',
        startTime: '08:00',
        endTime: '16:00',
        assignedUsers: [2, 3]
      },
      {
        id: 2,
        name: 'Second Shift',
        startTime: '16:00',
        endTime: '00:00',
        assignedUsers: [4]
      }
    ],
    createdBy: 2,
    createdAt: '2024-10-10T00:00:00Z'
  },
  {
    id: 2,
    name: 'Sales Team - Week 1',
    department: 'Sales',
    startDate: '2024-10-14',
    endDate: '2024-10-20',
    shifts: [
      {
        id: 3,
        name: 'First Shift',
        startTime: '09:00',
        endTime: '17:00',
        assignedUsers: [4]
      }
    ],
    createdBy: 1,
    createdAt: '2024-10-11T00:00:00Z'
  }
];

export const departments = ['IT', 'Operations', 'Sales', 'HR', 'Finance'];
export const roles = ['Admin', 'Supervisor', 'Employee'];
export const userStatuses = ['Active', 'Inactive'];
