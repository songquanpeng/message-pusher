import React, { lazy, Suspense, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import Loading from './components/Loading';
import User from './pages/User';
import { PrivateRoute } from './components/PrivateRoute';
import RegisterForm from './components/RegisterForm';
import LoginForm from './components/LoginForm';
import NotFound from './pages/NotFound';
import Setting from './pages/Setting';
import EditUser from './pages/User/EditUser';
import AddUser from './pages/User/AddUser';
import { API, showError } from './helpers';
import PasswordResetForm from './components/PasswordResetForm';
import GitHubOAuth from './components/GitHubOAuth';
import PasswordResetConfirm from './components/PasswordResetConfirm';

const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));

function App() {
  const loadStatus = async () => {
    const res = await API.get('/api/status');
    const { success, data } = res.data;
    if (success) {
      localStorage.setItem('status', JSON.stringify(data));
      localStorage.setItem('footer_html', data.footer_html);
    } else {
      showError('无法正常连接至服务器！');
    }
  };

  useEffect(() => {
    loadStatus().then();
  }, []);

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Suspense fallback={<Loading></Loading>}>
            <Home />
          </Suspense>
        }
      />
      <Route
        path="/user"
        element={
          <PrivateRoute>
            <User />
          </PrivateRoute>
        }
      />
      <Route
        path="/user/edit/:id"
        element={
          <Suspense fallback={<Loading></Loading>}>
            <EditUser />
          </Suspense>
        }
      />
      <Route
        path="/user/edit"
        element={
          <Suspense fallback={<Loading></Loading>}>
            <EditUser />
          </Suspense>
        }
      />
      <Route
        path="/user/add"
        element={
          <Suspense fallback={<Loading></Loading>}>
            <AddUser />
          </Suspense>
        }
      />
      <Route
        path="/user/reset"
        element={
          <Suspense fallback={<Loading></Loading>}>
            <PasswordResetConfirm />
          </Suspense>
        }
      />
      <Route
        path="/login"
        element={
          <Suspense fallback={<Loading></Loading>}>
            <LoginForm />
          </Suspense>
        }
      />
      <Route
        path="/register"
        element={
          <Suspense fallback={<Loading></Loading>}>
            <RegisterForm />
          </Suspense>
        }
      />
      <Route
        path="/reset"
        element={
          <Suspense fallback={<Loading></Loading>}>
            <PasswordResetForm />
          </Suspense>
        }
      />
      <Route
        path="/oauth/github"
        element={
          <Suspense fallback={<Loading></Loading>}>
            <GitHubOAuth />
          </Suspense>
        }
      />
      <Route
        path="/setting"
        element={
          <PrivateRoute>
            <Suspense fallback={<Loading></Loading>}>
              <Setting />
            </Suspense>
          </PrivateRoute>
        }
      />
      <Route
        path="/about"
        element={
          <Suspense fallback={<Loading></Loading>}>
            <About />
          </Suspense>
        }
      />
      <Route path="*" element={NotFound} />
    </Routes>
  );
}

export default App;
