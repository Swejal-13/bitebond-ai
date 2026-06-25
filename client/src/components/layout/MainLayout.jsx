import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import VerificationBanner from '../auth/VerificationBanner';
import SupportChatWidget from '../ai/SupportChatWidget';

const MainLayout = () => (
  <div className="min-h-screen flex flex-col bg-surface-light dark:bg-surface-dark transition-colors duration-200">
    <Navbar />
    <VerificationBanner />
    <main className="flex-1">
      <Outlet />
    </main>
    <Footer />
    <SupportChatWidget />
  </div>
);

export default MainLayout;
