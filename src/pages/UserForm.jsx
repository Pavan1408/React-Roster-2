import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/userService';

const validationSchema = Yup.object({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  username: Yup.string().required('Username is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  role: Yup.string().required('Role is required'),
  department: Yup.string().required('Department is required'),
  status: Yup.string().required('Status is required'),
  password: Yup.string().when('isEdit', {
    is: false,
    then: (schema) => schema.min(6, 'Password must be at least 6 characters').required('Password is required'),
    otherwise: (schema) => schema.min(6, 'Password must be at least 6 characters')
  })
});

const UserForm = () => {
  const { user, hasRole } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState('');
  const [initialValues, setInitialValues] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    role: 'Employee',
    department: '',
    status: 'Active',
    password: ''
  });

  useEffect(() => {
    if (isEdit) {
      fetchUser();
    }
  }, [id, isEdit]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError('');
      const userData = await userService.getUserById(id);
      setInitialValues({
        firstName: userData.firstName,
        lastName: userData.lastName,
        username: userData.username,
        email: userData.email,
        role: userData.role,
        department: userData.department,
        status: userData.status,
        password: ''
      });
    } catch (err) {
      setError('Failed to load user data');
      console.error('User fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setError('');
      
      const userData = { ...values };
      if (isEdit && !userData.password) {
        delete userData.password; // Don't update password if not provided
      }

      if (isEdit) {
        await userService.updateUser(id, userData);
      } else {
        await userService.createUser(userData);
      }
      
      navigate('/users');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getAvailableRoles = () => {
    const allRoles = userService.getRoles();
    if (user.role === 'Supervisor') {
      // Supervisors can only create/edit employees
      return allRoles.filter(role => role === 'Employee');
    }
    return allRoles;
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
            <h1>{isEdit ? 'Edit User' : 'Add New User'}</h1>
            <Button variant="outline-secondary" onClick={() => navigate('/users')}>
              Back to Users
            </Button>
          </div>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      <Row>
        <Col md={8} lg={6}>
          <Card>
            <Card.Body>
              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
                enableReinitialize
              >
                {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
                  <Form onSubmit={handleSubmit}>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>First Name</Form.Label>
                          <Form.Control
                            type="text"
                            name="firstName"
                            value={values.firstName}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            isInvalid={touched.firstName && errors.firstName}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.firstName}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Last Name</Form.Label>
                          <Form.Control
                            type="text"
                            name="lastName"
                            value={values.lastName}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            isInvalid={touched.lastName && errors.lastName}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.lastName}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group className="mb-3">
                      <Form.Label>Username</Form.Label>
                      <Form.Control
                        type="text"
                        name="username"
                        value={values.username}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.username && errors.username}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.username}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={values.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.email && errors.email}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.email}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Role</Form.Label>
                          <Form.Select
                            name="role"
                            value={values.role}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            isInvalid={touched.role && errors.role}
                          >
                            <option value="">Select Role</option>
                            {getAvailableRoles().map(role => (
                              <option key={role} value={role}>{role}</option>
                            ))}
                          </Form.Select>
                          <Form.Control.Feedback type="invalid">
                            {errors.role}
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
                            {userService.getDepartments().map(dept => (
                              <option key={dept} value={dept}>{dept}</option>
                            ))}
                          </Form.Select>
                          <Form.Control.Feedback type="invalid">
                            {errors.department}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group className="mb-3">
                      <Form.Label>Status</Form.Label>
                      <Form.Select
                        name="status"
                        value={values.status}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.status && errors.status}
                      >
                        {userService.getUserStatuses().map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.status}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label>
                        Password {isEdit && <small className="text-muted">(leave blank to keep current password)</small>}
                      </Form.Label>
                      <Form.Control
                        type="password"
                        name="password"
                        value={values.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.password && errors.password}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.password}
                      </Form.Control.Feedback>
                    </Form.Group>

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
                          isEdit ? 'Update User' : 'Create User'
                        )}
                      </Button>
                      <Button
                        variant="outline-secondary"
                        onClick={() => navigate('/users')}
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

export default UserForm;
