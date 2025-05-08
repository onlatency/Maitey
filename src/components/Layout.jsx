import React, { useState, useRef, useEffect } from 'react';
import './Gallery.css';
import ChatSelector from './ChatSelector';
import ImageGallery from './ImageGallery';
import PersistentPromptInput from './PersistentPromptInput';
import NegativePromptInput from './NegativePromptInput';
import ImageSizeControl from './ImageSizeControl';
import StyleQuickSelect from './StyleQuickSelect';
import { useChatContext } from '../context/ChatContext';
import { Check, GripVertical, Plus, Loader2 } from 'lucide-react';
import { fetchImageModels } from '../api/veniceApi';

function Layout() {
  const { createNewChat, activeChatId, settings, updateSettings } = useChatContext();
  const [sidebarWidth, setSidebarWidth] = useState(256); // 64*4px default width
  const [chatListHeight, setChatListHeight] = useState(window.innerHeight / 2);
  const [isSettingsEditable, setIsSettingsEditable] = useState(false);
  const [models, setModels] = useState([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [settingsPanels, setSettingsPanels] = useState([
    { id: 'model', label: 'Model' },
    { id: 'style', label: 'Style' },
    { id: 'steps', label: 'Steps' },
    { id: 'adherence', label: 'Adherence (CFG)' },
    { id: 'negativePrompts', label: 'Negative Prompts' },
    { id: 'imageSize', label: 'Image Size' }
  ]);
  
  // Fetch models when component mounts
  useEffect(() => {
    const loadModels = async () => {
      setIsLoadingModels(true);
      try {
        const modelData = await fetchImageModels();
        setModels(modelData);
      } catch (error) {
        console.error('Failed to load models:', error);
      } finally {
        setIsLoadingModels(false);
      }
    };
    
    loadModels();
  }, []);
  
  const sidebarRef = useRef(null);
  const chatListRef = useRef(null);
  const isResizingSidebar = useRef(false);
  const isResizingChatList = useRef(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const startWidth = useRef(0);
  const startHeight = useRef(0);
  
  // Drag and drop functionality for settings panels
  const [draggedPanel, setDraggedPanel] = useState(null);
  
  // Handle drag start
  const handleDragStart = (e, panel) => {
    setDraggedPanel(panel);
  };
  
  // Handle drag end
  const handleDragEnd = () => {
    setDraggedPanel(null);
  };
  
  // Handle panel drop
  const handleDrop = (e, targetPanel) => {
    if (!draggedPanel) return;
    
    // Reorder panels
    const updatedPanels = [...settingsPanels];
    const draggedIndex = updatedPanels.findIndex(p => p.id === draggedPanel.id);
    const targetIndex = updatedPanels.findIndex(p => p.id === targetPanel.id);
    
    // Remove the dragged item
    const [draggedItem] = updatedPanels.splice(draggedIndex, 1);
    
    // Insert at the target position
    updatedPanels.splice(targetIndex, 0, draggedItem);
    
    setSettingsPanels(updatedPanels);
    setDraggedPanel(null);
  };
  
  // Toggle edit mode for settings
  const toggleSettingsEditMode = () => {
    setIsSettingsEditable(!isSettingsEditable);
  };

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
        <div className="flex-1 min-h-[100px] p-4 bg-cream-50 overflow-y-auto">
          <div className="flex justify-between items-center mb-5">
            <h3 className="font-medium text-lg text-purple-800">Image Settings</h3>
            <button 
              onClick={toggleSettingsEditMode}
              className={`p-1.5 rounded-full transition-colors ${
                isSettingsEditable ? 'bg-green-500 text-white' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
              }`}
              title={isSettingsEditable ? 'Save order' : 'Reorder settings'}
            >
              <Check size={18} />
            </button>
          </div>
          
          <div className={`space-y-5 ${isSettingsEditable ? 'space-y-2' : ''}`}>
            {/* Dynamically render settings panels based on order in settingsPanels state */}
            {settingsPanels.map((panel, index) => (
              <div 
                key={panel.id}
                draggable={isSettingsEditable}
                onDragStart={(e) => handleDragStart(e, panel)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, panel)}
                className={`${isSettingsEditable ? 'border-2 border-dashed border-purple-200 rounded-md p-2 cursor-move' : ''}`}
              >
                {isSettingsEditable && (
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-purple-700">{panel.label}</span>
                    <GripVertical className="text-purple-400" size={16} />
                  </div>
                )}

                {/* Model Selection */}
                {panel.id === 'model' && (
                  <div>
                    {!isSettingsEditable && <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>}
                    <div className="relative">
                      {isLoadingModels ? (
                        <div className="flex items-center">
                          <Loader2 className="animate-spin mr-2 text-purple-600" size={18} />
                          <span className="text-purple-600 text-sm">Loading models...</span>
                        </div>
                      ) : (
                        <>
                          <select
                            name="model"
                            value={settings.model}
                            onChange={(e) => updateSettings({ model: e.target.value })}
                            className="w-full py-2.5 px-3 appearance-none bg-white border-2 border-purple-300 text-purple-800 rounded-md focus:ring-2 focus:ring-purple-400 focus:border-transparent shadow-sm"
                          >
                            {models.length > 0 ? (
                              models.map(model => (
                                <option key={model.value} value={model.value}>
                                  {model.label}
                                </option>
                              ))
                            ) : (
                              <option value="venice-sd35">Stable Diffusion 3.5</option>
                            )}
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-purple-500">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                            </svg>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Style Quick Select */}
                {panel.id === 'style' && (
                  <StyleQuickSelect />
                )}
                
                {/* Image Size Control */}
                {panel.id === 'imageSize' && (
                  <ImageSizeControl />
                )}
                
                {/* Steps Slider */}
                {panel.id === 'steps' && (
                  <div className="pb-1">
                    {!isSettingsEditable && (
                      <div className="flex justify-between mb-2">
                        <label htmlFor="steps-input" className="text-sm font-medium text-gray-700">Steps</label>
                        <input
                          id="steps-input"
                          type="number"
                          min="0"
                          max="50"
                          value={settings.steps}
                          onChange={(e) => {
                            const value = Math.min(50, Math.max(0, parseInt(e.target.value) || 0));
                            updateSettings({ steps: value });
                          }}
                          className="w-14 py-0.5 px-2 text-right text-purple-700 font-medium bg-transparent border border-transparent hover:border-purple-200 focus:border-purple-400 focus:bg-white focus:outline-none rounded transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          tabIndex="1"
                        />  
                      </div>
                    )}
                    <div className="relative h-9 my-2">
                      {/* Track with depth effect */}
                      <div className="absolute top-1/2 transform -translate-y-1/2 w-full h-3 rounded-full bg-purple-200 shadow-inner overflow-hidden">
                        {/* Filled portion */}
                        <div 
                          className="h-full bg-purple-500 rounded-l-full"
                          style={{ width: `${(settings.steps / 50) * 100}%` }}
                        ></div>
                      </div>
                      
                      {/* Knob */}
                      <div 
                        className="absolute top-1/2 transform -translate-y-1/2 h-6 w-6 rounded-full bg-white border-2 border-purple-500 shadow-md cursor-pointer"
                        style={{ 
                          left: `calc(${(settings.steps / 50) * 100}% - 12px)`,
                          zIndex: 10
                        }}
                      ></div>
                      
                      {/* Hidden input for actual functionality */}
                      <input
                        type="range"
                        min="0"
                        max="50"
                        step="1"
                        value={settings.steps}
                        onChange={(e) => updateSettings({ steps: parseInt(e.target.value, 10) })}
                        className="w-full absolute inset-0 h-full opacity-0 cursor-pointer z-20"
                      />
                    </div>
                  </div>
                )}
                
                {/* Adherence (CFG) Slider */}
                {panel.id === 'adherence' && (
                  <div className="pb-1">
                    {!isSettingsEditable && (
                      <div className="flex justify-between mb-2">
                        <label htmlFor="cfg-input" className="text-sm font-medium text-gray-700">Adherence (CFG)</label>
                        <input
                          id="cfg-input"
                          type="number"
                          min="0"
                          max="7"
                          step="0.1"
                          value={settings.cfgScale}
                          onChange={(e) => {
                            const value = Math.min(7, Math.max(0, parseFloat(e.target.value) || 0));
                            updateSettings({ cfgScale: value });
                          }}
                          className="w-14 py-0.5 px-2 text-right text-purple-700 font-medium bg-transparent border border-transparent hover:border-purple-200 focus:border-purple-400 focus:bg-white focus:outline-none rounded transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          tabIndex="2"
                        />
                      </div>
                    )}
                    <div className="relative h-9 my-2">
                      {/* Track with depth effect */}
                      <div className="absolute top-1/2 transform -translate-y-1/2 w-full h-3 rounded-full bg-purple-200 shadow-inner overflow-hidden">
                        {/* Filled portion */}
                        <div 
                          className="h-full bg-purple-500 rounded-l-full"
                          style={{ width: `${(settings.cfgScale / 7) * 100}%` }}
                        ></div>
                      </div>
                      
                      {/* Knob */}
                      <div 
                        className="absolute top-1/2 transform -translate-y-1/2 h-6 w-6 rounded-full bg-white border-2 border-purple-500 shadow-md cursor-pointer"
                        style={{ 
                          left: `calc(${(settings.cfgScale / 7) * 100}% - 12px)`,
                          zIndex: 10
                        }}
                      ></div>
                      
                      {/* Hidden input for actual functionality */}
                      <input
                        type="range"
                        min="0"
                        max="7"
                        step="0.1"
                        value={settings.cfgScale}
                        onChange={(e) => updateSettings({ cfgScale: parseFloat(e.target.value) })}
                        className="w-full absolute inset-0 h-full opacity-0 cursor-pointer z-20"
                      />
                    </div>
                  </div>
                )}
                
                {/* Negative Prompts */}
                {panel.id === 'negativePrompts' && (
                  <NegativePromptInput />
                )}
              </div>
            ))}
          </div>
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
