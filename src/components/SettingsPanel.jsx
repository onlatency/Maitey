import React, { useState } from 'react';
import { useChatContext } from '../context/ChatContext';
import { X, Sliders, Info } from 'lucide-react';

function SettingsPanel() {
  const { settings, updateSettings } = useChatContext();
  const [isOpen, setIsOpen] = useState(false);
  const [localSettings, setLocalSettings] = useState({ ...settings });

  const togglePanel = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      // Reset local settings to current settings when opening
      setLocalSettings({ ...settings });
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLocalSettings({
      ...localSettings,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateSettings(localSettings);
    setIsOpen(false);
  };

  const models = [
    { value: 'venice-sd35', label: 'Venice SD 3.5' },
    { value: 'lustify-sdxl', label: 'Lustify SDXL' },
    { value: 'venice-diffusion', label: 'Venice Diffusion' }
  ];

  const presets = [
    'Photographic', 'Digital Art', 'Cinematic', 'Anime', 
    'Fantasy', 'Neon', 'Retro', 'Abstract', 'Realistic'
  ];

  return (
    <div className="relative">
      {/* Settings Button */}
      <button
        onClick={togglePanel}
        className={`p-2 rounded-md transition-colors ${isOpen ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-200 text-gray-600'}`}
        title="Generation Settings"
      >
        <Sliders size={20} />
      </button>

      {/* Settings Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-xl border border-gray-200 w-80 z-10">
          <div className="flex justify-between items-center p-3 border-b">
            <h3 className="font-medium">Image Generation Settings</h3>
            <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700">
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            {/* Model Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
              <select
                name="model"
                value={localSettings.model}
                onChange={handleChange}
                className="w-full p-2 border rounded-md bg-white"
              >
                {models.map(model => (
                  <option key={model.value} value={model.value}>
                    {model.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Style Preset */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Style Preset</label>
              <select
                name="stylePreset"
                value={localSettings.stylePreset}
                onChange={handleChange}
                className="w-full p-2 border rounded-md bg-white"
              >
                {presets.map(preset => (
                  <option key={preset} value={preset}>
                    {preset}
                  </option>
                ))}
              </select>
            </div>

            {/* Size Controls */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Width</label>
                <select
                  name="width"
                  value={localSettings.width}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md bg-white"
                >
                  <option value={512}>512px</option>
                  <option value={768}>768px</option>
                  <option value={1024}>1024px</option>
                  <option value={1280}>1280px</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Height</label>
                <select
                  name="height"
                  value={localSettings.height}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md bg-white"
                >
                  <option value={512}>512px</option>
                  <option value={768}>768px</option>
                  <option value={1024}>1024px</option>
                  <option value={1280}>1280px</option>
                </select>
              </div>
            </div>

            {/* Steps Slider */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">Steps: {localSettings.steps}</label>
                <div className="flex items-center text-xs text-gray-500" title="Higher values produce better quality but take longer">
                  <Info size={12} className="mr-1" />
                  <span>Quality vs. Speed</span>
                </div>
              </div>
              <input
                type="range"
                name="steps"
                min="10"
                max="50"
                step="1"
                value={localSettings.steps}
                onChange={handleChange}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Faster</span>
                <span>Higher Quality</span>
              </div>
            </div>

            {/* CFG Scale Slider */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">CFG Scale: {localSettings.cfgScale}</label>
                <div className="flex items-center text-xs text-gray-500" title="How closely to follow the prompt. Higher values = more faithful to prompt but less creative">
                  <Info size={12} className="mr-1" />
                  <span>Prompt Adherence</span>
                </div>
              </div>
              <input
                type="range"
                name="cfgScale"
                min="1"
                max="15"
                step="0.5"
                value={localSettings.cfgScale}
                onChange={handleChange}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Creative</span>
                <span>Precise</span>
              </div>
            </div>

            {/* Toggles */}
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="safeMode"
                  name="safeMode"
                  checked={localSettings.safeMode}
                  onChange={handleChange}
                  className="mr-2"
                />
                <label htmlFor="safeMode" className="text-sm">Safe Mode</label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="hideWatermark"
                  name="hideWatermark"
                  checked={localSettings.hideWatermark}
                  onChange={handleChange}
                  className="mr-2"
                />
                <label htmlFor="hideWatermark" className="text-sm">Hide Watermark</label>
              </div>
            </div>

            {/* Negative Prompt */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Negative Prompt</label>
              <textarea
                name="negativePrompt"
                value={localSettings.negativePrompt}
                onChange={handleChange}
                rows="2"
                className="w-full p-2 border rounded-md text-sm"
                placeholder="Things to avoid in the generated image"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => setLocalSettings({ ...settings })}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-100"
              >
                Reset
              </button>
              <button
                type="submit"
                className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
              >
                Apply Settings
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default SettingsPanel;
