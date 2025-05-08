// A separate, more reliable mock image generator for demonstration purposes

// Sample images for different styles
const imagesByStyle = {
  "Photographic": [
    "https://images.unsplash.com/photo-1579273166152-d725a4e2d755?q=80&w=1024",
    "https://images.unsplash.com/photo-1580118797218-aca3560b8b3c?q=80&w=1024"
  ],
  "None": [
    "https://images.unsplash.com/photo-1579273168832-1c6639363dad?q=80&w=1024",
    "https://images.unsplash.com/photo-1653379673670-e3257d356bf4?q=80&w=1024"
  ],
  "Hyperrealism": [
    "https://images.unsplash.com/photo-1597691313449-bf91d1bad13a?q=80&w=1024",
    "https://images.unsplash.com/photo-1580118834580-49bf17f40a2e?q=80&w=1024"
  ],
  "Enhance": [
    "https://images.unsplash.com/photo-1578593139771-28f5f893a507?q=80&w=1024",
    "https://images.unsplash.com/photo-1580118885462-c9b2c2a805fa?q=80&w=1024"
  ],
  "Analog Film": [
    "https://images.unsplash.com/photo-1579273166031-ad9b7a3f8b68?q=80&w=1024",
    "https://images.unsplash.com/photo-1653379398025-f2bc80b1cbc3?q=80&w=1024"
  ],
  "Cinematic": [
    "https://images.unsplash.com/photo-1545167496-c1e092d383a2?q=80&w=1024",
    "https://images.unsplash.com/photo-1482376297902-a54c222cec2b?q=80&w=1024"
  ],
  "fallback": [
    "https://images.unsplash.com/photo-1524721696987-b9527df9e512?q=80&w=1024",
    "https://images.unsplash.com/photo-1579702493440-8b1b56d47e03?q=80&w=1024"
  ]
};

// Generate a mock image based on style and dimensions
export const generateMockImage = (style = "Photographic", width = 1024, height = 1024) => {
  console.log(`Generating mock image with style: ${style}, dimensions: ${width}x${height}`);
  
  // Get the appropriate image array based on style
  const images = imagesByStyle[style] || imagesByStyle.fallback;
  
  // Select a random image from the array
  const randomIndex = Math.floor(Math.random() * images.length);
  const baseUrl = images[randomIndex];
  
  // Add a random query parameter to prevent caching
  const timestamp = Date.now();
  const uniqueUrl = `${baseUrl}&t=${timestamp}`;
  
  console.log(`Mock image URL: ${uniqueUrl}`);
  
  return uniqueUrl;
};

// Simulate API delay
export const mockDelay = (ms = 800) => new Promise(resolve => setTimeout(resolve, ms));

// Mock the entire image generation process
export const mockGenerateImage = async (prompt, options = {}) => {
  console.log(`Mock generating image with prompt: "${prompt}" and options:`, options);
  
  try {
    // Simulate API delay
    await mockDelay();
    
    // Generate a mock image URL
    const imageUrl = generateMockImage(
      options.stylePreset || "Photographic",
      options.width || 1024,
      options.height || 1024
    );
    
    // Return a successful response
    return {
      success: true,
      imageUrl,
      prompt,
      settings: options
    };
  } catch (error) {
    console.error("Error in mock image generation:", error);
    
    // Even if there's an error, still return a fallback image
    return {
      success: true,
      imageUrl: imagesByStyle.fallback[0] + `?t=${Date.now()}`,
      prompt,
      error: "Recovered from error with fallback image"
    };
  }
};
