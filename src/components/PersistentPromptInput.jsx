import React, { useState, useRef, useEffect } from 'react';
import { Send, Lightbulb, Loader2, AlertCircle } from 'lucide-react';
import { useChatContext } from '../context/ChatContext';

function PersistentPromptInput() {
  const { 
    addMessage, 
    updateImageMessage, 
    addNewImage, // Add the new function
    settings, 
    setError 
  } = useChatContext();
  
  // Use local loading state for the button instead of global loading state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [promptText, setPromptText] = useState('');
  const textareaRef = useRef(null);
  
  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      // Reset height to auto to get the correct scrollHeight
      textareaRef.current.style.height = 'auto';
      // Set the height to scrollHeight to expand the textarea
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [promptText]);
  
  const MAX_PROMPT_LENGTH = 1500; // Venice API limit
  
  const generateNewImage = async () => {
    if (!promptText.trim() || promptText.length > MAX_PROMPT_LENGTH) return;
    
    console.log('Starting image generation with prompt:', promptText);
    
    // Set local submitting state to true to disable only this button
    setIsSubmitting(true);
    
    try {
      // Use the real Venice API via the context function
      // The addNewImage function now handles all the API interaction
      // Don't await - we want to fire and forget, so the button becomes active again
      addNewImage(promptText)
        .catch(error => {
          console.error('Error in image generation:', error);
          setError('Failed to generate image: ' + error.message);
        })
        .finally(() => {
          // Always reset the submitting state after a brief delay
          setTimeout(() => {
            setIsSubmitting(false);
          }, 1000); // Brief delay for feedback
        });
      
      // Clear input immediately after request is sent
      setPromptText('');
      
      console.log('Image generation request submitted');
    } catch (error) {
      console.error('Error requesting image generation:', error);
      setError('Failed to start image generation');
      setIsSubmitting(false);
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    generateNewImage();
  };
  
  const handleEnhancePrompt = () => {
    // This will be implemented in the future for AI text enhancement
    alert('Coming soon: AI-powered prompt enhancement to help you create better prompts!');
  };
  
  return (
    <div className="w-full border-t border-purple-100 bg-white p-4">
      <form onSubmit={handleSubmit} className="flex items-start space-x-2">
        <div className="relative flex-grow">
          <textarea
            ref={textareaRef}
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            placeholder="Describe the image you want to create..."
            className="w-full p-3 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-shadow duration-150 resize-none overflow-hidden min-h-[48px] max-h-[120px]"
            disabled={isSubmitting}
            rows="1"
          />
          
          {/* Character count */}
          <div className={`absolute bottom-2 right-3 text-xs ${
            promptText.length > MAX_PROMPT_LENGTH ? 'text-red-500 font-medium' : 
            promptText.length > MAX_PROMPT_LENGTH * 0.9 ? 'text-amber-500' : 
            'text-gray-500'
          }`}>
            {promptText.length > 0 && `${promptText.length}/${MAX_PROMPT_LENGTH}`}
          </div>
        </div>
        
        <div className="flex flex-col space-y-2">
          {/* Generate Button */}
          <button
            type="submit"
            disabled={isSubmitting || !promptText.trim() || promptText.length > MAX_PROMPT_LENGTH}
            className={`p-3 rounded-lg text-white transition-colors duration-150 ease-in-out ${
              isSubmitting || !promptText.trim() || promptText.length > MAX_PROMPT_LENGTH
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-purple-500 hover:bg-purple-600 focus:ring-2 focus:ring-purple-300'
            }`}
            title="Generate Image"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={24} /> : <Send size={24} />}
          </button>
          
          {/* Enhance Prompt Button (Lightbulb) */}
          <button
            type="button"
            onClick={handleEnhancePrompt}
            className="p-3 rounded-lg bg-purple-100 text-purple-600 hover:bg-purple-200 transition-colors duration-150 ease-in-out"
            title="Enhance Prompt (Coming Soon)"
          >
            <Lightbulb size={24} />
          </button>
        </div>
      </form>
      
      {promptText.length > MAX_PROMPT_LENGTH && (
        <div className="mt-1 flex items-center text-xs text-red-500">
          <AlertCircle size={14} className="mr-1" />
          Prompt exceeds maximum length of {MAX_PROMPT_LENGTH} characters
        </div>
      )}
    </div>
  );
}

export default PersistentPromptInput;
