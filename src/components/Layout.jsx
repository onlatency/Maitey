import React from 'react';
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

  const handleCreateNewChat = () => {
    createNewChat();
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Panel - Chats and Settings */}
      <div className="w-64 flex flex-col bg-cream-100 border-r border-purple-100">
        {/* Chat List Section */}
        <div className="h-1/2 overflow-y-auto">
          <ChatSelector />
          
          {/* New Chat Button */}
          <div className="p-2 border-t border-purple-100">
            <button
              onClick={handleCreateNewChat}
              className="w-full flex items-center justify-center gap-2 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors"
            >
              <Plus size={18} />
              <span>New Chat</span>
            </button>
          </div>
        </div>
        
        {/* Settings Panel - Always show settings panel */}
        <div className="h-1/2 p-3 space-y-4 bg-cream-50 border-t border-purple-100 overflow-y-auto">
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
