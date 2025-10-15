import React from 'react';
import { Nav } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
  const { user, hasRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: '📊',
      roles: ['Employee', 'Supervisor', 'Admin']
    },
    {
      path: '/users',
      label: 'User Management',
      icon: '👥',
      roles: ['Supervisor', 'Admin']
    },
    {
      path: '/rosters',
      label: 'Roster Management',
      icon: '📅',
      roles: ['Supervisor', 'Admin']
    },
    {
      path: '/my-rosters',
      label: 'My Rosters',
      icon: '📋',
      roles: ['Employee', 'Supervisor', 'Admin']
    },
    {
      path: '/profile',
      label: 'Profile',
      icon: '👤',
      roles: ['Employee', 'Supervisor', 'Admin']
    }
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user?.role)
  );

  return (
    <div className="sidebar">
      <Nav className="flex-column">
        {filteredMenuItems.map((item) => (
          <Nav.Link
            key={item.path}
            onClick={() => navigate(item.path)}
            className={location.pathname === item.path ? 'active' : ''}
            style={{ cursor: 'pointer' }}
          >
            <span className="me-2">{item.icon}</span>
            {item.label}
          </Nav.Link>
        ))}
      </Nav>
    </div>
  );
};

export default Sidebar;
