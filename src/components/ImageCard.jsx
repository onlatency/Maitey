import React, { useState } from 'react';
import { Download, Copy, RefreshCw, Maximize, Loader2, Check } from 'lucide-react';
import { useChatContext } from '../context/ChatContext';
import { saveAs } from 'file-saver';
import { generateImage } from '../api/veniceApi';

function ImageCard({ image, prompt, messageId, status, isLoading = false }) {
  const { updateImageMessage, settings } = useChatContext();
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isViewingFull, setIsViewingFull] = useState(false);

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
  const handleRegenerate = async () => {
    if (!prompt || isRegenerating) return;
    
    setIsRegenerating(true);
    try {
      // Use the same prompt but generate a new image
      const result = await generateImage(prompt, settings);
      
      if (result?.imageUrl) {
        // Instead of updating existing message, add as a new image
        const newImageMsg = {
          id: Date.now(),
          type: 'image',
          sender: 'user',
          text: prompt,
          timestamp: new Date().toISOString(),
          images: [{ url: result.imageUrl, timestamp: new Date().toISOString() }],
          status: 'complete'
        };
        
        // Add as a new message
        updateImageMessage(newImageMsg.id, newImageMsg);
      }
    } catch (error) {
      console.error('Error regenerating image:', error);
    } finally {
      setIsRegenerating(false);
    }
  };

  // Handle opening the full-size image view
  const handleViewFull = () => {
    setIsViewingFull(true);
  };

  // Close the full-size image view
  const handleCloseFullView = () => {
    setIsViewingFull(false);
  };

  // Loading or error state
  if (isLoading || !image?.url) {
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-purple-100 flex flex-col h-full">
        <div className="aspect-square bg-gray-100 flex items-center justify-center">
          {isLoading ? (
            <div className="flex flex-col items-center">
              <Loader2 size={48} className="text-purple-500 animate-spin" />
              <p className="mt-2 text-sm text-gray-500">Generating image...</p>
            </div>
          ) : (
            <div className="text-gray-400">Image failed to load</div>
          )}
        </div>
        <div className="p-3 bg-gray-50">
          <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-purple-100 flex flex-col h-full">
        {/* Image */}
        <div className="aspect-square relative group">
          <img 
            src={image.url} 
            alt={prompt || "Generated image"} 
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-200"></div>
        </div>
        
        {/* Prompt text area */}
        <div className="p-3 border-t border-purple-100">
          <div className="h-12 overflow-y-auto text-sm text-gray-700 mb-3 prompt-scrollbar">
            {prompt || "No prompt available"}
          </div>
          
          {/* Control buttons */}
          <div className="flex justify-between">
            {/* Download button */}
            <button
              onClick={handleDownload}
              className="p-2 text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
              title="Download image"
            >
              <Download size={20} />
            </button>
            
            {/* View full-size button */}
            <button
              onClick={handleViewFull}
              className="p-2 text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
              title="View full size"
            >
              <Maximize size={20} />
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
      
      {/* Full-size image modal */}
      {isViewingFull && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4" onClick={handleCloseFullView}>
          <div className="max-w-screen-xl max-h-screen-90 relative" onClick={(e) => e.stopPropagation()}>
            <img 
              src={image.url} 
              alt={prompt || "Generated image"} 
              className="max-w-full max-h-[90vh] object-contain rounded shadow-lg"
            />
            <button 
              className="absolute top-2 right-2 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70"
              onClick={handleCloseFullView}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default ImageCard;
