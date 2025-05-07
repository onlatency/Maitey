import React, { useState, useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import PromptInput from './PromptInput';
import WelcomeScreen from './WelcomeScreen';
import { Edit2, Trash2 } from 'lucide-react';
import { useChatContext } from '../context/ChatContext';
import { generateImage } from '../api/veniceApi';

function ChatView() {
  const { 
    getActiveChat, 
    isLoading, 
    setLoading, 
    addMessage, 
    updateImageMessage,
    renameChat,
    deleteChat,
    settings
  } = useChatContext();
  
  const chat = getActiveChat();
  const messagesEndRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newChatName, setNewChatName] = useState('');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  useEffect(() => {
    if (chat) {
      scrollToBottom();
      setNewChatName(chat.name);
    }
  }, [chat?.id, chat?.messages?.length, isLoading]);

  const handleSendMessage = async (promptText) => {
    if (!promptText.trim() || !chat) return;

    // Add prompt message
    const newMessageId = chat.messages.length > 0 ? Math.max(...chat.messages.map(m => m.id)) + 1 : 1;
    const promptMessage = { id: newMessageId, type: 'prompt', text: promptText };
    addMessage(promptMessage);
    
    // Add placeholder for image response
    const placeholderImageId = newMessageId + 1;
    const placeholderImage = { 
      id: placeholderImageId, 
      type: 'image', 
      url: '', 
      promptText, // Save prompt text for regeneration
      isLoading: true,
      images: [] // Initialize empty images array
    };
    addMessage(placeholderImage);
    
    setLoading(true);
    try {
      const imageBlob = await generateImage(promptText, settings);
      const imageUrl = URL.createObjectURL(imageBlob);
      
      // Use newImageUrl to add to the images array
      updateImageMessage(placeholderImageId, { 
        newImageUrl: imageUrl, 
        isLoading: false 
      });
    } catch (error) {
      console.error('Failed to generate image:', error);
      updateImageMessage(placeholderImageId, { 
        text: 'Error generating image. Please try again.', 
        isLoading: false, 
        isError: true 
      });
    }
    setLoading(false);
  };

  const handleRegenerateImage = async (promptText, messageId) => {
    if (!promptText.trim() || !chat) return;
    
    // Show loading state but don't remove existing images
    updateImageMessage(messageId, { isLoading: true, isError: false });
    
    setLoading(true);
    try {
      const imageBlob = await generateImage(promptText, settings);
      const imageUrl = URL.createObjectURL(imageBlob);
      
      // Add the new image to the carousel by using the newImageUrl property
      // This will be handled specially in the reducer to add to the images array
      updateImageMessage(messageId, { 
        newImageUrl: imageUrl, 
        isLoading: false,
        // Make sure promptText is saved for future regenerations
        promptText: promptText
      });
    } catch (error) {
      console.error('Failed to regenerate image:', error);
      updateImageMessage(messageId, { 
        text: 'Error generating image variation. Please try again.', 
        isLoading: false, 
        isError: true 
      });
    }
    setLoading(false);
  };

  const handleStartEditing = () => {
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (chat && newChatName.trim()) {
      renameChat(chat.id, newChatName.trim());
    }
    setIsEditing(false);
  };

  const handleDeleteChat = () => {
    if (chat && confirm('Are you sure you want to delete this chat?')) {
      deleteChat(chat.id);
    }
  };

  if (!chat) {
    return <WelcomeScreen />;
  }

  return (
    <div className="flex-grow flex flex-col bg-white h-full">
      {/* Chat Header with Edit/Delete options */}
      <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
        {isEditing ? (
          <div className="flex items-center gap-2 w-full">
            <input
              type="text"
              value={newChatName}
              onChange={(e) => setNewChatName(e.target.value)}
              className="flex-grow p-1 border rounded"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
            />
            <button 
              onClick={handleSaveEdit}
              className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Save
            </button>
            <button 
              onClick={() => setIsEditing(false)}
              className="px-2 py-1 bg-gray-300 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-lg font-semibold text-gray-700">{chat.name}</h2>
            <div className="flex gap-2">
              <button 
                onClick={handleStartEditing}
                className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded"
                title="Rename Chat"
              >
                <Edit2 size={18} />
              </button>
              <button 
                onClick={handleDeleteChat}
                className="p-1 text-gray-500 hover:text-red-500 hover:bg-gray-200 rounded"
                title="Delete Chat"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-grow overflow-y-auto p-6 space-y-4 bg-gray-100">
        {chat.messages.map(message => (
          <MessageBubble 
            key={message.id} 
            message={message} 
            onRegenerateImage={handleRegenerateImage}
          />
        ))}
        <div ref={messagesEndRef} /> 
      </div>

      {/* Prompt Input Area */}
      <div className="p-4 border-t bg-gray-50">
        <PromptInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
}

export default ChatView;
