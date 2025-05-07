// API configuration - Using environment variables for secure key management
const VENICE_API_KEY = import.meta.env.VITE_VENICE_API_KEY || '';
const API_URL = 'https://api.venice.ai/api/v1/image/generate';

// Validation to ensure API key is available
if (!VENICE_API_KEY) {
  console.error('Venice API Key not found! Make sure to set VITE_VENICE_API_KEY in your .env file');
}

export async function generateImage(prompt, options = {}) {
  const payload = {
    model: options.model || 'venice-sd35', // Defaulting to venice-sd35 as seen in screenshot, or lustify-sdxl from curl
    prompt: prompt,
    width: options.width || 1024,
    height: options.height || 1024,
    steps: options.steps || 30,
    safe_mode: options.safeMode === undefined ? false : options.safeMode, // API default is false
    hide_watermark: options.hideWatermark === undefined ? true : options.hideWatermark, // API default is false
    cfg_scale: options.cfgScale || 7.0,
    style_preset: options.stylePreset || 'Photographic', // As per PRD and curl
    negative_prompt: options.negativePrompt || 'blurry, low quality, bad anatomy, worst quality, deformed, ugly, text, watermark, signature', // Enhanced negative prompt
    return_binary: true, // Crucial for getting image blob
    ...options.seed && { seed: options.seed } // Optional seed
  };

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${VENICE_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json(); // Try to parse error response as JSON
      } catch (e) {
        errorData = await response.text(); // Fallback to text if JSON parsing fails
      }
      console.error('Venice API Error:', errorData);
      throw new Error(`API request failed with status ${response.status}: ${JSON.stringify(errorData)}`);
    }

    // return_binary: true means the response body is the image blob directly
    const imageBlob = await response.blob();
    return imageBlob;

  } catch (error) {
    console.error('Error generating image via Venice API:', error);
    throw error; // Re-throw to be caught by the caller
  }
}
