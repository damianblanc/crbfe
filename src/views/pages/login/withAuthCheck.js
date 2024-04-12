import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import jwtDecode from 'jwt-decode';

const withAuthCheck = (WrappedComponent) => {
  const AuthCheck = (props) => {
    const history = useHistory();

    useEffect(() => {
      const token = localStorage.getItem('token');
      if (!token) {
        // If token is not present, redirect to login page
        history.push('/login');
        return;
      }

      try {
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decodedToken.exp < currentTime) {
          // If token has expired, redirect to login page
          history.push('/login');
        }
      } catch (error) {
        console.error('Error decoding token:', error);
        // If decoding fails, redirect to login page
        history.push('/login');
      }
    }, [history]);

    return <WrappedComponent {...props} />;
  };

  return AuthCheck;
};

export default withAuthCheck;