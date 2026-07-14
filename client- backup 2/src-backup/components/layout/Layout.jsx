import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import useAuthStore from '../../store/useAuthStore';

const Layout = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className={isAuthenticated ? 'app-shell' : 'public-shell'}>
      <Header />
      <main className={isAuthenticated ? 'app-content' : 'public-content'}>
        <Outlet />
      </main>
      {!isAuthenticated && <Footer />}
    </div>
  );
};

export default Layout;
