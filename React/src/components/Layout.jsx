import React from 'react';
import { Outlet } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = () => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <Container fluid className="flex-grow-1 p-0">
        <Row className="g-0 h-100">
          <Col md={3} lg={2} className="d-none d-md-block">
            <Sidebar />
          </Col>
          <Col md={9} lg={10}>
            <main className="main-content">
              <Outlet />
            </main>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Layout;
