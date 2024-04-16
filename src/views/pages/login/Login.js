import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
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
import axios from 'axios';

import { CToast, CToastBody, CToastHeader, CToaster } from '@coreui/react'

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [toast, addToast] = useState(0)
  const toaster = useRef()
  const [showToast, setShowToast] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
      localStorage.removeItem("loginTimestamp");
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("miytime");
  });

  const showToastMessage = (message) => {
    setErrorMessage(message)
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 10000);
  }

  const toggleToast = () => {
    setShowToast(!showToast);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8098/api/v1/user/login', {
        username: username,
        password: password
      });

      if (response.data) {
        localStorage.setItem("loginTimestamp", Date.now());
        localStorage.setItem("user", username);
        localStorage.setItem("token", response.data);
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error occurred:', error);
      setErrorMessage(error.response.data.message);
      setShowToast(true);
      console.log("showToast = ", showToast);
      showToastMessage(error.response.data.message);
    }
  };

  return (
    <div className="bg-light min-vh-100 d-flex flex-row align-items-center">
      {showToast === true?
      <CToaster classname='p-3' placement='top-end' push={toast} ref={toaster}>
        <CToast show={true} animation={true} autohide={true} 
              fade={true} visible={true} onClose={toggleToast}>
          <CToastHeader closeButton>
            <svg
              className="rounded me-2"
              width="20"
              height="20"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="xMidYMid slice"
              focusable="false"
              role="img"
            >
            <rect width="100%" height="100%" fill="#FF0000"></rect>
            </svg>
            <div className="fw-bold me-auto">Login Message</div>
          </CToastHeader>
          <CToastBody>{errorMessage}</CToastBody>
        </CToast>
      </CToaster>
      : null}
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={8}>
            <CCardGroup>
              <CCard className="p-4">
                <CCardBody>
                  <CForm onSubmit={handleSubmit}> {/* Add onSubmit event */}
                    <h1>Login</h1>
                    <p className="text-medium-emphasis">Sign In to your account</p>
                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilUser} />
                      </CInputGroupText>
                      <CFormInput placeholder="Username" autoComplete="username" 
                      onChange={(e) => setUsername(e.target.value)}/>
                    </CInputGroup>
                    <CInputGroup className="mb-4">
                      <CInputGroupText>
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        type="password"
                        placeholder="Password"
                        autoComplete="current-password"
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </CInputGroup>
                    <CRow>
                      <CCol xs={6}>
                        <CButton type="submit" color="primary" className="px-4">
                          Login
                        </CButton>
                      </CCol>
                    </CRow>
                  </CForm>
                </CCardBody>
              </CCard>
              {/* Add Link to Register */}
              <CCard className="text-white bg-primary py-5" style={{ width: '44%' }}>
                <CCardBody className="text-center">
                  <div>
                    <h2>Position Regulation Bias</h2>
                    <br/>
                    <p>
                      Please validate user name and password
                    </p>
                    <Link to="/register">
                      {/* <CButton color="primary" className="mt-3" active tabIndex={-1}>
                        Register Now!
                      </CButton> */}
                    </Link>
                  </div>
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  );
}

export default Login;