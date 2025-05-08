// API configuration - Using environment variables for secure key management

const VENICE_API_KEY = import.meta.env.VITE_VENICE_API_KEY || '';
const BASE_API_URL = 'https://api.venice.ai/api/v1';
const IMAGE_GENERATE_URL = `${BASE_API_URL}/image/generate`;
const MODELS_URL = `${BASE_API_URL}/models`;
const STYLES_URL = `${BASE_API_URL}/image/styles`;

// Use real API data
const USE_MOCK_DATA = false;

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
    console.log('Sending request to:', IMAGE_GENERATE_URL);
    console.log('With authentication:', `Bearer ${VENICE_API_KEY.substring(0, 5)}...`);
    console.log('Payload:', JSON.stringify(payload, null, 2));
    
    // Explicit validation of API key
    if (!VENICE_API_KEY || VENICE_API_KEY.length < 10) {
      console.error('Invalid API key:', VENICE_API_KEY);
      throw new Error('Invalid or missing API key. Check your .env file.');
    }
    
    // Set up timeout for fetch request - increased to allow more time for generation
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
      
      // Log full response information for debugging
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries([...response.headers.entries()]));
      
      // Handle HTTP errors immediately
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API error (${response.status}):`, errorText);
        throw new Error(`Venice API error: ${response.status} - ${errorText || 'Unknown error'}`);
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        console.error('Request timed out after 30 seconds');
        throw new Error('Request timed out. The server took too long to respond.');
      }
      console.error('Fetch error:', fetchError);
      throw new Error(`Network error: ${fetchError.message}`);
    }
    
    // We've already logged response status and headers and handled response errors above
    
    // According to the Venice API swagger, the response depends on return_binary setting
    if (payload.return_binary) {
      // For binary responses, we get the raw image data
      try {
        // Check content type to confirm we got an image
        const contentType = response.headers.get('content-type');
        console.log('Response content type:', contentType);
        
        if (!contentType || !contentType.includes('image/')) {
          // We didn't get an image, try to read as text for error
          const errorText = await response.text();
          console.error('Expected image but got:', errorText);
          throw new Error('API did not return an image. Received: ' + (contentType || 'unknown'));
        }
        
        // Process the image blob
        const imageBlob = await response.blob();
        
        if (!imageBlob || imageBlob.size === 0) {
          throw new Error('Received empty image data');
        }
        
        console.log('Successfully received image blob:', imageBlob.type, imageBlob.size, 'bytes');
        
        // Create a URL for the blob
        const imageUrl = URL.createObjectURL(imageBlob);
        
        // Return both the URL and blob
        return {
          imageUrl,
          imageBlob,
          success: true
        };
      } catch (blobError) {
        console.error('Error processing image blob:', blobError);
        throw new Error(`Failed to process image: ${blobError.message}`);
      }
    } else {
      // For non-binary responses, we expect JSON data
      try {
        const data = await response.json();
        console.log('Received JSON response:', data);
        // Handle JSON response data
        // For now, just return the data as is
        return data;
      } catch (jsonError) {
        console.error('Error parsing JSON response:', jsonError);
        throw new Error(`Failed to parse JSON response: ${jsonError.message}`);
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
