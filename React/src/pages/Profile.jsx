import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, Badge } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/userService';

const validationSchema = Yup.object({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  currentPassword: Yup.string().when('newPassword', {
    is: (val) => val && val.length > 0,
    then: (schema) => schema.required('Current password is required to change password'),
    otherwise: (schema) => schema
  }),
  newPassword: Yup.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: Yup.string().when('newPassword', {
    is: (val) => val && val.length > 0,
    then: (schema) => schema.required('Please confirm your new password').oneOf([Yup.ref('newPassword')], 'Passwords must match'),
    otherwise: (schema) => schema
  })
});

const Profile = () => {
  const { user } = useAuth();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setError('');
      setSuccess('');
      
      const updateData = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email
      };

      // Only include password if user wants to change it
      if (values.newPassword) {
        updateData.password = values.newPassword;
        updateData.currentPassword = values.currentPassword;
      }

      await userService.updateUser(user.id, updateData);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
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

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <h1>My Profile</h1>
          <p className="text-muted">Manage your account information</p>
        </Col>
      </Row>

      <Row>
        <Col md={8}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Profile Information</h5>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}

              <Formik
                initialValues={{
                  firstName: user.firstName,
                  lastName: user.lastName,
                  email: user.email,
                  currentPassword: '',
                  newPassword: '',
                  confirmPassword: ''
                }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
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

                    <hr className="my-4" />
                    <h6 className="mb-3">Change Password (Optional)</h6>

                    <Form.Group className="mb-3">
                      <Form.Label>Current Password</Form.Label>
                      <Form.Control
                        type="password"
                        name="currentPassword"
                        value={values.currentPassword}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.currentPassword && errors.currentPassword}
                        placeholder="Enter current password to change"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.currentPassword}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>New Password</Form.Label>
                          <Form.Control
                            type="password"
                            name="newPassword"
                            value={values.newPassword}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            isInvalid={touched.newPassword && errors.newPassword}
                            placeholder="Enter new password"
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.newPassword}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Confirm New Password</Form.Label>
                          <Form.Control
                            type="password"
                            name="confirmPassword"
                            value={values.confirmPassword}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            isInvalid={touched.confirmPassword && errors.confirmPassword}
                            placeholder="Confirm new password"
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.confirmPassword}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                    </Row>

                    <Button
                      variant="primary"
                      type="submit"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Updating...
                        </>
                      ) : (
                        'Update Profile'
                      )}
                    </Button>
                  </Form>
                )}
              </Formik>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Account Details</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <strong>Username:</strong><br />
                <span className="text-muted">{user.username}</span>
              </div>

              <div className="mb-3">
                <strong>Role:</strong><br />
                <Badge bg={getRoleBadgeVariant(user.role)}>{user.role}</Badge>
              </div>

              <div className="mb-3">
                <strong>Department:</strong><br />
                <span className="text-muted">{user.department}</span>
              </div>

              <div className="mb-3">
                <strong>Status:</strong><br />
                <Badge bg={getStatusBadgeVariant(user.status)}>{user.status}</Badge>
              </div>

              <div className="mb-3">
                <strong>Member Since:</strong><br />
                <span className="text-muted">
                  {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;
