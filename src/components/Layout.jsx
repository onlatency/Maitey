import React, { useState, useRef, useEffect } from 'react';
import './Gallery.css';
import ChatSelector from './ChatSelector';
import ImageGallery from './ImageGallery';
import PersistentPromptInput from './PersistentPromptInput';
import NegativePromptInput from './NegativePromptInput';
import ImageSizeControl from './ImageSizeControl';
import StyleQuickSelect from './StyleQuickSelect';
import { useChatContext } from '../context/ChatContext';
import { Plus } from 'lucide-react';

function Layout() {
  const { createNewChat, activeChatId, settings, updateSettings } = useChatContext();
  const [sidebarWidth, setSidebarWidth] = useState(256); // 64*4px default width
  const [chatListHeight, setChatListHeight] = useState(window.innerHeight / 2);
  const sidebarRef = useRef(null);
  const chatListRef = useRef(null);
  const isResizingSidebar = useRef(false);
  const isResizingChatList = useRef(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const startWidth = useRef(0);
  const startHeight = useRef(0);

  // Handle sidebar horizontal resizing
  const handleMouseDown = (e, direction) => {
    if (direction === 'horizontal' && sidebarRef.current) {
      isResizingSidebar.current = true;
      startX.current = e.clientX;
      startWidth.current = sidebarRef.current.offsetWidth;
    } else if (direction === 'vertical' && chatListRef.current) {
      isResizingChatList.current = true;
      startY.current = e.clientY;
      startHeight.current = chatListRef.current.offsetHeight;
    }
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (isResizingSidebar.current) {
      const newWidth = startWidth.current + (e.clientX - startX.current);
      if (newWidth >= 200 && newWidth <= 500) {
        setSidebarWidth(newWidth);
      }
    } else if (isResizingChatList.current) {
      const newHeight = startHeight.current + (e.clientY - startY.current);
      const parentHeight = sidebarRef.current.offsetHeight;
      if (newHeight >= 100 && newHeight <= parentHeight - 100) {
        setChatListHeight(newHeight);
      }
    }
  };

  const handleMouseUp = () => {
    isResizingSidebar.current = false;
    isResizingChatList.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  // Clean up event listeners
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const handleCreateNewChat = () => {
    createNewChat();
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Panel - Chats and Settings */}
      <div 
        ref={sidebarRef}
        style={{ width: `${sidebarWidth}px` }}
        className="min-w-[200px] max-w-[500px] flex flex-col bg-cream-100 overflow-hidden relative border-r border-purple-100"
      >
        {/* Resizable right border */}
        <div 
          className="absolute right-0 top-0 bottom-0 w-2 bg-purple-200 hover:bg-purple-400 cursor-ew-resize z-10"
          onMouseDown={(e) => handleMouseDown(e, 'horizontal')}
        ></div>

        {/* Chat List Section */}
        <div 
          ref={chatListRef}
          style={{ height: `${chatListHeight}px` }}
          className="min-h-[100px] overflow-y-auto relative border-b border-purple-100"
        >
          <ChatSelector />
          {/* Resizable bottom border */}
          <div 
            className="absolute bottom-0 left-0 right-0 h-2 bg-purple-200 hover:bg-purple-400 cursor-ns-resize z-10"
            onMouseDown={(e) => handleMouseDown(e, 'vertical')}
          ></div>
        </div>
        
        {/* Settings Panel - Always show settings panel */}
        <div className="flex-1 min-h-[100px] p-3 space-y-4 bg-cream-50 overflow-y-auto">
          <h3 className="font-medium text-purple-800">Image Settings</h3>
            
            {/* Model Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
              <select
                name="model"
                value={settings.model}
                onChange={(e) => updateSettings({ model: e.target.value })}
                className="w-full p-2 border border-purple-200 rounded-md bg-white focus:ring-2 focus:ring-purple-300 focus:border-transparent"
              >
                <option value="venice-sd35">Stable Diffusion 3.5</option>
                <option value="lustify-sdxl">Lustify SDXL</option>
                <option value="venice-nsfw">Venice NSFW</option>
              </select>
            </div>
            
            {/* Style Quick Select */}
            <StyleQuickSelect />
            
            {/* Image Size Control */}
            <ImageSizeControl />
            
            {/* Steps Slider */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Steps <span className="text-gray-500 text-xs">{settings.steps}</span>
              </label>
              <input
                type="range"
                min="0"
                max="50"
                step="1"
                value={settings.steps}
                onChange={(e) => updateSettings({ steps: parseInt(e.target.value, 10) })}
                className="w-full"
              />
            </div>
            
            {/* Adherence (CFG) Slider */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adherence (CFG) <span className="text-gray-500 text-xs">{settings.cfgScale}</span>
              </label>
              <input
                type="range"
                min="0"
                max="7"
                step="0.1"
                value={settings.cfgScale}
                onChange={(e) => updateSettings({ cfgScale: parseFloat(e.target.value) })}
                className="w-full"
              />
            </div>
            
            {/* Negative Prompts */}
            <NegativePromptInput />
          </div>
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Image Gallery */}
        <ImageGallery />
        
        {/* Persistent Prompt Input */}
        <PersistentPromptInput />
      </div>
    </div>
  );
}

export default Layout;
