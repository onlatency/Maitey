import React, { useState, useEffect } from 'react';
import { useChatContext } from '../context/ChatContext';
import { WifiOff, Wifi } from 'lucide-react';

function StatusBar() {
  const [currentTime, setCurrentTime] = useState('');
  const [apiStatus, setApiStatus] = useState('connected');
  const { isLoading } = useChatContext();
  
  // Update time every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeString = now.toLocaleTimeString();
      setCurrentTime(timeString);
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="status-bar">
      <div className="status-content">
        <div className="flex items-center gap-2">
          <span className="font-medium">Maitey Image Chat</span>
          <span className="text-xs opacity-70">•</span>
          <span className="text-xs opacity-70">Status</span>
          {apiStatus === 'connected' ? (
            <Wifi size={12} className="text-green-400" />
          ) : (
            <WifiOff size={12} className="text-red-400" />
          )}
        </div>
        
        <div className="flex items-center gap-4">
          {isLoading && (
            <span className="animate-pulse text-yellow-300">Generating Image...</span>
          )}
          <span>{currentTime}</span>
        </div>
      </div>
    </div>
  );
}

export default StatusBar;
