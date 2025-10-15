import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/userService';
import { rosterService } from '../services/rosterService';

const Dashboard = () => {
  const { user, hasRole } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRosters: 0,
    myRosters: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError('');

        const promises = [];

        if (hasRole('Supervisor')) {
          promises.push(userService.getUsers());
          promises.push(rosterService.getRosters());
        }

        promises.push(rosterService.getUserRosters(user.id));

        const results = await Promise.all(promises);

        if (hasRole('Supervisor')) {
          setStats({
            totalUsers: results[0].length,
            totalRosters: results[1].length,
            myRosters: results[2].length
          });
        } else {
          setStats({
            totalUsers: 0,
            totalRosters: 0,
            myRosters: results[0].length
          });
        }
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user.id, hasRole]);

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    let greeting = 'Good morning';
    if (hour >= 12 && hour < 18) greeting = 'Good afternoon';
    else if (hour >= 18) greeting = 'Good evening';
    
    return `${greeting}, ${user.firstName}!`;
  };

  const getRoleSpecificActions = () => {
    const actions = [];

    if (hasRole('Admin')) {
      actions.push(
        { title: 'Manage Users', description: 'Add, edit, and manage all users', path: '/users', variant: 'primary' },
        { title: 'Manage Rosters', description: 'Create and manage work rosters', path: '/rosters', variant: 'success' }
      );
    } else if (hasRole('Supervisor')) {
      actions.push(
        { title: 'Manage Employees', description: 'Add and manage employee accounts', path: '/users', variant: 'primary' },
        { title: 'Create Rosters', description: 'Create and assign work rosters', path: '/rosters', variant: 'success' }
      );
    }

    actions.push(
      { title: 'My Rosters', description: 'View your assigned work schedules', path: '/my-rosters', variant: 'info' },
      { title: 'Profile', description: 'Update your profile information', path: '/profile', variant: 'secondary' }
    );

    return actions;
  };

  if (loading) {
    return (
      <Container>
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="mb-4">
        <h1 className="mb-2">{getWelcomeMessage()}</h1>
        <p className="text-muted">Welcome to your roster management dashboard</p>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Stats Cards */}
      <Row className="mb-4">
        {hasRole('Supervisor') && (
          <>
            <Col md={4} className="mb-3">
              <Card className="h-100">
                <Card.Body className="text-center">
                  <h2 className="text-primary">{stats.totalUsers}</h2>
                  <p className="mb-0">Total Users</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-3">
              <Card className="h-100">
                <Card.Body className="text-center">
                  <h2 className="text-success">{stats.totalRosters}</h2>
                  <p className="mb-0">Total Rosters</p>
                </Card.Body>
              </Card>
            </Col>
          </>
        )}
        <Col md={hasRole('Supervisor') ? 4 : 12} className="mb-3">
          <Card className="h-100">
            <Card.Body className="text-center">
              <h2 className="text-info">{stats.myRosters}</h2>
              <p className="mb-0">My Rosters</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row>
        <Col>
          <h3 className="mb-3">Quick Actions</h3>
        </Col>
      </Row>
      <Row>
        {getRoleSpecificActions().map((action, index) => (
          <Col md={6} lg={4} key={index} className="mb-3">
            <Card className="h-100">
              <Card.Body className="d-flex flex-column">
                <h5 className="card-title">{action.title}</h5>
                <p className="card-text flex-grow-1">{action.description}</p>
                <Button 
                  variant={action.variant} 
                  onClick={() => navigate(action.path)}
                  className="mt-auto"
                >
                  Go to {action.title}
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default Dashboard;
