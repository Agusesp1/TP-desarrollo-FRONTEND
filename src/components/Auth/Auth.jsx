import React, { useState } from 'react';
import { Container, Card, Form, Button } from 'react-bootstrap';
import './Auth.css';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);

  const toggleAuthMode = () => {
    setIsLogin((prev) => !prev);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(isLogin ? "Logging in..." : "Registering...");
  };

  return (
    <Container className="d-flex justify-content-center align-items-center auth-container">
      <Card className="auth-card p-4 p-sm-5 border-0 shadow-lg">
        <Card.Body>
          <div className="text-center mb-4 auth-header">
            <h2 className="fw-bold">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
            <p className="text-light">
              {isLogin ? 'Enter your details to access your account' : 'Sign up to get started with our platform'}
            </p>
          </div>

          <Form onSubmit={handleSubmit} className="auth-form">
            {!isLogin && (
              <Form.Group className="mb-3" controlId="name">
                <Form.Label className="fw-medium text-white">Full Name</Form.Label>
                <Form.Control type="text" placeholder="John Doe" required className="custom-input" />
              </Form.Group>
            )}

            <Form.Group className="mb-3" controlId="email">
              <Form.Label className="fw-medium text-white">Email address</Form.Label>
              <Form.Control type="email" placeholder="hello@example.com" required className="custom-input" />
            </Form.Group>

            <Form.Group className="mb-4" controlId="password">
              <Form.Label className="fw-medium text-white">Password</Form.Label>
              <Form.Control type="password" placeholder="••••••••" required className="custom-input" />
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100 fw-bold auth-button py-2">
              {isLogin ? 'Sign In' : 'Sign Up'}
            </Button>
          </Form>

          <div className="text-center mt-4 auth-footer text-muted">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <Button variant="link" className="p-0 text-decoration-none toggle-btn fw-bold" onClick={toggleAuthMode}>
              {isLogin ? 'Sign up' : 'Log in'}
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Auth;
