import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Container, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../contexts/AuthContext';

const validationSchema = Yup.object({
  username: Yup.string().required('Username is required'),
  password: Yup.string().required('Password is required')
});

const Login = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  // Redirect if already logged in
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setError('');
      await login(values);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <Container>
        <Card className="login-card">
          <Card.Body className="p-4">
            <div className="text-center mb-4">
              <h2 className="mb-3">Welcome Back</h2>
              <p className="text-muted">Sign in to your account</p>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            <Formik
              initialValues={{ username: '', password: '' }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Username</Form.Label>
                    <Form.Control
                      type="text"
                      name="username"
                      value={values.username}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      isInvalid={touched.username && errors.username}
                      placeholder="Enter your username"
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.username}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      value={values.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      isInvalid={touched.password && errors.password}
                      placeholder="Enter your password"
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.password}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Button
                    variant="primary"
                    type="submit"
                    className="w-100"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Signing in...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </Form>
              )}
            </Formik>

            <div className="mt-4">
              <Card className="bg-light">
                <Card.Body className="p-3">
                  <h6 className="mb-2">Demo Credentials:</h6>
                  <small className="d-block">Admin: admin / admin123</small>
                  <small className="d-block">Supervisor: supervisor1 / super123</small>
                  <small className="d-block">Employee: employee1 / emp123</small>
                </Card.Body>
              </Card>
            </div>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default Login;
