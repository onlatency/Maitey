import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Download, ExternalLink } from 'lucide-react';
import { downloadImage, promptToFilename } from '../utils/imageUtils';
import toast from 'react-hot-toast';

function ImageCarousel({ images, promptText }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // If there are no images, show nothing
  if (!images || images.length === 0) {
    return null;
  }

  const currentImage = images[currentIndex];
  
  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : images.length - 1));
  };
  
  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex < images.length - 1 ? prevIndex + 1 : 0));
  };
  
  // Handle image download
  const handleDownload = async () => {
    if (!currentImage.url) return;
    
    // Create filename from prompt
    let filename = 'venice-image.png';
    if (promptText) {
      filename = promptToFilename(promptText);
    }
    
    const success = await downloadImage(currentImage.url, filename);
    if (success) {
      toast.success('Image downloaded successfully');
    } else {
      toast.error('Failed to download image');
    }
  };

  return (
    <div className="relative w-full max-w-md">
      {/* Image container */}
      <div className="relative">
        <img 
          src={currentImage.url} 
          alt={`Generated image ${currentIndex + 1} of ${images.length}`}
          className="rounded-lg max-w-full max-h-96 object-contain cursor-zoom-in mx-auto"
          onClick={() => window.open(currentImage.url, '_blank')}
        />
        
        {/* Navigation buttons (only show if multiple images) */}
        {images.length > 1 && (
          <>
            <button 
              onClick={handlePrevious} 
              className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-40 hover:bg-opacity-60 rounded-full p-1 text-white z-10"
              aria-label="Previous image"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={handleNext} 
              className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-40 hover:bg-opacity-60 rounded-full p-1 text-white z-10"
              aria-label="Next image"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>
      
      {/* Image counter and action buttons */}
      <div className="mt-2 flex justify-between items-center">
        {images.length > 1 ? (
          <div className="text-xs text-gray-500">
            Image {currentIndex + 1} of {images.length}
          </div>
        ) : (
          <div className="text-xs text-gray-500">Generated image</div>
        )}
        
        <div className="flex gap-2">
          <button 
            onClick={handleDownload} 
            className="text-xs flex items-center gap-1 px-2 py-1 bg-gray-300 hover:bg-gray-400 rounded-md transition-colors"
            title="Download Image"
          >
            <Download size={14} />
            Download
          </button>
          <button 
            onClick={() => window.open(currentImage.url, '_blank')} 
            className="text-xs flex items-center gap-1 px-2 py-1 bg-gray-300 hover:bg-gray-400 rounded-md transition-colors"
            title="Open in New Tab"
          >
            <ExternalLink size={14} />
            Open
          </button>
        </div>
      </div>
      
      {/* Dot indicators for multiple images */}
      {images.length > 1 && (
        <div className="flex justify-center mt-2 gap-1">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-blue-500' : 'bg-gray-300'
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ImageCarousel;
