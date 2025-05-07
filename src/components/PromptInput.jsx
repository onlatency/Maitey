import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, AlertCircle } from 'lucide-react';

function PromptInput({ onSendMessage, isLoading, value }) {
  const [promptText, setPromptText] = useState(value || '');
  const textareaRef = useRef(null);

  // Update internal state when value prop changes
  useEffect(() => {
    if (value !== undefined) {
      setPromptText(value);
    }
  }, [value]);
  
  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      // Reset height to auto to get the correct scrollHeight
      textareaRef.current.style.height = 'auto';
      // Set the height to scrollHeight to expand the textarea
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [promptText]);

  const MAX_PROMPT_LENGTH = 1500; // Venice API limit

  const handleSubmit = (e) => {
    e.preventDefault();
    if (promptText.trim() && !isLoading && promptText.length <= MAX_PROMPT_LENGTH) {
      onSendMessage(promptText);
      setPromptText('');
    }
  };



  return (
    <div>
      <form onSubmit={handleSubmit} className="flex items-center space-x-2 relative">
        <div className="relative flex-grow">
          <textarea
            ref={textareaRef}
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            placeholder="Describe the image you want to create..."
            className="w-full p-3 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-shadow duration-150 resize-none overflow-hidden min-h-[48px] max-h-[200px]"
            disabled={isLoading}
            rows="1"
          />
        </div>
        
        {/* Send Button */}
        <button
          type="submit"
          disabled={isLoading || !promptText.trim() || promptText.length > MAX_PROMPT_LENGTH}
          className={`p-3 rounded-lg text-white transition-colors duration-150 ease-in-out min-w-[48px]
                    ${isLoading || !promptText.trim() || promptText.length > MAX_PROMPT_LENGTH
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-purple-500 hover:bg-purple-600 focus:ring-2 focus:ring-purple-300'}`}
          title="Create Image"
        >
          {isLoading ? <Loader2 size={24} className="animate-spin" /> : <Send size={24} />}
        </button>
      </form>
      
      {/* Character count and help text */}
      <div className="mt-1 flex justify-between text-xs">
        <div className={`flex items-center ${
          promptText.length > MAX_PROMPT_LENGTH ? 'text-red-500 font-medium' : 
          promptText.length > MAX_PROMPT_LENGTH * 0.9 ? 'text-amber-500' : 
          'text-gray-500'
        }`}>
          {promptText.length > MAX_PROMPT_LENGTH && <AlertCircle size={14} className="mr-1" />}
          {promptText.length > 0 ? 
            `${promptText.length}/${MAX_PROMPT_LENGTH} characters` : 
            'Try to be specific with details (max 1500 characters)'}
        </div>
        <div className="text-right text-gray-500">Press Enter to create</div>
      </div>
    </div>
  );
}

export default PromptInput;
