// This is a direct, synchronous mock generator that doesn't use any async/await
// to ensure it works reliably for demonstration purposes

// Fixed collection of sample images
const SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1579273166152-d725a4e2d755?q=80&w=1024',
  'https://images.unsplash.com/photo-1580118797218-aca3560b8b3c?q=80&w=1024',
  'https://images.unsplash.com/photo-1579273168832-1c6639363dad?q=80&w=1024',
  'https://images.unsplash.com/photo-1653379673670-e3257d356bf4?q=80&w=1024',
  'https://images.unsplash.com/photo-1597691313449-bf91d1bad13a?q=80&w=1024',
  'https://images.unsplash.com/photo-1653379398025-f2bc80b1cbc3?q=80&w=1024'
];

// Get a random image URL
export function getDirectMockImageUrl() {
  // Get a random index
  const randomIndex = Math.floor(Math.random() * SAMPLE_IMAGES.length);
  
  // Get the image URL with a unique timestamp to prevent caching
  const imageUrl = `${SAMPLE_IMAGES[randomIndex]}?t=${Date.now()}`;
  
  console.log('Direct mock generator returning image URL:', imageUrl);
  
  return imageUrl;
}

// Export the available models
export const MOCK_MODELS = [
  { value: 'venice-sd35', label: 'Stable Diffusion 3.5' },
  { value: 'lustify-sdxl', label: 'Lustify SDXL' },
  { value: 'venice-diffusion', label: 'Venice Diffusion' }
];

// Export the available styles
export const MOCK_STYLES = [
  'Photographic',
  'None',
  'Hyperrealism',
  'Enhance',
  'Analog Film',
  'Cinematic',
  'Texture',
  'Abstract'
];
