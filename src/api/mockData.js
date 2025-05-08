// Sample placeholder images for demonstration purposes
export const sampleImages = [
  'https://images.unsplash.com/photo-1579273168832-1c6639363dad?q=80&w=1024',
  'https://images.unsplash.com/photo-1653379673670-e3257d356bf4?q=80&w=1024',
  'https://images.unsplash.com/photo-1579273166152-d725a4e2d755?q=80&w=1024',
  'https://images.unsplash.com/photo-1580118797218-aca3560b8b3c?q=80&w=1024',
  'https://images.unsplash.com/photo-1597691313449-bf91d1bad13a?q=80&w=1024',
  'https://images.unsplash.com/photo-1653379398025-f2bc80b1cbc3?q=80&w=1024',
];

// Get a random image from the sample images
export const getRandomImage = () => {
  const randomIndex = Math.floor(Math.random() * sampleImages.length);
  return sampleImages[randomIndex];
};

// Simulation delay to mimic API response time
export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
