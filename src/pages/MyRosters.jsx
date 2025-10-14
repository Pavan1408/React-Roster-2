import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Alert, Badge } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { rosterService } from '../services/rosterService';

const MyRosters = () => {
  const { user } = useAuth();
  const [rosters, setRosters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyRosters();
  }, [user.id]);

  const fetchMyRosters = async () => {
    try {
      setLoading(true);
      setError('');
      const rosterData = await rosterService.getUserRosters(user.id);
      setRosters(rosterData);
    } catch (err) {
      setError('Failed to load your rosters');
      console.error('My rosters fetch error:', err);
    } finally {
      setLoading(false);
    }
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

  const getMyShifts = (roster) => {
    return roster.shifts.filter(shift => 
      shift.assignedUsers.some(assignedUser => assignedUser.id === user.id)
    );
  };

  const isUpcoming = (startDate) => {
    return new Date(startDate) > new Date();
  };

  const isCurrent = (startDate, endDate) => {
    const now = new Date();
    return new Date(startDate) <= now && new Date(endDate) >= now;
  };

  const getRosterStatus = (roster) => {
    if (isCurrent(roster.startDate, roster.endDate)) {
      return { text: 'Current', variant: 'success' };
    } else if (isUpcoming(roster.startDate)) {
      return { text: 'Upcoming', variant: 'primary' };
    } else {
      return { text: 'Past', variant: 'secondary' };
    }
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
          <h1>My Rosters</h1>
          <p className="text-muted">View your assigned work schedules</p>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      {rosters.length === 0 ? (
        <Card>
          <Card.Body className="text-center py-5">
            <h5>No Rosters Assigned</h5>
            <p className="text-muted">You don't have any rosters assigned to you yet.</p>
          </Card.Body>
        </Card>
      ) : (
        <Row>
          {rosters.map(roster => {
            const myShifts = getMyShifts(roster);
            const status = getRosterStatus(roster);
            
            return (
              <Col md={6} lg={4} key={roster.id} className="mb-4">
                <Card className="h-100">
                  <Card.Header className="d-flex justify-content-between align-items-center">
                    <h6 className="mb-0">{roster.name}</h6>
                    <Badge bg={status.variant}>{status.text}</Badge>
                  </Card.Header>
                  <Card.Body>
                    <div className="mb-3">
                      <strong>Department:</strong> <Badge bg="info">{roster.department}</Badge>
                    </div>
                    
                    <div className="mb-3">
                      <strong>Period:</strong><br />
                      <small>{formatDate(roster.startDate)} - {formatDate(roster.endDate)}</small>
                    </div>

                    <div className="mb-3">
                      <strong>My Shifts:</strong>
                      {myShifts.map(shift => (
                        <div key={shift.id} className="mt-2 p-2 bg-light rounded">
                          <div><strong>{shift.name}</strong></div>
                          <small className="text-muted">
                            {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                          </small>
                        </div>
                      ))}
                    </div>

                    <div>
                      <strong>Created by:</strong><br />
                      <small className="text-muted">
                        {roster.createdByUser ? 
                          `${roster.createdByUser.firstName} ${roster.createdByUser.lastName}` : 
                          'Unknown'
                        }
                      </small>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      {/* Summary Table */}
      {rosters.length > 0 && (
        <Card className="mt-4">
          <Card.Header>
            <h5 className="mb-0">Roster Summary</h5>
          </Card.Header>
          <Card.Body>
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Roster Name</th>
                  <th>Department</th>
                  <th>Period</th>
                  <th>My Shifts</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {rosters.map(roster => {
                  const myShifts = getMyShifts(roster);
                  const status = getRosterStatus(roster);
                  
                  return (
                    <tr key={roster.id}>
                      <td><strong>{roster.name}</strong></td>
                      <td><Badge bg="info">{roster.department}</Badge></td>
                      <td>
                        <small>
                          {formatDate(roster.startDate)} - {formatDate(roster.endDate)}
                        </small>
                      </td>
                      <td>
                        {myShifts.map(shift => (
                          <div key={shift.id}>
                            <small>
                              <strong>{shift.name}:</strong> {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                            </small>
                          </div>
                        ))}
                      </td>
                      <td>
                        <Badge bg={status.variant}>{status.text}</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default MyRosters;
