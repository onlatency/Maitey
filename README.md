# Maitey Image Chat

A modern web application for generating beautiful AI images through a chat interface.

## Features

- 🎨 Generate images from text prompts
- 💬 Chat-based interface for a natural experience
- 🖼️ Multiple image variations in a carousel view
- ⚙️ Customizable generation settings
- 💾 Local storage persistence for your chats
- 📱 Responsive design for mobile and desktop
- 🔄 Regenerate images with different variations
- 💜 Beautiful purple-themed UI

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

### Building for Production

Build the application for production:

```
npm run build
```

## Environment Variables

- `VITE_VENICE_API_KEY`: Your Venice API key for image generation

## Tech Stack

- React
- Vite
- Tailwind CSS
- Context API for state management
- Venice API for image generation

## License

MIT
