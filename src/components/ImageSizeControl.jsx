import React, { useState } from 'react';
import { useChatContext } from '../context/ChatContext';

// Size presets as specified in the requirements with exact dimensions
const sizePresets = [
  { name: 'Square (Default)', width: 1024, height: 1024 },
  { name: 'Landscape (3:2)', width: 1264, height: 848 },
  { name: 'Cinema (16:9)', width: 1280, height: 720 },
  { name: 'Tall (9:16)', width: 720, height: 1280 },
  { name: 'Portrait (2:3)', width: 848, height: 1264 },
  { name: 'Instagram (4:5)', width: 1011, height: 1264 },
  { name: 'Custom', width: null, height: null } // Custom option
];

function ImageSizeControl() {
  const { settings, updateSettings } = useChatContext();
  const [activePreset, setActivePreset] = useState(() => {
    // Determine the initial active preset based on current dimensions
    const currentWidth = settings.width;
    const currentHeight = settings.height;
    
    // Find a matching preset or default to custom
    const matchingPreset = sizePresets.find(
      preset => preset.width === currentWidth && preset.height === currentHeight
    );
    
    return matchingPreset?.name || 'Custom';
  });
  
  const [customWidth, setCustomWidth] = useState(settings.width);
  const [customHeight, setCustomHeight] = useState(settings.height);

  // Handle preset selection
  const handlePresetSelect = (event) => {
    const selectedPresetName = event.target.value;
    setActivePreset(selectedPresetName);
    
    // Find the selected preset
    const selectedPreset = sizePresets.find(preset => preset.name === selectedPresetName);
    
    if (selectedPreset && selectedPreset.name !== 'Custom') {
      // Update settings with the preset dimensions
      updateSettings({ 
        width: selectedPreset.width, 
        height: selectedPreset.height 
      });
    }
  };

  // Handle custom width change
  const handleCustomWidthChange = (event) => {
    const width = parseInt(event.target.value, 10);
    setCustomWidth(width);
    if (!isNaN(width) && width > 0) {
      updateSettings({ width });
    }
  };

  // Handle custom height change
  const handleCustomHeightChange = (event) => {
    const height = parseInt(event.target.value, 10);
    setCustomHeight(height);
    if (!isNaN(height) && height > 0) {
      updateSettings({ height });
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Image Size</label>
        <select
          value={activePreset}
          onChange={handlePresetSelect}
          className="w-full p-2 border border-purple-200 rounded-md bg-white focus:ring-2 focus:ring-purple-300 focus:border-transparent"
        >
          {sizePresets.map(preset => (
            <option key={preset.name} value={preset.name}>
              {preset.name}
              {preset.name !== 'Custom' && ` - ${preset.width}x${preset.height}`}
            </option>
          ))}
        </select>
      </div>
      
      {/* Show custom dimension inputs if Custom is selected */}
      {activePreset === 'Custom' && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Width (px)</label>
            <input
              type="number"
              value={customWidth}
              onChange={handleCustomWidthChange}
              min="256"
              max="1536"
              step="8"
              className="w-full p-2 border border-purple-200 rounded-md focus:ring-2 focus:ring-purple-300 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Height (px)</label>
            <input
              type="number"
              value={customHeight}
              onChange={handleCustomHeightChange}
              min="256"
              max="1536"
              step="8"
              className="w-full p-2 border border-purple-200 rounded-md focus:ring-2 focus:ring-purple-300 focus:border-transparent"
            />
          </div>
        </div>
      )}
      
      {/* Display the current dimensions for reference */}
      <div className="text-xs text-gray-500 text-right">
        Current size: {settings.width} × {settings.height} pixels
      </div>
    </div>
  );
}

export default ImageSizeControl;
