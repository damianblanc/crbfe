import { React, useEffect } from 'react'
import { AppContent, AppSidebar, AppFooter, AppHeader } from '../components/index'
import { isLoginTimestampValid } from '../utils/utils.js';
import { useNavigate } from 'react-router-dom';

const DefaultLayout = () => {
  const navigate = useNavigate();
 
  useEffect(() => {
    const isValid = isLoginTimestampValid();
    if (!isValid) {
      navigate('/');
    }
  }, []);

  return (
    <div>
      <AppSidebar />
      <div className="wrapper d-flex flex-column min-vh-100 bg-light">
        <AppHeader />
        <div className="body flex-grow-1 px-3">
          <AppContent />
        </div>
        <AppFooter />
      </div>
    </div>
  )
}

export default DefaultLayout
