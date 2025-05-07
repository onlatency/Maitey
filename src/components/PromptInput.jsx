import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Sparkles, Lightbulb } from 'lucide-react';
import SettingsPanel from './SettingsPanel';

function PromptInput({ onSendMessage, isLoading }) {
  const [promptText, setPromptText] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);
  
  // Example prompt suggestions
  const suggestions = [
    "A serene Japanese garden with cherry blossoms",
    "Cyberpunk cityscape at night with neon lights",
    "A wizard casting spells in an ancient library",
    "Underwater kingdom with mermaids and coral castles",
    "Space station orbiting a vibrant nebula",
    "Medieval castle on a floating island in the sky"
  ];

  useEffect(() => {
    // Click outside to close suggestions
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (promptText.trim() && !isLoading) {
      onSendMessage(promptText);
      setPromptText('');
      setShowSuggestions(false);
    }
  };

  const applyPromptSuggestion = (suggestion) => {
    setPromptText(suggestion);
    setShowSuggestions(false);
    // Focus the input after selecting a suggestion
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex items-center space-x-2 relative">
        <div className="relative flex-grow" ref={inputRef}>
          <input
            type="text"
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            placeholder="Describe the image you want to generate..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow duration-150"
            disabled={isLoading}
            onFocus={() => promptText.trim() === '' && setShowSuggestions(true)}
          />
          
          {/* Prompt ideas button */}
          <button
            type="button"
            onClick={() => setShowSuggestions(!showSuggestions)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            title="Get prompt ideas"
          >
            <Lightbulb size={20} />
          </button>
          
          {/* Suggestions dropdown */}
          {showSuggestions && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              <div className="p-2 border-b border-gray-200 flex items-center">
                <Sparkles size={16} className="text-yellow-500 mr-2" />
                <span className="text-sm font-medium">Prompt Suggestions</span>
              </div>
              <ul className="py-1">
                {suggestions.map((suggestion, index) => (
                  <li key={index}>
                    <button
                      type="button"
                      onClick={() => applyPromptSuggestion(suggestion)}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
                    >
                      {suggestion}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        {/* Settings Panel */}
        <SettingsPanel />
        
        {/* Send Button */}
        <button
          type="submit"
          disabled={isLoading || !promptText.trim()}
          className={`p-3 rounded-lg text-white transition-colors duration-150 ease-in-out min-w-[48px]
                    ${isLoading || !promptText.trim() 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-blue-500 hover:bg-blue-600 focus:ring-2 focus:ring-blue-300'}`}
          title="Generate Image"
        >
          {isLoading ? <Loader2 size={24} className="animate-spin" /> : <Send size={24} />}
        </button>
      </form>
      
      {/* Character count and help text */}
      <div className="mt-1 flex justify-between text-xs text-gray-500">
        <div>{promptText.length > 0 ? `${promptText.length} characters` : 'Try to be specific with details'}</div>
        <div className="text-right">Press Enter to generate</div>
      </div>
    </div>
  );
}

export default PromptInput;
