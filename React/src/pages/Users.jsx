import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, Alert, Badge, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/userService';

const Users = () => {
  const { user, hasRole, canManageUser } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    role: '',
    department: '',
    status: ''
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [users, filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const userData = await userService.getUsers();
      
      // Filter users based on current user's role
      let allowedUsers = userData;
      if (user.role === 'Supervisor') {
        // Supervisors can only see employees and themselves
        allowedUsers = userData.filter(u => 
          u.role === 'Employee' || u.id === user.id
        );
      }
      
      setUsers(allowedUsers);
    } catch (err) {
      setError('Failed to load users');
      console.error('Users fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...users];

    if (filters.role) {
      filtered = filtered.filter(user => user.role === filters.role);
    }

    if (filters.department) {
      filtered = filtered.filter(user => user.department === filters.department);
    }

    if (filters.status) {
      filtered = filtered.filter(user => user.status === filters.status);
    }

    setFilteredUsers(filtered);
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      await userService.deleteUser(userToDelete.id);
      setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
      setShowDeleteModal(false);
      setUserToDelete(null);
    } catch (err) {
      setError('Failed to delete user');
      console.error('Delete user error:', err);
    }
  };

  const confirmDelete = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'Admin': return 'danger';
      case 'Supervisor': return 'warning';
      case 'Employee': return 'info';
      default: return 'secondary';
    }
  };

  const getStatusBadgeVariant = (status) => {
    return status === 'Active' ? 'success' : 'secondary';
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
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h1>User Management</h1>
            <Button 
              variant="primary" 
              onClick={() => navigate('/users/new')}
            >
              Add New User
            </Button>
          </div>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Filters */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Filter by Role</Form.Label>
                <Form.Select
                  value={filters.role}
                  onChange={(e) => handleFilterChange('role', e.target.value)}
                >
                  <option value="">All Roles</option>
                  {userService.getRoles().map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Filter by Department</Form.Label>
                <Form.Select
                  value={filters.department}
                  onChange={(e) => handleFilterChange('department', e.target.value)}
                >
                  <option value="">All Departments</option>
                  {userService.getDepartments().map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Filter by Status</Form.Label>
                <Form.Select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <option value="">All Statuses</option>
                  {userService.getUserStatuses().map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Users Table */}
      <Card>
        <Card.Body>
          <Table responsive hover>
            <thead>
              <tr>
                <th>Name</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Department</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(userItem => (
                <tr key={userItem.id}>
                  <td>{userItem.firstName} {userItem.lastName}</td>
                  <td>{userItem.username}</td>
                  <td>{userItem.email}</td>
                  <td>
                    <Badge bg={getRoleBadgeVariant(userItem.role)}>
                      {userItem.role}
                    </Badge>
                  </td>
                  <td>{userItem.department}</td>
                  <td>
                    <Badge bg={getStatusBadgeVariant(userItem.status)}>
                      {userItem.status}
                    </Badge>
                  </td>
                  <td>
                    {canManageUser(userItem) && (
                      <>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-2"
                          onClick={() => navigate(`/users/${userItem.id}/edit`)}
                        >
                          Edit
                        </Button>
                        {userItem.id !== user.id && (
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => confirmDelete(userItem)}
                          >
                            Delete
                          </Button>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {filteredUsers.length === 0 && (
            <div className="text-center py-4">
              <p className="text-muted">No users found matching the current filters.</p>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete user "{userToDelete?.firstName} {userToDelete?.lastName}"? 
          This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteUser}>
            Delete User
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Users;
