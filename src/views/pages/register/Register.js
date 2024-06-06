import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom';
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
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser } from '@coreui/icons'

import axios from 'axios';
import api from './../../config.js';

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const location = useLocation();

  useEffect(() => {
    const urlParam = new URLSearchParams(location.search).get('url');
    if (urlParam) {
      api.defaults.baseURL = urlParam;
    }
  }, [location]);  

  const handleSubmit = async (e) => {
    // e.preventDefault();

    try {
      const response = await api.post('/api/v1/register', {
        headers: {
          // 'Content-Type': 'application/json',
          // "Access-Control-Allow-Origin": "*",
          // 'origin':'x-requested-with',
          // 'Access-Control-Allow-Headers': 'POST, GET, PUT, DELETE, OPTIONS, HEAD, Authorization, Origin, Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, Access-Control-Allow-Origin',
        },
        body: JSON.stringify({ username, password, email }),
      });

      // localStorage.setItem("mytime", Date.now());
      // localStorage.setItem("user", "damian");

      if (response.ok) {
        // Login successful
        console.log('Login successful');
        // Redirect or do something else as needed
      } else {
        // Login failed
        console.error('Login failed');
        // Handle error, e.g., show error message to user
      }
    } catch (error) {
      console.error('Error occurred:', error);
      // Handle error, e.g., show error message to user
    }
  };

  return (
    <div className="bg-light min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={9} lg={7} xl={6}>
            <CCard className="mx-4">
              <CCardBody className="p-4">
                <CForm>
                  <h1>Register</h1>
                  <p className="text-medium-emphasis">Create your account</p>
                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilUser} />
                    </CInputGroupText>
                    <CFormInput placeholder="Username" autoComplete="username" 
                    onChange={(e) => setUsername(e.target.value)}/>
                  </CInputGroup>
                  <CInputGroup className="mb-3">
                    <CInputGroupText>@</CInputGroupText>
                    <CFormInput placeholder="Email" autoComplete="email" 
                    onChange={(e) => setEmail(e.target.value)}/>
                  </CInputGroup>
                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilLockLocked} />
                    </CInputGroupText>
                    <CFormInput
                      type="password"
                      placeholder="Password"
                      autoComplete="new-password"
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </CInputGroup>
                  <CInputGroup className="mb-4">
                    <CInputGroupText>
                      <CIcon icon={cilLockLocked} />
                    </CInputGroupText>
                    <CFormInput
                      type="password"
                      placeholder="Repeat password"
                      autoComplete="new-password"
                    />
                  </CInputGroup>
                  <div className="d-grid">
                    <CButton color="primary" onClick={(e) => handleSubmit()}>Create Account</CButton>
                  </div>
                </CForm>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Register;
