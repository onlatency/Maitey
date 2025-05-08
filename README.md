# Venice Image Chat - Professional Media UI

A professional tool for media creators to generate, classify, and manage AI images at scale.

## Features

- 🎨 Generate images from text prompts with advanced settings
- 🖼️ Professional gallery view for managing multiple images
- 🔍 Image regeneration with one-click controls
- ⚙️ Comprehensive image settings panel with style presets
- 🪄 Negative prompt support for fine-tuned generation
- 📏 Multiple image size presets with custom dimensions
- 💾 Local storage persistence for your chats and images
- 📱 Responsive design optimized for all devices
- 👥 Multi-selection capabilities for chat management
- 📋 Copy prompt functionality for reuse and sharing
- 🔍 Full-size image viewing experience
- 💜 Beautiful professional UI with intuitive controls
- ⚠️ Robust error handling with user-friendly messages
- ⏱️ Request timeout management with graceful recovery
- 🔄 Concurrent image generation support

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Venice API key

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in the root directory with your Venice API key:
   ```
   VITE_VENICE_API_KEY=your_api_key_here
   ```

### Development

Start the development server:

```
npm run dev
```

#### Mock Image Generation

For demonstration and testing purposes, the application includes a robust mock image generation system:

- Works without requiring a valid Venice API key
- Returns style-appropriate images based on selected presets
- Simulates API response timing for realistic testing
- Maintains consistent behavior for both main prompt and regeneration flows

### Building for Production

Build the application for production:

```
npm run build
```

## Environment Variables

- `VITE_VENICE_API_KEY`: Your Venice API key for image generation

## Tech Stack

- **Frontend Framework**: React with Vite
- **Styling**: Tailwind CSS for responsive design
- **State Management**: React Context API
- **Image Generation**: Venice API integration
- **Testing**: Mock image generator system
- **Storage**: Local browser storage for persistence
- **UI Components**: Custom-built components optimized for media workflows

## License

MIT
