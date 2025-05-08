# MAITEYCHAT - Media AI that enriches your chats

A professional tool for media creators to generate, classify, and manage AI images at scale.

## Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
- [Project Overview](#project-overview)
- [Implemented Features](#implemented-features)
- [Technical Architecture](#technical-architecture)
- [Development Roadmap](#development-roadmap)
- [Recent Updates](#recent-updates)
- [Known Limitations](#known-limitations)
- [Future Enhancements](#future-enhancements)
- [License](#license)

## Features

- 🎨 Generate images from text prompts with advanced settings
- 🖼️ Professional gallery view for managing multiple images
- 🔍 Image regeneration with one-click controls
- ⚙️ Comprehensive image settings panel with style presets
- 🪄 Negative prompt support for fine-tuned generation
- 📏 Multiple image size presets with custom dimensions
- 💾 Local storage persistence for your chats and images
- 📱 Responsive design optimized for all devices
- ↔️ Resizable panels for customized workspace layout
- 👥 Multi-selection capabilities for chat management
- 📋 Copy prompt functionality for reuse and sharing
- 🔍 Full-size image viewing experience
- 💜 Beautiful professional UI with intuitive controls
- ⚠️ Robust error handling with user-friendly messages
- ⏱️ Request timeout management with graceful recovery (45 seconds)
- 🔄 Concurrent image generation for multi-chat workflow

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm, yarn, or pnpm
- Venice API key

### Installation

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with your Venice API key:

   ```env
   VITE_VENICE_API_KEY=your_api_key_here
   ```

### Development

Start the development server:

```bash
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

```bash
npm run build
```

## Project Overview

Venice Image Chat is designed to transform AI image generation into a professional-grade tool for media creators. The application provides an intuitive, responsive interface for generating, managing, and organizing AI-generated images with a focus on user experience and workflow efficiency.

### Project Vision

Create a professional tool for media creators who need to generate, classify, and manage images at scale, with a focus on usability and efficient workflows.

### Tech Stack

- **Frontend Framework**: React with Vite
- **Styling**: Tailwind CSS for responsive design
- **State Management**: React Context API
- **Image Generation**: Venice API integration
- **Testing**: Mock image generator system
- **Storage**: Local browser storage for persistence
- **UI Components**: Custom-built components optimized for media workflows

### Environment Variables

- `VITE_VENICE_API_KEY`: Your Venice API key for image generation

## Implemented Features

### Welcome Screen with Suggested Prompts

- Clean, modern welcome screen that greets users when no chats exist
- Suggestion buttons for quick-start prompts including:
  - Tiger on Skateboard
  - Goats in Coats
  - Research AI campaigns
  - Research battery tech
  - Research sensor trends
- Helpful tips for creating effective prompts

### Multi-Chat Management

- Create multiple chat sessions with custom names
- Rename and delete existing chats
- Seamless switching between chats with persistent state
- Local storage persistence for chat history
- Multi-selection for batch operations

### Image Generation

- Integration with Venice API for high-quality image generation
- Support for multiple image models and style presets
- Customizable generation parameters via settings panel
- Robust error handling with user-friendly error messages
- Timeout handling that preserves error states in the UI
- Concurrent image generation support

### Image Carousel for Variations

- Generate multiple variations of the same prompt
- Interactive carousel to browse through generated images
- Navigation buttons and dot indicators for multiple images
- Image counter showing current position
- Download functionality for all generated images
- Open in new tab option for closer inspection

### Responsive Design

- Mobile-friendly layout with collapsible sidebar
- Adaptive UI that works on various screen sizes
- Intuitive navigation for both desktop and mobile

### User Experience Improvements

- Toast notifications for user actions
- Helpful prompt suggestions
- Settings panel for customizing generation parameters
- Image downloading with automatic filename generation
- Resizable side panels for improved workspace customization
- Enhanced slider controls with editable and tab-navigable numeric fields
- Physical-looking slider design with custom knobs and depth effects
- Modernized UI elements with consistent styling and visual cues
- Improved chat list item layout with proper spacing and alignment
- Updated application title and branding
- Interactive image size selector with draggable corners and real-time feedback
- Draggable settings panels with customizable order via toggle button
- Immediate reset of prompt submission button for faster multi-image workflows

## Technical Architecture

### Error Handling and API Robustness

- Comprehensive error handling for API calls
- Streamlined timeout handling with consolidated error flow
- Error message persistence in UI with proper status updates
- Reduced console noise for better debugging experience
- Consistent state management during parallel operations
- Configurable timeout settings (set to 45 seconds for production use)
- Proper cleanup of state even when operations fail
- Image generation persistence across chat switching (images appear in original chat regardless of navigation)

### Modern Architecture

- React Context API for state management
- Component-based architecture for better organization
- Utility modules for common functionality

### Security Enhancements

- Secure API key management with environment variables
- API key not exposed in client-side code

### Storage and Persistence

- Local storage for chat history and settings
- Browser object URLs for image display

## Development Roadmap

### Phase 1: Component Structure & State Management ✅

- [x] Refactor `ChatContext.jsx` to support new data model
- [x] Create new components:
  - [x] `ChatSelector.jsx` - Enhanced chat selection component
  - [x] `ImageGallery.jsx` - Main gallery container
  - [x] `ImageCard.jsx` - Individual image card component
  - [x] `ImageSizeControl.jsx` - Size presets and custom sizing
  - [x] `StyleQuickSelect.jsx` - Style preset buttons
  - [x] `NegativePromptInput.jsx` - For negative prompts
  - [x] `PersistentPromptInput.jsx` - Enhanced prompt input

### Phase 2: Core Functionality ✅

- [x] Implement multi-selection logic for chats
- [x] Build parallel image generation capability (don't wait for previous generation)
- [x] Develop image card system with proper state management
- [x] Create negative prompt handling logic
- [x] Implement image size preset system

### Phase 3: Enhanced Features ✅

- [x] Add regeneration capability per image
- [x] Implement full-size image view
- [x] Create prompt copy functionality
- [x] Build style quick-select system
- [x] Set up infrastructure for future prompt enhancement feature

### Phase 4: UI Polish & Optimization ⏳

- [x] Design color schemes for selected/unselected states
- [x] Optimize gallery layout for different screen sizes
- [x] Add transitions and animations for smooth UX
- [x] Implement loading states and error handling
- [ ] Performance optimization for large image collections

### API Integration Updates ✅

- [x] Extend Venice API integration for negative prompts
- [x] Add support for custom image dimensions
- [x] Implement parallel request handling
- [x] Create proper error handling for failed generations
- [x] Implement load testing for reliability under stress

## Recent Updates

### May 8, 2025: Load Testing & Reliability Improvements

- **Load Test Results**:
  - Successfully conducted a load test with 9 concurrent image generation prompts
  - Verified that multiple images can be generated simultaneously without failures
  - Confirmed improved error handling captures and displays any issues properly
  - Tested various types of prompts to ensure consistent generation quality
  - Identified that manual prompt submission works reliably for concurrent generations
  - Verified that images are properly persisted in their original chat when switching between chats

- **Error Handling Enhancements**:
  - Refactored error handling in veniceApi.js to improve clarity and reduce nesting
  - Enhanced error categorization for network issues, timeouts, and API validation
  - Improved the addNewImage function in ChatContext.jsx for clearer error reporting
  - Standardized error response format for consistent user feedback
  - Implemented proper error state persistence to prevent message disappearance
  - Added detailed logging of API requests and responses for debugging

- **Image Generation Fixes**:
  - Fixed issues with image generation from the prompt input
  - Repaired the regenerate button functionality on image cards
  - Ensured the settings panel correctly affects generated images
  - Fixed issue where image generation fails after deleting the last chat
  - Improved chat creation and activation process when no chats exist
  - Added support for concurrent image generation requests
  - Optimized submit button behavior to provide immediate user feedback

- **Venice API Integration Improvements**:
  - Enhanced API request timeout handling with proper error messages
  - Added robust response validation for error conditions
  - Fixed binary image data extraction from API responses
  - Improved API key validation and error reporting
  - Extended timeout duration to accommodate longer generation times

## Known Limitations

- **Puppeteer/Chrome Test Browser Resizing Issue**: The application exhibits resizing issues specifically in Puppeteer and Chrome test automation browsers. This limitation affects the interactive resizing of sidebar panels and image size controls when using test automation frameworks. This is not expected to impact regular end-users in Chrome, Firefox, or Safari browsers.

## Future Enhancements

- [ ] AI prompt enhancement (lightbulb feature) - UI foundation in place
- [ ] Folder organization system for chats
- [ ] Persistent browser storage for generated images
- [ ] Batch operations on multiple images
- [ ] Export/import functionality for image collections
- [ ] Implement client-side rate limiting to prevent too many concurrent requests
- [ ] Add automatic retry with exponential backoff for failed requests
- [ ] Basic status bar display with API connection status
- [ ] Simple tracking of active generation counts

## License

MIT
