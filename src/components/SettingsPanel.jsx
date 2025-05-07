import React, { useState, useEffect } from 'react';
import { useChatContext } from '../context/ChatContext';
import { X, Sliders, Info, Loader2 } from 'lucide-react';
import { fetchImageModels, fetchImageStyles } from '../api/veniceApi';

function SettingsPanel() {
  const { settings, updateSettings } = useChatContext();
  const [isOpen, setIsOpen] = useState(false);
  const [localSettings, setLocalSettings] = useState({ ...settings });
  
  // State for dynamic data from API
  const [models, setModels] = useState([]);
  const [styles, setStyles] = useState([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [isLoadingStyles, setIsLoadingStyles] = useState(false);
  const [error, setError] = useState(null);

  // Fetch models and styles when panel is opened
  useEffect(() => {
    if (isOpen) {
      // Fetch models
      const fetchModels = async () => {
        setIsLoadingModels(true);
        setError(null);
        try {
          const formattedModels = await fetchImageModels();
          setModels(formattedModels);
        } catch (err) {
          console.error('Failed to fetch models:', err);
          setError('Failed to load models');
        } finally {
          setIsLoadingModels(false);
        }
      };

      // Fetch styles
      const fetchStyles = async () => {
        setIsLoadingStyles(true);
        try {
          const formattedStyles = await fetchImageStyles();
          setStyles(formattedStyles);
        } catch (err) {
          console.error('Failed to fetch styles:', err);
        } finally {
          setIsLoadingStyles(false);
        }
      };

      fetchModels();
      fetchStyles();
    }
  }, [isOpen]); // Only run when isOpen changes

  const togglePanel = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      // Reset local settings to current settings when opening
      setLocalSettings({ ...settings });
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Determine the appropriate value based on the field type
    let processedValue;
    if (type === 'checkbox') {
      processedValue = checked;
    } else if (type === 'number' || name === 'width' || name === 'height') {
      // Ensure width and height are always numbers, even from select dropdowns
      processedValue = parseInt(value, 10);
    } else if (name === 'cfgScale' || name === 'steps') {
      // Ensure numeric sliders are also numbers
      processedValue = parseFloat(value);
    } else {
      processedValue = value;
    }
    
    setLocalSettings({
      ...localSettings,
      [name]: processedValue
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Updating settings with:', localSettings);
    updateSettings(localSettings);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Settings Button - Enhanced to be more visible */}
      <button
        onClick={togglePanel}
        className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${isOpen ? 'bg-purple-600 text-white' : 'bg-purple-100 hover:bg-purple-200 text-purple-700'}`}
        title="Adjust Image Generation Settings"
        aria-label="Open image generation settings"
      >
        <Sliders size={18} />
        <span className="text-sm font-medium">Settings</span>
      </button>

      {/* Settings Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-xl border border-purple-200 w-80 z-10">
          <div className="flex justify-between items-center p-3 border-b border-purple-100">
            <h3 className="font-medium text-purple-800">Image Creation Settings</h3>
            <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700">
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            {/* Model Selection */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">Model</label>
                {isLoadingModels && (
                  <div className="flex items-center text-xs text-purple-600">
                    <Loader2 size={12} className="animate-spin mr-1" /> Loading...
                  </div>
                )}
              </div>
              <select
                name="model"
                value={localSettings.model}
                onChange={handleChange}
                className="w-full p-2 border border-purple-200 rounded-md bg-white focus:ring-2 focus:ring-purple-300 focus:border-transparent"
                disabled={isLoadingModels}
              >
                {models.length > 0 ? models.map(model => (
                  <option key={model.value} value={model.value}>
                    {model.label}
                  </option>
                )) : (
                  <option value={localSettings.model}>
                    {localSettings.model === 'venice-sd35' ? 'Venice SD 3.5' : localSettings.model}
                  </option>
                )}
              </select>
              {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
            </div>

            {/* Style Preset */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">Style Preset</label>
                {isLoadingStyles && (
                  <div className="flex items-center text-xs text-purple-600">
                    <Loader2 size={12} className="animate-spin mr-1" /> Loading...
                  </div>
                )}
              </div>
              <select
                name="stylePreset"
                value={localSettings.stylePreset}
                onChange={handleChange}
                className="w-full p-2 border border-purple-200 rounded-md bg-white focus:ring-2 focus:ring-purple-300 focus:border-transparent"
                disabled={isLoadingStyles}
              >
                {styles.length > 0 ? styles.map(style => (
                  <option key={style} value={style}>
                    {style}
                  </option>
                )) : (
                  <option value={localSettings.stylePreset}>{localSettings.stylePreset}</option>
                )}
              </select>
            </div>

            {/* Size Controls */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Width</label>
                <select
                  name="width"
                  value={localSettings.width.toString()}
                  onChange={handleChange}
                  className="w-full p-2 border border-purple-200 rounded-md bg-white focus:ring-2 focus:ring-purple-300 focus:border-transparent"
                >
                  <option value="512">512px</option>
                  <option value="768">768px</option>
                  <option value="1024">1024px</option>
                  <option value="1280">1280px</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Height</label>
                <select
                  name="height"
                  value={localSettings.height.toString()}
                  onChange={handleChange}
                  className="w-full p-2 border border-purple-200 rounded-md bg-white focus:ring-2 focus:ring-purple-300 focus:border-transparent"
                >
                  <option value="512">512px</option>
                  <option value="768">768px</option>
                  <option value="1024">1024px</option>
                  <option value="1280">1280px</option>
                </select>
              </div>
            </div>

            {/* Steps Slider */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">Steps: {localSettings.steps}</label>
                <span className="text-xs text-gray-500">Higher = Better Quality</span>
              </div>
              <input
                type="range"
                name="steps"
                min="20"
                max="50"
                value={localSettings.steps}
                onChange={handleChange}
                className="w-full accent-purple-500"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>20</span>
                <span>50</span>
              </div>
            </div>

            {/* CFG Scale Slider */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">CFG Scale: {localSettings.cfgScale}</label>
                <span className="text-xs text-gray-500">Prompt Adherence</span>
              </div>
              <input
                type="range"
                name="cfgScale"
                min="1"
                max="15"
                step="0.5"
                value={localSettings.cfgScale}
                onChange={handleChange}
                className="w-full accent-purple-500"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>1</span>
                <span>15</span>
              </div>
            </div>

            {/* Safety Mode and Hide Watermark settings removed */}

            {/* Negative Prompt */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Negative Prompt</label>
              <textarea
                name="negativePrompt"
                value={localSettings.negativePrompt}
                onChange={handleChange}
                rows="2"
                className="w-full p-2 border border-purple-200 rounded-md bg-white text-sm focus:ring-2 focus:ring-purple-300 focus:border-transparent"
                placeholder="Elements to exclude from the image"
              ></textarea>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              Apply Settings
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default SettingsPanel;
