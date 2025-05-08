import React from 'react';
import { useChatContext } from '../context/ChatContext';

// Eight preset styles as requested in the requirements
const presetStyles = [
  'Photographic',
  'None',
  'Hyperrealism',
  'Enhance',
  'Analog Film',
  'Real Estate',
  'Cinematic',
  'Texture'
];

function StyleQuickSelect() {
  const { settings, updateSettings } = useChatContext();
  
  const handleStyleSelect = (style) => {
    updateSettings({ stylePreset: style });
  };
  
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">Style</label>
      <div className="flex flex-wrap gap-2">
        {presetStyles.map(style => (
          <button
            key={style}
            onClick={() => handleStyleSelect(style)}
            className={`py-2 px-3 rounded-md text-sm transition-colors ${
              settings.stylePreset === style
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
            }`}
          >
            {style}
          </button>
        ))}
      </div>
    </div>
  );
}

export default StyleQuickSelect;
