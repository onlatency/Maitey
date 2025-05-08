// API configuration - Using environment variables for secure key management
import { mockGenerateImage, mockDelay } from './mockImageGenerator';

const VENICE_API_KEY = import.meta.env.VITE_VENICE_API_KEY || '';
const BASE_API_URL = 'https://api.venice.ai/api/v1';
const IMAGE_GENERATE_URL = `${BASE_API_URL}/image/generate`;
const MODELS_URL = `${BASE_API_URL}/models`;
const STYLES_URL = `${BASE_API_URL}/image/styles`;

// Since we don't have a valid API key in this demonstration, always use mock data
const USE_MOCK_DATA = true;

// Validation to ensure API key is available
if (!VENICE_API_KEY) {
  console.error('Venice API Key not found! Make sure to set VITE_VENICE_API_KEY in your .env file');
  // Alert in production to make the error visible to users
  if (import.meta.env.PROD) {
    alert('API key not found. Please check the browser console for more details.');
  }
}

export async function generateImage(prompt, options = {}) {
  // Log the options received to debug
  console.log('Generate Image called with options:', options);
  
  // For demonstration purposes, always use mock data
  if (USE_MOCK_DATA) {
    console.log('Using reliable mock image generator');
    
    try {
      // Use our improved mock generator
      const result = await mockGenerateImage(prompt, options);
      
      // Return in the format expected by our components
      return {
        imageUrl: result.imageUrl,
        settings: options,
        prompt: prompt
      };
    } catch (error) {
      console.error('Error in mock image generation:', error);
      throw new Error('Failed to generate mock image');
    }
  }
  
  // Ensure numeric parameters are properly converted
  const ensureNumber = (value, defaultValue) => {
    if (value === undefined || value === null) return defaultValue;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
  };

  const ensureFloat = (value, defaultValue) => {
    if (value === undefined || value === null) return defaultValue;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  };

  // Restructure payload to exactly match the working curl example with correct types
  const payload = {
    model: options.model || 'venice-sd35', // Default to match ChatContext default
    prompt: prompt,
    width: ensureNumber(options.width, 1024),
    height: ensureNumber(options.height, 1024),
    steps: ensureNumber(options.steps, 30),
    safe_mode: true, // Always set safe_mode to true
    hide_watermark: true, // Always set hide_watermark to true
    cfg_scale: ensureFloat(options.cfgScale, 7.0),
    style_preset: options.stylePreset || 'Photographic',
    negative_prompt: options.negativePrompt || 'blurry, low quality, bad anatomy, worst quality, deformed, ugly, text, watermark, signature',
    return_binary: true,
    ...options.seed && { seed: ensureNumber(options.seed, Math.floor(Math.random() * 1000000)) } // Optional seed
  };
  
  // Log the final payload
  console.log('API Payload:', payload);

  try {
    console.log('Sending request to:', IMAGE_GENERATE_URL);
    console.log('With authentication:', `Bearer ${VENICE_API_KEY.substring(0, 5)}...`);
    
    // Set up timeout for fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    let response;
    try {
      response = await fetch(IMAGE_GENERATE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${VENICE_API_KEY}`
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      
      // Clear the timeout as the request completed
      clearTimeout(timeoutId);
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        console.error('Request timed out after 30 seconds');
        throw new Error('Request timed out. Please try again later.');
      }
      throw fetchError;
    }
    
    console.log('Response status:', response.status);
    console.log('Response headers:', [...response.headers.entries()]);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json(); // Try to parse error response as JSON
      } catch (e) {
        try {
          errorData = await response.text(); // Fallback to text if JSON parsing fails
        } catch (textError) {
          errorData = 'Could not read error response';
        }
      }
      console.error('Venice API Error:', errorData);
      console.error('Response status:', response.status);
      console.error('Request payload:', payload);
      throw new Error(`API request failed with status ${response.status}: ${typeof errorData === 'object' ? JSON.stringify(errorData) : errorData}`);
    }

    // return_binary: true means the response body is the image blob directly
    const imageBlob = await response.blob();
    
    // Create a URL for the blob
    const imageUrl = URL.createObjectURL(imageBlob);
    
    // Return an object with the imageUrl and the blob
    return {
      imageUrl,
      imageBlob
    };

  } catch (error) {
    console.error('Error generating image via Venice API:', error);
    throw error; // Re-throw to be caught by the caller
  }
}

/**
 * Fetch available image generation models from Venice API
 */
export async function fetchImageModels() {
  console.log('Fetching image models from Venice API');
  
  // Always return mock models for the demo
  if (USE_MOCK_DATA) {
    await mockDelay(300);
    
    return [
      { value: 'venice-sd35', label: 'Stable Diffusion 3.5' },
      { value: 'lustify-sdxl', label: 'Lustify SDXL' },
      { value: 'venice-diffusion', label: 'Venice Diffusion' }
    ];
  }
  
  try {
    // Using GET request instead of POST for models endpoint
    const response = await fetch(`${MODELS_URL}?type=image`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${VENICE_API_KEY}`
      }
      // No body needed for GET request
    });

    console.log('Models API response status:', response.status);
    
    if (!response.ok) {
      let errorText = await response.text();
      console.error('Failed to fetch models:', response.status, errorText);
      throw new Error(`Failed to fetch models: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Fetched models raw data:', data);
    
    // Format the models based on the exact response structure provided
    let formattedModels = [];
    
    // More comprehensive handling of various possible response formats
    if (data.data && Array.isArray(data.data)) {
      // Primary expected format from Venice API
      formattedModels = data.data.map(model => ({
        value: model.id || model.model_id || model.name,
        label: (model.display_name || model.name || model.id || '').replace(/-/g, ' ')
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')
      }));
    } else if (data.models && Array.isArray(data.models)) {
      // Alternative format that might be returned
      formattedModels = data.models.map(model => ({
        value: model.id || model.model_id || model.name,
        label: (model.display_name || model.name || model.id || '').replace(/-/g, ' ')
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')
      }));
    } else if (Array.isArray(data)) {
      // Direct array format
      formattedModels = data.map(model => {
        // Handle if model is just a string
        if (typeof model === 'string') {
          return {
            value: model,
            label: model.replace(/-/g, ' ')
              .split(' ')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ')
          };
        }
        // Handle if model is an object
        return {
          value: model.id || model.model_id || model.name,
          label: (model.display_name || model.name || model.id || '').replace(/-/g, ' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
        };
      });
    }
    
    // Log parsed models list
    console.log('Parsed models from API response:', formattedModels);
    
    console.log('Formatted models:', formattedModels);
    
    // If no models were found, provide fallback defaults
    if (formattedModels.length === 0) {
      formattedModels = [
        { value: 'venice-sd35', label: 'Venice SD 3.5' },
        { value: 'lustify-sdxl', label: 'Lustify SDXL' },
      ];
      console.log('Using fallback models:', formattedModels);
    }
    
    return formattedModels;
  } catch (error) {
    console.error('Error fetching image models:', error);
    // Return fallback models on error
    const fallbackModels = [
      { value: 'venice-sd35', label: 'Venice SD 3.5' },
      { value: 'lustify-sdxl', label: 'Lustify SDXL' },
    ];
    console.log('Using fallback models due to error:', fallbackModels);
    return fallbackModels;
  }
}

/**
 * Fetch available image styles from Venice API
 */
export async function fetchImageStyles() {
  console.log('Fetching image styles from Venice API');
  
  // Always return mock styles for the demo
  if (USE_MOCK_DATA) {
    await mockDelay(300);
    
    return [
      'Photographic',
      'None',
      'Hyperrealism',
      'Enhance',
      'Analog Film',
      'Cinematic',
      'Texture',
      'Abstract'
    ];
  }
  console.log('API Key available:', VENICE_API_KEY ? 'Yes' : 'No');
  
  try {
    const response = await fetch(STYLES_URL, {
      method: 'GET', // Using GET as shown in the curl command
      headers: {
        'Authorization': `Bearer ${VENICE_API_KEY}`
      }
    });

    console.log('Styles API response status:', response.status);
    
    if (!response.ok) {
      let errorText = await response.text();
      console.error('Failed to fetch styles:', response.status, errorText);
      throw new Error(`Failed to fetch styles: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Fetched styles raw data:', data);
    
    // Handle the exact response format shown in the sample
    let formattedStyles = [];
    
    if (data.data && Array.isArray(data.data)) {
      // Extract styles from the data array as shown in the sample response
      formattedStyles = data.data;
    } else if (data.styles && Array.isArray(data.styles)) {
      // Fallback for other possible formats
      formattedStyles = data.styles;
    } else if (Array.isArray(data)) {
      // Another fallback
      formattedStyles = data.map(style => 
        typeof style === 'string' ? style : style.name || style.id
      );
    }
    
    console.log('Formatted styles:', formattedStyles);
    
    // If no styles were found, provide fallback defaults
    if (formattedStyles.length === 0) {
      formattedStyles = [
        'Photographic', 'Digital Art', 'Cinematic', 'Anime', 
        'Fantasy Art', 'Neon Punk', 'Retro', 'Abstract', 'Realistic'
      ];
      console.log('Using fallback styles:', formattedStyles);
    }
    
    return formattedStyles;
  } catch (error) {
    console.error('Error fetching image styles:', error);
    // Return fallback styles on error
    const fallbackStyles = [
      'Photographic', 'Digital Art', 'Cinematic', 'Anime', 
      'Fantasy Art', 'Neon Punk', 'Retro', 'Abstract', 'Realistic'
    ];
    console.log('Using fallback styles due to error:', fallbackStyles);
    return fallbackStyles;
  }
}
