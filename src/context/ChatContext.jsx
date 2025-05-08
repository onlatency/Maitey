import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { generateImage } from '../api/veniceApi';

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
  DELETE_MESSAGE: 'DELETE_MESSAGE',
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
      
    case ACTIONS.DELETE_MESSAGE:
      return {
        ...state,
        chats: state.chats.map(chat => {
          // If this is not the active chat, return it unchanged
          if (chat.id !== state.activeChatId) return chat;
          
          // Filter out the message with the given ID
          const updatedMessages = chat.messages.filter(
            msg => msg.id !== action.payload
          );
          
          // Return chat with updated messages
          return { ...chat, messages: updatedMessages };
        })
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
          chat.id === (action.payload.chatId || state.activeChatId) 
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
  
  // Monitor and create chats as needed - unified chat creation logic
  const lastGeneratedIdRef = React.useRef(0);
  
  useEffect(() => {
    // Case 1: No chats exist but we need to create one
    if (state.chats.length === 0) {
      // Generate a guaranteed unique ID based on timestamp and a counter
      const timestamp = Date.now();
      const uniqueId = timestamp + lastGeneratedIdRef.current;
      lastGeneratedIdRef.current += 1;
      
      const newChat = {
        id: uniqueId,
        name: `New Chat`,
        messages: []
      };
      console.log('Creating new chat with unique ID:', uniqueId);
      
      // Add the chat first
      dispatch({ type: ACTIONS.ADD_CHAT, payload: newChat });
      
      // Then set it as active with a small delay to ensure the ADD_CHAT completes
      setTimeout(() => {
        console.log('Setting newly created chat as active:', uniqueId);
        dispatch({ type: ACTIONS.SET_ACTIVE_CHAT, payload: uniqueId });
      }, 10);
    } 
    // Case 2: Chats exist but no active chat is selected
    else if (!state.activeChatId && state.chats.length > 0) {
      // If there are chats but no active chat, set the first one as active
      console.log('Setting first chat as active:', state.chats[0].id);
      dispatch({ type: ACTIONS.SET_ACTIVE_CHAT, payload: state.chats[0].id });
    }
  }, [state.chats.length, state.activeChatId]);
  
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
  
  // Create a new chat with guaranteed unique ID
  const createNewChat = (customName = null) => {
    // Generate a unique ID based on timestamp
    const timestamp = Date.now();
    const uniqueId = timestamp + lastGeneratedIdRef.current;
    lastGeneratedIdRef.current += 1;
    
    const newChat = {
      id: uniqueId,
      name: customName || `New Chat`,
      messages: []
    };
    console.log('Creating new chat with unique ID:', uniqueId);
    dispatch({ type: ACTIONS.ADD_CHAT, payload: newChat });
    return uniqueId;
  };
  
  // Delete a chat
  const deleteChat = (chatId) => {
    // First check if this is the last chat, and if so, create a new one before deleting
    if (state.chats.length === 1) {
      console.log('About to delete last chat, creating a new one first');
      const newChatId = createNewChat('New Chat');
      // Set the new chat as active
      dispatch({ type: ACTIONS.SET_ACTIVE_CHAT, payload: newChatId });
      // Short delay to ensure the new chat is added before deleting the old one
      setTimeout(() => {
        dispatch({ type: ACTIONS.DELETE_CHAT, payload: chatId });
      }, 50);
    } else {
      // Normal case: just delete the chat
      dispatch({ type: ACTIONS.DELETE_CHAT, payload: chatId });
    }
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
  const updateImageMessage = (messageId, updates, chatId = null) => {
    console.log('Updating image message:', { messageId, updates, chatId });
    dispatch({ type: ACTIONS.UPDATE_IMAGE_MESSAGE, payload: { messageId, updates, chatId } });
  };
  
  // Delete a message from the active chat
  const deleteMessage = (messageId) => {
    console.log('Deleting message with ID:', messageId);
    dispatch({ type: ACTIONS.DELETE_MESSAGE, payload: messageId });
  };
  
  // Add a new image by calling the Venice API
  const addNewImage = async (prompt, existingImageUrl = null) => {
    // Create a message ID right away
    const messageId = Date.now();
    
    // Store the current chat ID at the time of request
    const sourceChatId = state.activeChatId;
    
    try {
      // Ensure we have an active chat
      if (!state.activeChatId || !getActiveChat()) {
        await ensureActiveChat();
      }
      
      // Create the pending message
      const pendingMessage = {
        id: messageId,
        type: 'image',
        sender: 'user',
        text: prompt,
        timestamp: new Date().toISOString(),
        status: 'pending',
        images: []
      };
      
      // Handle case of existing image URL
      if (existingImageUrl) {
        pendingMessage.images = [{ url: existingImageUrl, timestamp: new Date().toISOString() }];
        pendingMessage.status = 'complete';
        addMessage(pendingMessage);
        return messageId;
      }
      
      // Add pending message and track as active generation
      addMessage(pendingMessage);
      dispatch({ type: ACTIONS.ADD_ACTIVE_GENERATION, payload: messageId });
      setLoading(true);
      
      // Process image generation with proper error handling
      try {
        const result = await generateImage(prompt, state.settings);
        
        if (result && result.imageUrl) {
          // Success - update message with the new image
          updateImageMessage(messageId, {
            status: 'complete',
            newImageUrl: result.imageUrl
          }, sourceChatId);
        } else {
          throw new Error('No image URL returned from API');
        }
      } catch (error) {
        // Categorize errors for better user feedback
        const errorMessage = error.message || 'Unknown error';
        let userFriendlyMessage = `API error: ${errorMessage}`;
        
        // Check for different error types
        if (error.name === 'AbortError' || errorMessage.includes('timeout') || errorMessage.includes('too long')) {
          userFriendlyMessage = 'Request timed out. The server took too long to respond.';
        } else if (errorMessage.includes('Network') || errorMessage.includes('connection')) {
          userFriendlyMessage = 'Network connection error. Please check your internet connection.';
        } else if (errorMessage.includes('API key')) {
          userFriendlyMessage = 'API authentication error. Please check your API key configuration.';
        }
        
        // Always update the message with the error status
        await updateImageMessage(messageId, {
          status: 'error',
          error: userFriendlyMessage,
          errorTime: new Date().toISOString()
        }, sourceChatId);
        
        // Set global error state to ensure visibility
        setError(userFriendlyMessage);
      } finally {
        // Always clean up generation status regardless of success/failure
        dispatch({ type: ACTIONS.REMOVE_ACTIVE_GENERATION, payload: messageId });
        
        // Reset loading state if this was the last active generation
        if (state.activeGenerations.length <= 1) {
          setLoading(false);
        }
      }
      
      return messageId;
    } catch (outerError) {
      // Handle unexpected errors outside the normal flow
      console.error('Unexpected error in addNewImage:', outerError);
      
      // Create an error message even if we failed before creating the normal message
      if (getActiveChat()) {
        const errorMessage = {
          id: messageId,
          type: 'image',
          sender: 'user',
          text: prompt,
          timestamp: new Date().toISOString(),
          status: 'error',
          error: 'An unexpected error occurred: ' + (outerError.message || 'Unknown error'),
          errorTime: new Date().toISOString(),
          images: []
        };
        addMessage(errorMessage);
      }
      
      // Set global error and reset loading state
      setError('An unexpected error occurred: ' + (outerError.message || 'Unknown error'));
      setLoading(false);
      return null;
    }
  };
  
  // Helper to ensure we have an active chat
  const ensureActiveChat = async () => {
    // Generate a unique ID for a new chat
    const timestamp = Date.now();
    const uniqueId = timestamp + lastGeneratedIdRef.current;
    lastGeneratedIdRef.current += 1;
    
    const newChat = {
      id: uniqueId,
      name: `Generated Images`,
      messages: []
    };
    
    // Add chat and set as active
    dispatch({ type: ACTIONS.ADD_CHAT, payload: newChat });
    dispatch({ type: ACTIONS.SET_ACTIVE_CHAT, payload: uniqueId });
    
    // Wait for state updates to take effect
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Verify that we have an active chat
    if (!getActiveChat()) {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      if (!getActiveChat()) {
        throw new Error('Failed to create active chat for image generation');
      }
    }
    
    return uniqueId;
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
    deleteMessage,
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
