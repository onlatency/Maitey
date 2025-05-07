import { saveAs } from 'file-saver';

/**
 * Download an image from a URL or blob
 * @param {string|Blob} imageSource - URL or Blob of the image
 * @param {string} filename - Optional filename for the downloaded image
 */
export const downloadImage = async (imageSource, filename = 'maitey-image.png') => {
  try {
    if (typeof imageSource === 'string') {
      // If it's a URL, fetch it first
      const response = await fetch(imageSource);
      const blob = await response.blob();
      saveAs(blob, filename);
    } else if (imageSource instanceof Blob) {
      // If it's already a blob
      saveAs(imageSource, filename);
    } else {
      throw new Error('Invalid image source');
    }
  } catch (error) {
    console.error('Error downloading image:', error);
    throw error;
  }
};

/**
 * Generate a filename based on the prompt text
 * @param {string} promptText - The prompt text used to generate the image
 * @returns {string} A sanitized filename
 */
export const generateFilenameFromPrompt = (promptText) => {
  if (!promptText) return `maitey-image-${Date.now()}.png`;
  
  // Take the first few words from the prompt
  const words = promptText.split(' ').slice(0, 3).join('-');
  
  // Sanitize the filename
  const sanitized = words.toLowerCase()
    .replace(/[^a-z0-9-]/g, '-') // Replace non-alphanumeric chars with hyphens
    .replace(/-+/g, '-')         // Replace multiple hyphens with a single one
    .replace(/^-|-$/g, '');      // Remove leading/trailing hyphens
  
  return `maitey-${sanitized}-${Date.now()}.png`;
};

/**
 * Shorten a prompt text to a specified length
 * @param {string} promptText - The prompt text to shorten
 * @param {number} maxLength - The maximum length of the shortened text
 * @returns {string} The shortened text
 */
export const shortenPrompt = (promptText, maxLength = 50) => {
  if (!promptText) return '';
  if (promptText.length <= maxLength) return promptText;
  
  return promptText.substring(0, maxLength - 3) + '...';
};
