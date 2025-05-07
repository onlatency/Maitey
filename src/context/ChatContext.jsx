import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Initial state for our chat application
const initialState = {
  chats: [],
  activeChatId: null,
  isLoading: false,
  error: null,
  settings: {
    model: 'venice-sd35',
    width: 1024,
    height: 1024,
    steps: 30,
    safeMode: false,
    hideWatermark: true,
    cfgScale: 7.0,
    stylePreset: 'Photographic',
    negativePrompt: 'blurry, low quality, bad anatomy, worst quality, deformed, ugly, text, watermark, signature'
  }
};

// Load state from localStorage if available
const loadFromLocalStorage = () => {
  try {
    const savedState = localStorage.getItem('maiteyAppState');
    if (savedState) {
      return JSON.parse(savedState);
    }
  } catch (error) {
    console.error('Error loading state from localStorage:', error);
  }
  return initialState;
};

// Actions for our reducer
const ACTIONS = {
  SET_ACTIVE_CHAT: 'SET_ACTIVE_CHAT',
  ADD_CHAT: 'ADD_CHAT',
  DELETE_CHAT: 'DELETE_CHAT',
  RENAME_CHAT: 'RENAME_CHAT',
  ADD_MESSAGE: 'ADD_MESSAGE',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  UPDATE_IMAGE_MESSAGE: 'UPDATE_IMAGE_MESSAGE',
  UPDATE_SETTINGS: 'UPDATE_SETTINGS'
};

// Reducer function to handle state updates
const chatReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_ACTIVE_CHAT:
      return { ...state, activeChatId: action.payload };
      
    case ACTIONS.ADD_CHAT:
      return { 
        ...state, 
        chats: [...state.chats, action.payload],
        activeChatId: action.payload.id
      };
      
    case ACTIONS.DELETE_CHAT:
      const remainingChats = state.chats.filter(chat => chat.id !== action.payload);
      return { 
        ...state, 
        chats: remainingChats,
        activeChatId: remainingChats.length > 0 ? remainingChats[0].id : null
      };
      
    case ACTIONS.RENAME_CHAT:
      return { 
        ...state, 
        chats: state.chats.map(chat => 
          chat.id === action.payload.chatId 
            ? { ...chat, name: action.payload.newName } 
            : chat
        )
      };
      
    case ACTIONS.ADD_MESSAGE:
      return { 
        ...state, 
        chats: state.chats.map(chat => 
          chat.id === state.activeChatId 
            ? { ...chat, messages: [...chat.messages, action.payload] } 
            : chat
        )
      };
      
    case ACTIONS.SET_LOADING:
      return { ...state, isLoading: action.payload };
      
    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload };
      
    case ACTIONS.UPDATE_IMAGE_MESSAGE:
      return { 
        ...state, 
        chats: state.chats.map(chat => 
          chat.id === state.activeChatId 
            ? { 
                ...chat, 
                messages: chat.messages.map(msg => {
                  // If this is the target message
                  if (msg.id === action.payload.messageId) {
                    // Special handling for adding a new image to the images array
                    if (action.payload.updates.newImageUrl) {
                      // Create a new image object
                      const newImage = {
                        url: action.payload.updates.newImageUrl,
                        timestamp: new Date().toISOString()
                      };
                      
                      // Initialize or update the images array
                      const existingImages = msg.images || [];
                      const updatedImages = [...existingImages, newImage];
                      
                      // Remove the newImageUrl from updates to avoid storing it directly
                      const { newImageUrl, ...otherUpdates } = action.payload.updates;
                      
                      // Return updated message with new images array
                      return { 
                        ...msg, 
                        ...otherUpdates,
                        images: updatedImages,
                        // Always show the latest image in the url field for backward compatibility
                        url: newImageUrl || msg.url
                      };
                    } else {
                      // Regular update without adding new image
                      return { ...msg, ...action.payload.updates };
                    }
                  }
                  return msg;
                }) 
              } 
            : chat
        )
      };
      
    case ACTIONS.UPDATE_SETTINGS:
      return {
        ...state,
        settings: { ...state.settings, ...action.payload }
      };
      
    default:
      return state;
  }
};

// Create the context
const ChatContext = createContext();

// Custom hook to use the chat context
export const useChatContext = () => useContext(ChatContext);

// Provider component
export const ChatProvider = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, loadFromLocalStorage());
  
  // Save state to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('maiteyAppState', JSON.stringify(state));
    } catch (error) {
      console.error('Error saving state to localStorage:', error);
    }
  }, [state]);
  
  // Helper function to get the active chat
  const getActiveChat = () => state.chats.find(chat => chat.id === state.activeChatId);
  
  // Create a new chat
  const createNewChat = (customName = null) => {
    const newChatId = state.chats.length > 0 ? Math.max(...state.chats.map(c => c.id)) + 1 : 1;
    const newChat = {
      id: newChatId,
      name: customName || `New Chat ${newChatId}`,
      messages: []
    };
    dispatch({ type: ACTIONS.ADD_CHAT, payload: newChat });
    return newChatId;
  };
  
  // Delete a chat
  const deleteChat = (chatId) => {
    dispatch({ type: ACTIONS.DELETE_CHAT, payload: chatId });
  };
  
  // Rename a chat
  const renameChat = (chatId, newName) => {
    dispatch({ type: ACTIONS.RENAME_CHAT, payload: { chatId, newName } });
  };
  
  // Set active chat
  const setActiveChat = (chatId) => {
    dispatch({ type: ACTIONS.SET_ACTIVE_CHAT, payload: chatId });
  };
  
  // Add a message to the active chat
  const addMessage = (message) => {
    dispatch({ type: ACTIONS.ADD_MESSAGE, payload: message });
  };
  
  // Update an image message in the active chat
  const updateImageMessage = (messageId, updates) => {
    dispatch({ type: ACTIONS.UPDATE_IMAGE_MESSAGE, payload: { messageId, updates } });
  };
  
  // Update settings
  const updateSettings = (newSettings) => {
    dispatch({ type: ACTIONS.UPDATE_SETTINGS, payload: newSettings });
  };
  
  // Set loading state
  const setLoading = (isLoading) => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: isLoading });
  };
  
  // Set error state
  const setError = (error) => {
    dispatch({ type: ACTIONS.SET_ERROR, payload: error });
  };
  
  // Value object to be provided to consumers
  const value = {
    ...state,
    getActiveChat,
    createNewChat,
    deleteChat,
    renameChat,
    setActiveChat,
    addMessage,
    updateImageMessage,
    updateSettings,
    setLoading,
    setError
  };
  
  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};
