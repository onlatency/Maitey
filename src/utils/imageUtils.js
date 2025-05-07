import { saveAs } from 'file-saver';

/**
 * Downloads the image from a URL or blob
 * @param {Blob|string} imageSource - The image blob or URL
 * @param {string} filename - The name to save the file as
 */
export const downloadImage = async (imageSource, filename = 'venice-image.png') => {
  try {
    // If imageSource is a URL, fetch it first
    if (typeof imageSource === 'string') {
      const response = await fetch(imageSource);
      if (!response.ok) throw new Error('Failed to fetch image for download');
      imageSource = await response.blob();
    }
    
    // Use FileSaver to save the blob
    saveAs(imageSource, filename);
    return true;
  } catch (error) {
    console.error('Error downloading image:', error);
    return false;
  }
};

/**
 * Converts a prompt to a suitable filename
 * @param {string} prompt - The prompt text
 * @returns {string} A sanitized filename
 */
export const promptToFilename = (prompt) => {
  // Shorten and sanitize the prompt for filename use
  const shortened = prompt.substring(0, 30).trim();
  const sanitized = shortened
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')     // Replace spaces with hyphens
    .toLowerCase();
    
  return `venice-${sanitized}-${Date.now()}.png`;
};

/**
 * Creates a shortened version of a prompt for display
 * @param {string} prompt - The original prompt
 * @param {number} maxLength - Maximum length before truncating
 * @returns {string} Shortened prompt
 */
export const shortenPrompt = (prompt, maxLength = 50) => {
  if (prompt.length <= maxLength) return prompt;
  return prompt.substring(0, maxLength) + '...';
};
