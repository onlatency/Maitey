# Venice Image Chat Web App — Product Requirements Document (PRD)

## Overview
A modern, scalable web application for chatting with an AI image generator powered by the Venice API. Users can create, manage, and revisit multiple chat sessions, each consisting of text prompts and AI-generated images. The interface is inspired by leading chat/image platforms, with a focus on sleek design and extensibility.

---

## Goals
- **Seamless image generation via Venice API**
- **Chat-style interface for prompt/image history**
- **Multiple chat sessions, easily switchable**
- **Modern, responsive, and visually appealing UI**
- **Easy to extend for future features (e.g., user accounts, cloud history)**

---

## Target Audience
- AI enthusiasts, creators, and professionals seeking rapid image generation
- Users familiar with chat-based UIs (e.g., ChatGPT, Midjourney)

---

## Core Features
### 1. Chat List Pane (Left Sidebar)
- Vertical list of chat sessions, each with a name and image preview
- Button to start a new chat
- Ability to rename or delete chats (future)

### 2. Main Chat Pane
- Chat bubbles for user prompts and AI image responses
- Display images as thumbnails; click to enlarge
- Show image generation status (loading indicator)
- Input box for new prompts at the bottom
- Optionally, allow editing the last prompt before sending (future)

### 3. Venice API Integration
- Use `/api/v1/image/generate` endpoint
- Send prompt and config (model, style, etc.) per user input
- Display returned image (webp blob) in chat
- Handle errors gracefully (e.g., API errors, invalid input)

### 4. Settings Panel (Optional for MVP)
- Select model, style, resolution, etc.
- Toggle watermark, safe mode, etc.
- Accessible via a drawer or modal

---

## Technical Requirements
- **Frontend:** React (Vite or Next.js), Tailwind CSS for styling
- **Backend:** None for MVP (direct API calls from frontend)
- **State Management:** React Context or Redux (if needed for scaling)
- **Image Storage:** In-memory for MVP; localStorage or backend for persistence (future)
- **API Security:** Store API key securely (env variable, not in client for production)

---

## User Flows
1. **Start New Chat:**
    - User clicks “New Chat” → new session appears in sidebar
2. **Send Prompt:**
    - User enters prompt → image is generated and shown in chat
3. **Switch Chats:**
    - User selects another chat in sidebar → chat history loads
4. **View Images:**
    - User clicks image thumbnail → full-size image modal opens

---

## MVP Scope
- Multi-chat sidebar
- Chat UI with prompt/image bubbles
- Venice API integration for image generation
- Responsive, sleek design

---

## Out of Scope (for MVP)
- User authentication/accounts
- Cloud-based chat/image history
- Advanced prompt editing
- Collaboration/sharing features

---

## Future Enhancements
- User login & persistent cloud history
- Shareable chat/image links
- Advanced settings & prompt templates
- Mobile app version

---

## References
- [Venice API Docs](https://docs.venice.ai/api-reference/endpoint/image/generate)
- UI inspiration from attached screenshot

---

## Appendix: Example API Request
```bash
curl --location 'https://api.venice.ai/api/v1/image/generate' \
--output response.webp --header 'Content-Type: application/json' \
--header 'Authorization: Bearer <API_KEY>' \
--data '{
    "model": "lustify-sdxl",
    "prompt": "Goats wearing coats",
    "width": 1024,
    "height": 1024,
    "steps": 30,
    "safe_mode": false,
    "hide_watermark": true,
    "cfg_scale": 7.0,
    "style_preset": "Photographic",
    "negative_prompt": "human",
    "return_binary": true
}'
```

---

## License
MIT (or specify as needed)
