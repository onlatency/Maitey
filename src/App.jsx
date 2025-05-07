import React, { useState } from 'react';
import ChatList from './components/ChatList';
import ChatView from './components/ChatView';
import StatusBar from './components/StatusBar';
import { ChatProvider, useChatContext } from './context/ChatContext';
import { PlusCircle, Menu, X } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import './components/StatusBar.css';

// Main App Container
function AppContainer() {
  return (
    <ChatProvider>
      <App />
      <Toaster position="top-right" />
    </ChatProvider>
  );
}

// App Component with Context
function App() {
  const { createNewChat } = useChatContext();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden pb-7"> {/* Added pb-7 to make room for status bar */}
      {/* Mobile Sidebar Toggle Button */}
      <button 
        className="md:hidden fixed top-4 left-4 z-20 p-2 bg-purple-800 text-white rounded-md shadow-lg"
        onClick={toggleSidebar}
        aria-label="Toggle Sidebar"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar/Chat List - Responsive */}
      <div 
        className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
                    md:translate-x-0 transform transition-transform duration-300 ease-in-out 
                    md:w-1/4 w-64 fixed md:static top-0 left-0 h-full bg-purple-800 text-white flex flex-col z-10`}
      >
        <div className="p-4 border-b border-purple-700 flex justify-between items-center">
          <h1 className="text-xl font-semibold">Maitey Chats</h1>
          <button 
            onClick={() => {
              createNewChat();
              if (window.innerWidth < 768) { // close sidebar on mobile after creating chat
                setSidebarOpen(false);
              }
            }}
            className="p-2 hover:bg-purple-700 rounded-md"
            title="New Chat"
            aria-label="Create New Chat"
          >
            <PlusCircle size={24} />
          </button>
        </div>
        <ChatList />
      </div>

      {/* Chat View - Responsive */}
      <div className="flex-1 md:ml-0 ml-0 flex flex-col relative">
        <ChatView />
      </div>

      {/* Overlay to close sidebar on mobile when clicked outside */}
      {sidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-0"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}
      
      {/* Status Bar */}
      <StatusBar />
    </div>
  );
}

export default AppContainer;
