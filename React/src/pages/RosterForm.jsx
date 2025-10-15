import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik, FieldArray } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../contexts/AuthContext';
import { rosterService } from '../services/rosterService';
import { userService } from '../services/userService';

const validationSchema = Yup.object({
  name: Yup.string().required('Roster name is required'),
  department: Yup.string().required('Department is required'),
  startDate: Yup.date().required('Start date is required'),
  endDate: Yup.date()
    .required('End date is required')
    .min(Yup.ref('startDate'), 'End date must be after start date'),
  shifts: Yup.array().of(
    Yup.object({
      name: Yup.string().required('Shift name is required'),
      startTime: Yup.string().required('Start time is required'),
      endTime: Yup.string().required('End time is required'),
      assignedUsers: Yup.array().min(1, 'At least one user must be assigned')
    })
  ).min(1, 'At least one shift is required')
});

const RosterForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState('');
  const [availableUsers, setAvailableUsers] = useState([]);
  const [initialValues, setInitialValues] = useState({
    name: '',
    department: '',
    startDate: '',
    endDate: '',
    shifts: [
      {
        name: 'First Shift',
        startTime: '08:00',
        endTime: '16:00',
        assignedUsers: []
      }
    ]
  });

  useEffect(() => {
    fetchAvailableUsers();
    if (isEdit) {
      fetchRoster();
    }
  }, [id, isEdit]);

  const fetchAvailableUsers = async () => {
    try {
      const users = await userService.getUsers({ status: 'Active' });
      setAvailableUsers(users);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  const fetchRoster = async () => {
    try {
      setLoading(true);
      setError('');
      const rosterData = await rosterService.getRosterById(id);
      
      setInitialValues({
        name: rosterData.name,
        department: rosterData.department,
        startDate: rosterData.startDate,
        endDate: rosterData.endDate,
        shifts: rosterData.shifts.map(shift => ({
          name: shift.name,
          startTime: shift.startTime,
          endTime: shift.endTime,
          assignedUsers: shift.assignedUsers.map(user => user.id)
        }))
      });
    } catch (err) {
      setError('Failed to load roster data');
      console.error('Roster fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setError('');
      
      const rosterData = {
        ...values,
        createdBy: user.id
      };

      if (isEdit) {
        await rosterService.updateRoster(id, rosterData);
      } else {
        await rosterService.createRoster(rosterData);
      }
      
      navigate('/rosters');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h1>{isEdit ? 'Edit Roster' : 'Create New Roster'}</h1>
            <Button variant="outline-secondary" onClick={() => navigate('/rosters')}>
              Back to Rosters
            </Button>
          </div>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      <Row>
        <Col>
          <Card>
            <Card.Body>
              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
                enableReinitialize
              >
                {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting, setFieldValue }) => (
                  <Form onSubmit={handleSubmit}>
                    {/* Basic Information */}
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Roster Name</Form.Label>
                          <Form.Control
                            type="text"
                            name="name"
                            value={values.name}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            isInvalid={touched.name && errors.name}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.name}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Department</Form.Label>
                          <Form.Select
                            name="department"
                            value={values.department}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            isInvalid={touched.department && errors.department}
                          >
                            <option value="">Select Department</option>
                            {rosterService.getDepartments().map(dept => (
                              <option key={dept} value={dept}>{dept}</option>
                            ))}
                          </Form.Select>
                          <Form.Control.Feedback type="invalid">
                            {errors.department}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Start Date</Form.Label>
                          <Form.Control
                            type="date"
                            name="startDate"
                            value={values.startDate}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            isInvalid={touched.startDate && errors.startDate}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.startDate}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>End Date</Form.Label>
                          <Form.Control
                            type="date"
                            name="endDate"
                            value={values.endDate}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            isInvalid={touched.endDate && errors.endDate}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.endDate}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                    </Row>

                    {/* Shifts Section */}
                    <hr className="my-4" />
                    <h4 className="mb-3">Shifts</h4>

                    <FieldArray name="shifts">
                      {({ push, remove }) => (
                        <>
                          {values.shifts.map((shift, index) => (
                            <Card key={index} className="mb-3">
                              <Card.Header className="d-flex justify-content-between align-items-center">
                                <h6 className="mb-0">Shift {index + 1}</h6>
                                {values.shifts.length > 1 && (
                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => remove(index)}
                                  >
                                    Remove Shift
                                  </Button>
                                )}
                              </Card.Header>
                              <Card.Body>
                                <Row>
                                  <Col md={4}>
                                    <Form.Group className="mb-3">
                                      <Form.Label>Shift Name</Form.Label>
                                      <Form.Control
                                        type="text"
                                        name={`shifts.${index}.name`}
                                        value={shift.name}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        isInvalid={touched.shifts?.[index]?.name && errors.shifts?.[index]?.name}
                                      />
                                      <Form.Control.Feedback type="invalid">
                                        {errors.shifts?.[index]?.name}
                                      </Form.Control.Feedback>
                                    </Form.Group>
                                  </Col>
                                  <Col md={4}>
                                    <Form.Group className="mb-3">
                                      <Form.Label>Start Time</Form.Label>
                                      <Form.Control
                                        type="time"
                                        name={`shifts.${index}.startTime`}
                                        value={shift.startTime}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        isInvalid={touched.shifts?.[index]?.startTime && errors.shifts?.[index]?.startTime}
                                      />
                                      <Form.Control.Feedback type="invalid">
                                        {errors.shifts?.[index]?.startTime}
                                      </Form.Control.Feedback>
                                    </Form.Group>
                                  </Col>
                                  <Col md={4}>
                                    <Form.Group className="mb-3">
                                      <Form.Label>End Time</Form.Label>
                                      <Form.Control
                                        type="time"
                                        name={`shifts.${index}.endTime`}
                                        value={shift.endTime}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        isInvalid={touched.shifts?.[index]?.endTime && errors.shifts?.[index]?.endTime}
                                      />
                                      <Form.Control.Feedback type="invalid">
                                        {errors.shifts?.[index]?.endTime}
                                      </Form.Control.Feedback>
                                    </Form.Group>
                                  </Col>
                                </Row>

                                <Form.Group className="mb-3">
                                  <Form.Label>Assigned Users</Form.Label>
                                  <Form.Select
                                    multiple
                                    name={`shifts.${index}.assignedUsers`}
                                    value={shift.assignedUsers}
                                    onChange={(e) => {
                                      const selectedValues = Array.from(e.target.selectedOptions, option => parseInt(option.value));
                                      setFieldValue(`shifts.${index}.assignedUsers`, selectedValues);
                                    }}
                                    isInvalid={touched.shifts?.[index]?.assignedUsers && errors.shifts?.[index]?.assignedUsers}
                                    style={{ minHeight: '120px' }}
                                  >
                                    {availableUsers.map(user => (
                                      <option key={user.id} value={user.id}>
                                        {user.firstName} {user.lastName} ({user.role} - {user.department})
                                      </option>
                                    ))}
                                  </Form.Select>
                                  <Form.Text className="text-muted">
                                    Hold Ctrl/Cmd to select multiple users
                                  </Form.Text>
                                  <Form.Control.Feedback type="invalid">
                                    {errors.shifts?.[index]?.assignedUsers}
                                  </Form.Control.Feedback>
                                </Form.Group>
                              </Card.Body>
                            </Card>
                          ))}

                          <Button
                            variant="outline-primary"
                            onClick={() => push({
                              name: 'Second Shift',
                              startTime: '16:00',
                              endTime: '00:00',
                              assignedUsers: []
                            })}
                            className="mb-4"
                          >
                            Add Another Shift
                          </Button>
                        </>
                      )}
                    </FieldArray>

                    <div className="d-flex gap-2">
                      <Button
                        variant="primary"
                        type="submit"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Spinner animation="border" size="sm" className="me-2" />
                            {isEdit ? 'Updating...' : 'Creating...'}
                          </>
                        ) : (
                          isEdit ? 'Update Roster' : 'Create Roster'
                        )}
                      </Button>
                      <Button
                        variant="outline-secondary"
                        onClick={() => navigate('/rosters')}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                    </div>
                  </Form>
                )}
              </Formik>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default RosterForm;
