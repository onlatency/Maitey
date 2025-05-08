// API configuration - Using environment variables for secure key management

const VENICE_API_KEY = import.meta.env.VITE_VENICE_API_KEY || '';
const BASE_API_URL = 'https://api.venice.ai/api/v1';
const IMAGE_GENERATE_URL = `${BASE_API_URL}/image/generate`;
const MODELS_URL = `${BASE_API_URL}/models`;
const STYLES_URL = `${BASE_API_URL}/image/styles`;

// Use real API data
const USE_MOCK_DATA = true; // Temporarily set to true to ensure all models are shown

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
    // Validate API key first before attempting any request
    if (!VENICE_API_KEY || VENICE_API_KEY.length < 10) {
      throw new Error('Invalid or missing API key. Check your .env file.');
    }
    
    // Set up timeout for fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000); // 45 second timeout
    
    console.log('API Payload:', payload);
    
    // Execute the fetch request with timeout handling
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
      
      clearTimeout(timeoutId); // Clear timeout as request completed
      
      // Handle HTTP errors
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Venice API error: ${response.status} - ${errorText || 'Unknown error'}`);
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      // Enhanced error handling with specific error types
      if (fetchError.name === 'AbortError') {
        throw new Error('Request timed out after 45 seconds. The server took too long to respond.');
      } else if (fetchError.message.includes('Failed to fetch') || fetchError.message.includes('Network')) {
        throw new Error(`Network connection error: ${fetchError.message}. Check your internet connection.`);
      } else {
        throw new Error(`API request failed: ${fetchError.message}`);
      }
    }
    
    // Process the response based on requested format (binary or JSON)
    if (payload.return_binary) {
      // For binary responses, verify and process image data
      const contentType = response.headers.get('content-type');
      
      if (!contentType || !contentType.includes('image/')) {
        const errorText = await response.text();
        throw new Error(`API did not return an image. Received: ${contentType || 'unknown content type'}`);
      }
      
      // Process the image blob
      const imageBlob = await response.blob();
      
      if (!imageBlob || imageBlob.size === 0) {
        throw new Error('API returned empty image data');
      }
      
      // Create a URL for the blob and return result
      const imageUrl = URL.createObjectURL(imageBlob);
      console.log('Successfully received image data');
      
      return {
        imageUrl,
        imageBlob,
        success: true
      };
    } else {
      // For non-binary responses, process JSON data
      try {
        const data = await response.json();
        return data;
      } catch (jsonError) {
        throw new Error(`Invalid JSON response from API: ${jsonError.message}`);
      }
    }
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
  
  // Define the fixed model mappings as specified - these will ALWAYS be returned
  const fixedModels = [
    { value: 'venice-sd35', label: 'Stable Diffusion 3.5', shortName: 'SD35' },
    { value: 'flux-dev', label: 'FLUX Standard', shortName: 'FLUX DEV' },
    { value: 'flux-dev-uncensored', label: 'FLUX Custom', shortName: 'FLUX MOD' },
    { value: 'lustify-sdxl', label: 'LSDXL', shortName: 'LSDXL' },
    { value: 'pony-realism', label: 'Pony Realism', shortName: 'PonyR' }
  ];
  
  // Log the exact models we'll be returning to verify in the console
  console.log('Returning fixed models:', fixedModels);
  
  // Always return our fixed model list - this ensures we always show exactly 5 models with the correct names
  return fixedModels;
  
  // API fetch code is commented out since we're always returning the fixed models
  // If you want to add back API model fetching functionality later, uncomment the code below
  /*
  try {
    const response = await fetch(`${MODELS_URL}?type=image`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${VENICE_API_KEY}`
      }
    });

    console.log('Models API response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.status}`);
    }

    const data = await response.json();
    console.log('Fetched models raw data:', data);
    
    // Using our fixed models regardless of API response
    return fixedModels;
  } catch (error) {
    console.error('Error fetching image models:', error);
    return fixedModels;
  }
  */
}

/**
 * Fetch available image style presets from Venice API
 */
export async function fetchImageStyles() {
  console.log('Fetching image styles from Venice API');
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
