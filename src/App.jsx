import React from 'react';
import Layout from './components/Layout';
import { ChatProvider } from './context/ChatContext';
import { Toaster } from 'react-hot-toast';
import './components/StatusBar.css';

// Main App Container
function AppContainer() {
  return (
    <ChatProvider>
      <div className="h-screen flex flex-col">
        <Layout />
        <Toaster position="top-right" />
      </div>
    </ChatProvider>
  );
}

export default AppContainer;
