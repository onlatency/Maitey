import React, { useState, useEffect } from 'react';
import { useChatContext } from '../context/ChatContext';
import { fetchImageStyles } from '../api/veniceApi';
import { Loader2 } from 'lucide-react';

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
  const [allStyles, setAllStyles] = useState([]);
  const [isLoadingStyles, setIsLoadingStyles] = useState(false);
  
  // Fetch all available styles when component mounts
  useEffect(() => {
    const loadStyles = async () => {
      setIsLoadingStyles(true);
      try {
        const styles = await fetchImageStyles();
        setAllStyles(styles);
      } catch (error) {
        console.error('Failed to load styles:', error);
      } finally {
        setIsLoadingStyles(false);
      }
    };
    
    loadStyles();
  }, []);
  
  const handleStyleSelect = (style) => {
    updateSettings({ stylePreset: style });
  };
  
  const handleStyleChange = (e) => {
    updateSettings({ stylePreset: e.target.value });
  };
  
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">Style</label>
      
      {/* Quick select buttons */}
      <div className="flex flex-wrap gap-2 mb-3">
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
      
      {/* Style dropdown for all available styles */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">All Styles</label>
        <div className="relative">
          <select
            value={settings.stylePreset}
            onChange={handleStyleChange}
            className="w-full p-2 border border-purple-200 rounded-md bg-white focus:ring-2 focus:ring-purple-300 focus:border-transparent appearance-none" 
            disabled={isLoadingStyles}
          >
            {allStyles.length > 0 ? (
              allStyles.map(style => (
                <option key={style} value={style}>
                  {style}
                </option>
              ))
            ) : (
              <option value={settings.stylePreset}>{settings.stylePreset}</option>
            )}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
          {isLoadingStyles && (
            <div className="absolute right-8 inset-y-0 flex items-center">
              <Loader2 size={16} className="animate-spin text-purple-600" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StyleQuickSelect;
