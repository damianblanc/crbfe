import React, { Component, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './scss/style.scss';

const loading = (
  <div className="pt-3 text-center">
    <div className="sk-spinner sk-spinner-pulse"></div>
  </div>
);

// Containers
const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'));

// Pages
const Login = React.lazy(() => import('./views/pages/login/Login'));
const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'));
const Register = React.lazy(() => import('./views/pages/register/Register'));
const Page404 = React.lazy(() => import('./views/pages/page404/Page404'));
const Page500 = React.lazy(() => import('./views/pages/page500/Page500'));

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <Suspense fallback={loading}>
          <Routes>
            <Route exact path="/" element={<Login />} />
            <Route exact path="/" element={<Dashboard />} />
            <Route exact path="/register" element={<Register />} />
            <Route exact path="/404" element={<Page404 />} />
            <Route exact path="/500" element={<Page500 />} />
            <Route path="*" element={<DefaultLayout />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    );
  }
}

export default App;
