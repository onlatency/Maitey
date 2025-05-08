# Venice Image Chat - Professional Media UI Redesign

## Project Vision

Transform the Venice Image Chat application into a professional tool for media creators who need to generate, classify, and manage images at scale.

## UI Redesign Plan

### 1. Left Panel - Chats & Settings

- **Chat Management**
  - Keep chats on the left side pane
  - Add checkboxes for multi-selection of chats
  - Implement different color schemes for selected/unselected chats
  - Add delete button for individual and a bulk delete button
  - Future: Add folder organization system

- **Image Settings Panel**
  - Move image settings below the chats pane
  - Keep existing settings (Model, Style, Steps, Adherence)
  - Add "Negative Prompts" text input field
  - Implement image size controls with presets:
    - Square (Default)
    - Landscape (3:2)
    - Cinema (16:9)
    - Tall (9:16)
    - Portrait (2:3)
    - Instagram (4:5)
    - Custom (with width/height input fields)

### 2. Main Panel - Image Gallery

- **Gallery Layout**
  - Transform main area into a responsive image gallery
  - Display all generated images in the current chat
  - Implement card-based design for each image

- **Image Cards**
  - Display generated image
  - Show prompt in scrollable 2-line text field
  - Add control buttons at the bottom:
    - Download image button
    - View full-size button (new)
    - Regenerate image button (new)
    - Copy prompt button
  - Visual indicators for generation status

### 3. Bottom Panel - Prompt Controls

- **Persistent Prompt Input**
  - Keep prompt input field at the bottom
  - Maintain editability at all times
  - Automatic height adjustment based on content

- **Control Buttons**
  - Generate button (creates new image card)
  - Lightbulb button for future "enhance prompt" feature

- **Style Quick-Select**
  - Add eight style preset buttons for quick selection
  - Visual indication of active style

## Technical Implementation Tasks

### Phase 1: Component Structure & State Management

- [ ] Refactor `ChatContext.jsx` to support new data model
- [ ] Create new components:
  - [ ] `ChatSelector.jsx` - Enhanced chat selection component
  - [ ] `ImageGallery.jsx` - Main gallery container
  - [ ] `ImageCard.jsx` - Individual image card component
  - [ ] `ImageSizeControl.jsx` - Size presets and custom sizing
  - [ ] `StyleQuickSelect.jsx` - Style preset buttons
  - [ ] `NegativePromptInput.jsx` - For negative prompts
  - [ ] `PersistentPromptInput.jsx` - Enhanced prompt input

### Phase 2: Core Functionality

- [ ] Implement multi-selection logic for chats
- [ ] Build parallel image generation capability (don't wait for previous generation)
- [ ] Develop image card system with proper state management
- [ ] Create negative prompt handling logic
- [ ] Implement image size preset system

### Phase 3: Enhanced Features

- [ ] Add regeneration capability per image
- [ ] Implement full-size image view
- [ ] Create prompt copy functionality
- [ ] Build style quick-select system
- [ ] Set up infrastructure for future prompt enhancement feature

### Phase 4: UI Polish & Optimization

- [ ] Design color schemes for selected/unselected states
- [ ] Optimize gallery layout for different screen sizes
- [ ] Add transitions and animations for smooth UX
- [ ] Implement loading states and error handling
- [ ] Performance optimization for large image collections

## API Integration Updates

- [ ] Extend Venice API integration for negative prompts
- [ ] Add support for custom image dimensions
- [ ] Implement parallel request handling
- [ ] Create proper error handling for failed generations

## Future Enhancements

- [ ] AI prompt enhancement (lightbulb feature)
- [ ] Folder organization system for chats
- [ ] Persistent browser storage for generated images
- [ ] Batch operations on multiple images
- [ ] Export/import functionality for image collections