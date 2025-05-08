import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Initial state for our chat application
const initialState = {
  chats: [],
  activeChatId: null,
  selectedChatIds: [], // New field for multi-selection
  activeGenerations: [], // Track parallel image generations
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
  UPDATE_SETTINGS: 'UPDATE_SETTINGS',
  SELECT_CHAT: 'SELECT_CHAT',
  DESELECT_CHAT: 'DESELECT_CHAT',
  CLEAR_SELECTED_CHATS: 'CLEAR_SELECTED_CHATS',
  ADD_ACTIVE_GENERATION: 'ADD_ACTIVE_GENERATION',
  REMOVE_ACTIVE_GENERATION: 'REMOVE_ACTIVE_GENERATION'
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
      // If we're deleting a selected chat, also remove it from the selected chat IDs
      const chatIdToDelete = action.payload;
      const updatedSelectedChatIds = state.selectedChatIds.filter(id => id !== chatIdToDelete);
      
      const remainingChats = state.chats.filter(chat => chat.id !== chatIdToDelete);
      const newActiveChatId = chatIdToDelete === state.activeChatId
        ? (remainingChats.length > 0 ? remainingChats[0].id : null)
        : state.activeChatId;
        
      return { 
        ...state, 
        chats: remainingChats,
        activeChatId: newActiveChatId,
        selectedChatIds: updatedSelectedChatIds
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
      // Check if message is a new complete message to be added instead of an update
      if (typeof action.payload === 'object' && !action.payload.messageId && action.payload.id) {
        // This is a new message to be added to the active chat
        return {
          ...state,
          chats: state.chats.map(chat =>
            chat.id === state.activeChatId
              ? { ...chat, messages: [...chat.messages, action.payload] }
              : chat
          )
        };
      }
      
      console.log('Updating image message with:', action.payload);
      // Otherwise, perform a regular update
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
    
    case ACTIONS.SELECT_CHAT:
      // Don't add duplicate chat IDs
      if (state.selectedChatIds.includes(action.payload)) {
        return state;
      }
      return {
        ...state,
        selectedChatIds: [...state.selectedChatIds, action.payload]
      };
      
    case ACTIONS.DESELECT_CHAT:
      return {
        ...state,
        selectedChatIds: state.selectedChatIds.filter(id => id !== action.payload)
      };
      
    case ACTIONS.CLEAR_SELECTED_CHATS:
      return {
        ...state,
        selectedChatIds: []
      };
      
    case ACTIONS.ADD_ACTIVE_GENERATION:
      return {
        ...state,
        activeGenerations: [...state.activeGenerations, action.payload]
      };
      
    case ACTIONS.REMOVE_ACTIVE_GENERATION:
      return {
        ...state,
        activeGenerations: state.activeGenerations.filter(id => id !== action.payload)
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
  
  // Create a default chat if none exists
  useEffect(() => {
    if (state.chats.length === 0) {
      const newChatId = 1;
      const newChat = {
        id: newChatId,
        name: `New Chat ${newChatId}`,
        messages: []
      };
      dispatch({ type: ACTIONS.ADD_CHAT, payload: newChat });
    } else if (!state.activeChatId && state.chats.length > 0) {
      // If there are chats but no active chat, set the first one as active
      dispatch({ type: ACTIONS.SET_ACTIVE_CHAT, payload: state.chats[0].id });
    }
  }, []);
  
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
    console.log('Updating image message:', { messageId, updates });
    dispatch({ type: ACTIONS.UPDATE_IMAGE_MESSAGE, payload: { messageId, updates } });
  };
  
  // Add a new image directly to a chat (simpler than updateImageMessage)
  const addNewImage = (prompt, imageUrl) => {
    const newMessage = {
      id: Date.now(),
      type: 'image',
      sender: 'user',
      text: prompt,
      timestamp: new Date().toISOString(),
      status: 'complete',
      images: [{ url: imageUrl, timestamp: new Date().toISOString() }]
    };
    
    console.log('Adding new image message directly:', newMessage);
    addMessage(newMessage);
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
  
  // Chat selection functions
  const selectChat = (chatId) => {
    dispatch({ type: ACTIONS.SELECT_CHAT, payload: chatId });
  };
  
  const deselectChat = (chatId) => {
    dispatch({ type: ACTIONS.DESELECT_CHAT, payload: chatId });
  };
  
  const clearSelectedChats = () => {
    dispatch({ type: ACTIONS.CLEAR_SELECTED_CHATS });
  };
  
  const deleteSelectedChats = () => {
    state.selectedChatIds.forEach(chatId => {
      deleteChat(chatId);
    });
    clearSelectedChats();
  };
  
  // Parallel generation tracking
  const addActiveGeneration = (generationId) => {
    dispatch({ type: ACTIONS.ADD_ACTIVE_GENERATION, payload: generationId });
  };
  
  const removeActiveGeneration = (generationId) => {
    dispatch({ type: ACTIONS.REMOVE_ACTIVE_GENERATION, payload: generationId });
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
    addNewImage, // Add the new direct image addition function
    updateSettings,
    setLoading,
    setError,
    // New selection functions
    selectChat,
    deselectChat,
    clearSelectedChats,
    deleteSelectedChats,
    // Parallel generation tracking
    addActiveGeneration,
    removeActiveGeneration
  };
  
  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};
