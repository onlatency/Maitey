import React, { useState, useEffect, useRef } from 'react';
import { useChatContext } from '../context/ChatContext';

function NegativePromptInput() {
  const { settings, updateSettings } = useChatContext();
  const [negativePrompt, setNegativePrompt] = useState(settings.negativePrompt || '');
  const textareaRef = useRef(null);
  
  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      // Reset height to auto to get the correct scrollHeight
      textareaRef.current.style.height = 'auto';
      // Set the height to scrollHeight to expand the textarea
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 100)}px`;
    }
  }, [negativePrompt]);
  
  // Update settings when user stops typing for 500ms
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateSettings({ negativePrompt });
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [negativePrompt, updateSettings]);
  
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Negative Prompts</label>
      <textarea
        ref={textareaRef}
        value={negativePrompt}
        onChange={(e) => setNegativePrompt(e.target.value)}
        placeholder="Elements to exclude from the image..."
        className="w-full p-2 border border-purple-200 rounded-md focus:ring-2 focus:ring-purple-300 focus:border-transparent resize-none min-h-[60px] max-h-[100px]"
        rows="2"
      />
      <div className="mt-1 text-xs text-gray-500">
        Add elements you want to exclude from the generated image
      </div>
    </div>
  );
}

export default NegativePromptInput;
