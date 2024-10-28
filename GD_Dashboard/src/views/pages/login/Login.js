import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CButton,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilLockLocked, cilUser } from '@coreui/icons';
import './Login.css';
import logo from 'src/assets/brand/GD Strem Logo.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted:', { email, password });
    // Reset error message
    setErrorMessage('');

    // Basic client-side validation
    if (!validateEmail(email)) {
      setErrorMessage('Invalid email format');
      return;
    }
    if (!password) {
      setErrorMessage('Password cannot be empty');
      return;
    }

    // Create user object
    const user = {
      email,
      password,
    };

    try {
      // Send POST request to backend
      const response = await fetch('http://localhost:3001/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });

      if (response.ok) {
        // Get the token and username from the response
        const data = await response.json();
        const { token, username } = data;

        // Log the received token and username for debugging purposes
        console.log('Received token:', token);
        console.log('Received username:', username);

        // Save the token and username to localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('username', username);

        // Redirect to the dashboard or another protected page
        navigate('/dashboard');
      } else if (response.status === 401) {
        setErrorMessage('Invalid credentials. Please try again.');
        console.error('Invalid credentials:', { email, password });
      } else if (response.status === 500) {
        setErrorMessage('Internal server error. Please try again later.');
        console.error('Server error:', response);
      } else {
        setErrorMessage('An unexpected error occurred. Please try again.');
        console.error('Unexpected error:', response);
      }
    } catch (error) {
      console.error('Error logging in:', error);
      setErrorMessage('An error occurred. Please check your connection and try again.');
    }
  };

  return (
    <div className="login-page">
      <div className="login-image"></div>
      <div className="login-form">
        <CContainer>
          <CRow className="justify-content-center">
            <CCol md={8}>
              <CCard className="p-4 transparent-card">
                <CCardBody>
                  <div className="text-center mb-4">
                    <img src={logo} alt="GD Strem Logo" height="100" /> {/* Increase the height */}
                  </div>
                  <CForm onSubmit={handleSubmit}>
                    <h1>Login</h1>
                    <p className="text-body-secondary">Sign In to your account</p>
                    {errorMessage && (
                      <div style={{ color: 'red', marginBottom: '10px' }}>{errorMessage}</div>
                    )}
                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilUser} />
                      </CInputGroupText>
                      <CFormInput
                        type="email"
                        placeholder="Email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </CInputGroup>
                    <CInputGroup className="mb-4">
                      <CInputGroupText>
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        type="password"
                        placeholder="Password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </CInputGroup>
                    <CRow>
                      <CCol xs={6}>
                        <CButton type="submit" color="warning" className="px-4">
                          Login
                        </CButton>
                      </CCol>
                      <CCol xs={6} className="text-right">
                        <CButton color="link" className="px-0">
                          Forgot password?
                        </CButton>
                      </CCol>
                    </CRow>
                  </CForm>
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>
        </CContainer>
      </div>
    </div>
  );
};

export default Login;
