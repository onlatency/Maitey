import React, { useState, useRef, useEffect } from 'react';
import { Download, Copy, RefreshCw, Maximize, Loader2, Check, AlertCircle, Trash2, Clock, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useChatContext } from '../context/ChatContext';
import { saveAs } from 'file-saver';
import './Gallery.css';

function ImageCard({ image, prompt, messageId, status, isLoading = false, error = null }) {
  // Get all images from the active chat to enable navigation
  const { updateImageMessage, settings, addNewImage, getActiveChat, deleteMessage } = useChatContext();
  const activeChat = getActiveChat();
  
  // Extract all image messages from active chat for navigation
  const allImageMessages = activeChat?.messages?.filter(msg => {
    if (msg.type !== 'image') return false;
    if (msg.status === 'error') return false;
    if (msg.images?.length > 0 || msg.url) return true;
    return false;
  }) || [];
  
  // For navigation in full-size view - find current image index
  const currentImageIndex = messageId ? allImageMessages.findIndex(msg => msg.id === messageId) : -1;
  // States for this component
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isViewingFull, setIsViewingFull] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageSrc, setImageSrc] = useState(image?.url || null);
  const [fullViewImageSrc, setFullViewImageSrc] = useState(null); // Separate state for fullview image
  const [currentViewIndex, setCurrentViewIndex] = useState(0); // Track current position in fullview
  const [attempts, setAttempts] = useState(0);
  
  // Log props for debugging
  console.log('ImageCard props:', { image, prompt, messageId, status, isLoading });

  // Handle downloading the image
  const handleDownload = () => {
    if (!image?.url) return;
    
    // Extract a reasonable filename from the prompt or use a timestamp
    const promptWords = prompt?.split(' ').slice(0, 3).join('_').replace(/[^a-zA-Z0-9_]/g, '') || 'venice_image';
    const timestamp = new Date().toISOString().replace(/[-:.]/g, '').substring(0, 14);
    const filename = `${promptWords}_${timestamp}.png`;
    
    saveAs(image.url, filename);
  };

  // Handle copying the prompt to clipboard
  const handleCopyPrompt = () => {
    if (!prompt) return;
    
    navigator.clipboard.writeText(prompt)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  };

  // Handle regenerating the image
  const handleRegenerate = () => {
    if (!prompt || isRegenerating) return;
    
    setIsRegenerating(true);
    setImageError(false); // Reset the error state
    setAttempts(0); // Reset attempts counter
    console.log('Regenerating image with prompt:', prompt);
    
    // Use the real Venice API to generate a new image with the same prompt
    // This will trigger the appropriate chat context function to generate an image
    // The new image will be added to the chat via context
    try {
      // Simply regenerate with the same prompt using the context function
      // which will call the real API
      addNewImage(prompt);
      console.log('Requested new image generation with prompt:', prompt);
    } catch (error) {
      console.error('Error during regeneration:', error);
      setImageError(true);
    } finally {
      setTimeout(() => {
        setIsRegenerating(false);
      }, 1000); // Provide feedback while API processes the request
    }
  };

  // Handle opening the full-size image view
  const handleViewFull = () => {
    setIsViewingFull(true);
    setFullViewImageSrc(imageSrc); // Initialize fullview with the card's image
    setCurrentViewIndex(currentImageIndex); // Initialize with correct position
  };

  // Close the full-size image view
  const handleCloseFullView = () => {
    setIsViewingFull(false);
  };
  
  // Navigate to previous image in full-size view
  const handlePreviousImage = (e) => {
    e.stopPropagation();
    const newIndex = currentViewIndex - 1;
    if (newIndex < 0 || allImageMessages.length <= 1) return;
    
    const prevMessage = allImageMessages[newIndex];
    if (!prevMessage) return;
    
    // Get the image URL from the message
    const prevImageUrl = prevMessage.images?.[0]?.url || prevMessage.url;
    if (!prevImageUrl) return;
    
    // Update only the fullview image state
    setFullViewImageSrc(prevImageUrl);
    setCurrentViewIndex(newIndex);
  };
  
  // Navigate to next image in full-size view
  const handleNextImage = (e) => {
    e.stopPropagation();
    const newIndex = currentViewIndex + 1;
    if (newIndex >= allImageMessages.length) return;
    
    const nextMessage = allImageMessages[newIndex];
    if (!nextMessage) return;
    
    // Get the image URL from the message
    const nextImageUrl = nextMessage.images?.[0]?.url || nextMessage.url;
    if (!nextImageUrl) return;
    
    // Update only the fullview image state
    setFullViewImageSrc(nextImageUrl);
    setCurrentViewIndex(newIndex);
  };
  
  // Handle keyboard navigation
  useEffect(() => {
    if (!isViewingFull) return;
    
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleCloseFullView();
      } else if (e.key === 'ArrowLeft') {
        handlePreviousImage(e);
      } else if (e.key === 'ArrowRight') {
        handleNextImage(e);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isViewingFull, currentViewIndex, allImageMessages]);  // Updated dependencies
  
  // Delete the image
  const handleDeleteImage = (e) => {
    e.stopPropagation(); // Prevent triggering parent click handlers
    
    if (!messageId || !activeChat) return;
    
    // Confirm deletion
    if (window.confirm('Are you sure you want to remove this image?')) {
      console.log('Deleting image message with ID:', messageId);
      
      // Use the ChatContext's deleteMessage function
      deleteMessage(messageId);
    }
  };

  // Effect to handle image loading and fallback mechanisms
  useEffect(() => {
    // Skip if loading or no initial URL
    if (isLoading || !image?.url) return;
    
    // Reset state when image prop changes
    if (image?.url !== imageSrc) {
      setImageSrc(image.url);
      setImageError(false);
      setAttempts(0);
    }
  }, [image?.url, isLoading]);
  
  // Handle image loading errors
  const handleImageError = () => {
    console.error(`Image failed to load: ${imageSrc}`);
    
    // With the real API, we don't want to try multiple fallbacks
    // Instead, we'll just show an error state
    console.log('Image failed to load, showing error state');
    setImageError(true);
  };

  // Get error message if it exists
  const errorMessage = error || (status === 'error' ? 'Failed to generate image' : null);
  const isTimeout = errorMessage && (errorMessage.includes('timeout') || errorMessage.includes('aborted'));
  
  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-purple-100 flex flex-col h-full">
        <div className="aspect-square bg-gray-100 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <Loader2 size={48} className="text-purple-500 animate-spin" />
            <p className="mt-2 text-sm text-gray-500">Generating image...</p>
          </div>
        </div>
        <div className="p-3 bg-gray-50">
          {prompt ? (
            <div className="h-12 overflow-y-auto text-sm text-gray-700 mb-3 prompt-scrollbar">
              {prompt}
            </div>
          ) : (
            <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
          )}
        </div>
      </div>
    );
  }

  // Error state
  if (status === 'error' || imageError) {
    // Make sure to log the error details to debug
    console.log('Rendering error card for:', { messageId, status, error, imageError });
    
    const errorMsg = error || 'Failed to load image';
    const isTimeout = errorMsg.includes('timeout') || errorMsg.includes('too long');
    
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-rose-200 flex flex-col h-full">
        <div className="aspect-square bg-gray-100 flex items-center justify-center">
          <div className="text-center text-gray-600 p-4 flex flex-col items-center">
            {isTimeout ? (
              <>
                <Clock className="w-10 h-10 mb-2 text-amber-500" />
                <p className="font-medium">Request Timed Out</p>
                <p className="text-sm mt-1">The server took too long to respond.</p>
              </>
            ) : (
              <>
                <AlertCircle className="w-10 h-10 mb-2 text-red-500" />
                <p className="font-medium">Error Generating Image</p>
                <p className="text-sm mt-1">{errorMsg}</p>
              </>
            )}
          </div>
        </div>

        <div className="p-3 bg-white">
          <p className="text-gray-700 text-sm truncate mb-2">{prompt || 'Image generation error'}</p>
          
          <div className="flex justify-between items-center">
            <div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleRegenerate();
                }} 
                className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded mr-2"
              >
                Regenerate
              </button>
            </div>
            
            <div className="flex space-x-1">
              {/* Download button disabled for error state */}
              <button 
                className="text-gray-400 cursor-not-allowed p-1 rounded hover:bg-gray-100" 
                disabled
              >
                <Download size={16} />
              </button>
              
              <button 
                onClick={handleDeleteImage} 
                className="text-gray-500 p-1 rounded hover:bg-gray-100 hover:text-red-500"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-purple-100 flex flex-col h-full">
        {/* Image - now clickable */}
        <div 
          className="aspect-square relative group cursor-pointer" 
          onClick={handleViewFull}
        >
          <img 
            src={imageSrc} 
            alt={prompt || "Generated image"} 
            className="w-full h-full object-cover"
            loading="lazy"
            onError={handleImageError}
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-200"></div>
          {/* Overlay hint */}
          <div className="absolute inset-0 hidden group-hover:flex items-center justify-center">
            <div className="bg-black bg-opacity-50 text-white px-4 py-2 rounded-md text-sm shadow-lg">
              Click to enlarge
            </div>
          </div>
        </div>
        
        {/* Prompt text area */}
        <div className="p-3 border-t border-purple-100">
          <div className="h-12 overflow-y-auto text-sm text-gray-700 mb-3 prompt-scrollbar">
            {prompt || "No prompt available"}
          </div>
          
          {/* Control buttons */}
          <div className="flex justify-between">
            {/* Download button - disabled for error states */}
            <button
              onClick={handleDownload}
              className={`p-2 rounded-md transition-colors ${status === 'error' ? 'text-gray-400 cursor-not-allowed' : 'text-purple-600 hover:bg-purple-50'}`}
              title={status === 'error' ? 'Download unavailable' : 'Download image'}
              disabled={status === 'error'}
            >
              <Download size={20} />
            </button>
            
            {/* Delete button */}
            <button
              onClick={handleDeleteImage}
              className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
              title="Delete image"
            >
              <Trash2 size={20} />
            </button>
            
            {/* Regenerate button */}
            <button
              onClick={handleRegenerate}
              className={`p-2 rounded-md transition-colors ${
                isRegenerating ? 'text-purple-400' : 'text-purple-600 hover:bg-purple-50'
              }`}
              disabled={isRegenerating}
              title="Regenerate with same prompt"
            >
              {isRegenerating ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <RefreshCw size={20} />
              )}
            </button>
            
            {/* Copy prompt button */}
            <button
              onClick={handleCopyPrompt}
              className="p-2 text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
              title="Copy prompt"
            >
              {isCopied ? <Check size={20} /> : <Copy size={20} />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Full-size image modal with navigation */}
      {isViewingFull && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4" onClick={handleCloseFullView}>
          <div className="max-w-screen-xl max-h-screen-90 relative w-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            {/* Previous button */}
            {currentViewIndex > 0 && (
              <button 
                className="absolute left-4 md:left-8 z-20 text-white bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full p-3 transition-all duration-150 ease-in-out transform hover:scale-110"
                onClick={handlePreviousImage}
                aria-label="Previous image"
              >
                <ChevronLeft size={32} />
              </button>
            )}
            
            <img 
              src={fullViewImageSrc || imageSrc} 
              alt={prompt || "Generated image"} 
              className="max-w-full max-h-[90vh] object-contain rounded shadow-lg"
            />
            
            {/* Next button */}
            {currentViewIndex < allImageMessages.length - 1 && (
              <button 
                className="absolute right-4 md:right-8 z-20 text-white bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full p-3 transition-all duration-150 ease-in-out transform hover:scale-110"
                onClick={handleNextImage}
                aria-label="Next image"
              >
                <ChevronRight size={32} />
              </button>
            )}
            
            {/* Close button */}
            <button 
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70 transition-all"
              onClick={handleCloseFullView}
              aria-label="Close fullscreen view"
            >
              <X size={24} />
            </button>
            
            {/* Image navigation info */}
            <div className="absolute bottom-6 left-0 right-0 text-center text-white">
              {currentViewIndex !== -1 && (
                <span className="px-4 py-2 bg-black bg-opacity-60 rounded-md text-lg font-medium">
                  {currentViewIndex + 1} / {allImageMessages.length}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ImageCard;
