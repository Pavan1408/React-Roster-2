import React from 'react';
import { Navbar as BootstrapNavbar, Nav, NavDropdown, Container } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <BootstrapNavbar bg="dark" variant="dark" expand="lg" sticky="top">
      <Container fluid>
        <BootstrapNavbar.Brand href="/dashboard">
          React Roster Management
        </BootstrapNavbar.Brand>
        
        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <NavDropdown 
              title={`${user?.firstName} ${user?.lastName} (${user?.role})`} 
              id="user-dropdown"
              align="end"
            >
              <NavDropdown.Item onClick={() => navigate('/profile')}>
                Profile
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={handleLogout}>
                Logout
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;
