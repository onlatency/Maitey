import React from 'react';
import { User, Bot, Image as ImageIcon, AlertTriangle, Loader2, RefreshCw } from 'lucide-react'; // Icons
import ImageCarousel from './ImageCarousel';

function MessageBubble({ message, onRegenerateImage }) {
  const isUser = message.type === 'prompt';

  // Base styling for all bubbles
  const bubbleBaseStyle = "max-w-xl p-3 rounded-xl shadow";
  const userBubbleStyle = `ml-auto bg-blue-500 text-white ${bubbleBaseStyle}`;
  const botBubbleStyle = `mr-auto bg-gray-200 text-gray-800 ${bubbleBaseStyle}`;
  const errorBubbleStyle = `mr-auto bg-red-100 text-red-700 ${bubbleBaseStyle}`;

  const iconBaseStyle = "mr-2 flex-shrink-0";

  // Handle regenerate image request
  const handleRegenerate = () => {
    if (typeof onRegenerateImage === 'function' && message.promptText) {
      onRegenerateImage(message.promptText, message.id);
    }
  };

  if (message.isLoading) {
    return (
      <div className={`flex items-start ${botBubbleStyle} animate-pulse`}>
        <Loader2 size={24} className={`${iconBaseStyle} animate-spin text-gray-500`} />
        <p>Generating image...</p>
      </div>
    );
  }
  
  if (message.isError) {
    return (
      <div className={`flex items-start ${errorBubbleStyle}`}>
        <AlertTriangle size={24} className={`${iconBaseStyle} text-red-500`} />
        <div className="flex flex-col w-full">
          <p className="mb-2">{message.text || 'An error occurred while generating the image.'}</p>
          {message.promptText && (
            <button 
              onClick={handleRegenerate} 
              className="self-start text-sm bg-red-200 hover:bg-red-300 text-red-800 px-2 py-1 rounded-md flex items-center gap-1 transition-colors"
            >
              <RefreshCw size={14} />
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  if (isUser) {
    return (
      <div className={`flex items-start justify-end`}>
         <div className={userBubbleStyle}>
          <p className="text-sm">{message.text}</p>
        </div>
        <User size={24} className={`ml-2 flex-shrink-0 text-blue-500 mt-1`} />
      </div>
    );
  } else { // Bot message (image)
    return (
      <div className={`flex items-start`}>
        <Bot size={24} className={`${iconBaseStyle} text-gray-600 mt-1`} />
        <div className={`${botBubbleStyle} flex flex-col`}>
          {message.url ? (
            <>
              {/* Use ImageCarousel for displaying images */}
              <ImageCarousel 
                images={message.images || [{ url: message.url }]} 
                promptText={message.promptText} 
              />
              
              {/* Regenerate button outside of the carousel */}
              <div className="flex mt-2 justify-end">
                <button 
                  onClick={handleRegenerate} 
                  className="text-xs flex items-center gap-1 px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md transition-colors"
                  title="Generate Another Variation"
                >
                  <RefreshCw size={14} />
                  Generate New Variation
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center text-gray-500">
              <ImageIcon size={20} className="mr-2" />
              <span>Image not available</span>
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default MessageBubble;
