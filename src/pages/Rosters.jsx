import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, Alert, Badge, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { rosterService } from '../services/rosterService';

const Rosters = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rosters, setRosters] = useState([]);
  const [filteredRosters, setFilteredRosters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    department: '',
    startDate: '',
    endDate: ''
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [rosterToDelete, setRosterToDelete] = useState(null);

  useEffect(() => {
    fetchRosters();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [rosters, filters]);

  const fetchRosters = async () => {
    try {
      setLoading(true);
      setError('');
      const rosterData = await rosterService.getRosters();
      setRosters(rosterData);
    } catch (err) {
      setError('Failed to load rosters');
      console.error('Rosters fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...rosters];

    if (filters.department) {
      filtered = filtered.filter(roster => roster.department === filters.department);
    }

    if (filters.startDate) {
      filtered = filtered.filter(roster => roster.startDate >= filters.startDate);
    }

    if (filters.endDate) {
      filtered = filtered.filter(roster => roster.endDate <= filters.endDate);
    }

    setFilteredRosters(filtered);
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDeleteRoster = async () => {
    if (!rosterToDelete) return;

    try {
      await rosterService.deleteRoster(rosterToDelete.id);
      setRosters(prev => prev.filter(r => r.id !== rosterToDelete.id));
      setShowDeleteModal(false);
      setRosterToDelete(null);
    } catch (err) {
      setError('Failed to delete roster');
      console.error('Delete roster error:', err);
    }
  };

  const confirmDelete = (roster) => {
    setRosterToDelete(roster);
    setShowDeleteModal(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getTotalAssignedUsers = (roster) => {
    return roster.shifts.reduce((total, shift) => total + shift.assignedUsers.length, 0);
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
            <h1>Roster Management</h1>
            <Button 
              variant="primary" 
              onClick={() => navigate('/rosters/new')}
            >
              Create New Roster
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
                <Form.Label>Filter by Department</Form.Label>
                <Form.Select
                  value={filters.department}
                  onChange={(e) => handleFilterChange('department', e.target.value)}
                >
                  <option value="">All Departments</option>
                  {rosterService.getDepartments().map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Start Date From</Form.Label>
                <Form.Control
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>End Date To</Form.Label>
                <Form.Control
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                />
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Rosters Table */}
      <Card>
        <Card.Body>
          <Table responsive hover>
            <thead>
              <tr>
                <th>Roster Name</th>
                <th>Department</th>
                <th>Period</th>
                <th>Shifts</th>
                <th>Assigned Users</th>
                <th>Created By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRosters.map(roster => (
                <tr key={roster.id}>
                  <td>
                    <strong>{roster.name}</strong>
                  </td>
                  <td>
                    <Badge bg="info">{roster.department}</Badge>
                  </td>
                  <td>
                    {formatDate(roster.startDate)} - {formatDate(roster.endDate)}
                  </td>
                  <td>
                    {roster.shifts.map(shift => (
                      <div key={shift.id} className="mb-1">
                        <small>
                          <strong>{shift.name}:</strong> {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                        </small>
                      </div>
                    ))}
                  </td>
                  <td>
                    <Badge bg="success">{getTotalAssignedUsers(roster)} users</Badge>
                    <div className="mt-1">
                      {roster.shifts.map(shift => (
                        <div key={shift.id}>
                          <small className="text-muted">
                            {shift.name}: {shift.assignedUsers.map(user => user.firstName).join(', ')}
                          </small>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td>
                    {roster.createdByUser ? 
                      `${roster.createdByUser.firstName} ${roster.createdByUser.lastName}` : 
                      'Unknown'
                    }
                  </td>
                  <td>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="me-2"
                      onClick={() => navigate(`/rosters/${roster.id}/edit`)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => confirmDelete(roster)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {filteredRosters.length === 0 && (
            <div className="text-center py-4">
              <p className="text-muted">No rosters found matching the current filters.</p>
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
          Are you sure you want to delete roster "{rosterToDelete?.name}"? 
          This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteRoster}>
            Delete Roster
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Rosters;
