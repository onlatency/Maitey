import React, { useState } from 'react';
import { MessageSquare, Trash2, Check, Plus } from 'lucide-react'; 
import { useChatContext } from '../context/ChatContext';
import { shortenPrompt } from '../utils/imageUtils';

function ChatSelector() {
  const { chats, activeChatId, setActiveChat, deleteChat, createNewChat } = useChatContext();
  const [selectedChats, setSelectedChats] = useState([]);
  const [multiSelectMode, setMultiSelectMode] = useState(false);

  // Toggle selection of a chat
  const toggleChatSelection = (chatId, event) => {
    event.stopPropagation();
    
    if (selectedChats.includes(chatId)) {
      setSelectedChats(selectedChats.filter(id => id !== chatId));
      // If we're removing the last selected chat, exit multi-select mode
      if (selectedChats.length === 1) {
        setMultiSelectMode(false);
      }
    } else {
      setSelectedChats([...selectedChats, chatId]);
    }
  };

  // Toggle multi-select mode
  const toggleMultiSelectMode = () => {
    setMultiSelectMode(!multiSelectMode);
    if (!multiSelectMode) {
      // If enabling, don't select any chats yet
      setSelectedChats([]);
    } else {
      // If disabling, clear selections
      setSelectedChats([]);
    }
  };

  // Delete a single chat
  const handleDeleteChat = (chatId, event) => {
    event.stopPropagation();
    deleteChat(chatId);
  };

  // Delete multiple selected chats
  const deleteSelectedChats = () => {
    selectedChats.forEach(chatId => {
      deleteChat(chatId);
    });
    setSelectedChats([]);
    setMultiSelectMode(false);
  };

  // Check if a chat is selected
  const isChatSelected = (chatId) => {
    return selectedChats.includes(chatId);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col p-2 border-b border-purple-100">
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-bold text-purple-800">MAITEYCHAT</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleMultiSelectMode}
              className={`p-1.5 rounded-md transition-colors ${
                multiSelectMode ? 'bg-purple-600 text-white' : 'text-purple-600 hover:bg-purple-100'
              }`}
              title={multiSelectMode ? "Exit selection mode" : "Select multiple chats"}
            >
              <Check size={16} />
            </button>
            {multiSelectMode && selectedChats.length > 0 && (
              <button
                onClick={deleteSelectedChats}
                className="p-1.5 rounded-md text-red-600 hover:bg-red-100 transition-colors"
                title="Delete selected chats"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>
        
        {/* New Chat Button */}
        <button
          onClick={() => createNewChat()}
          className="w-full flex items-center justify-center gap-2 py-2 mb-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors"
        >
          <Plus size={16} />
          <span>New Chat</span>
        </button>
      </div>

      <div className="flex-grow overflow-y-auto">
        <ul className="space-y-1 p-2">
          {chats.length === 0 ? (
            <li className="text-gray-200 text-sm p-3">No chats yet. Create one to get started!</li>
          ) : (
            chats.map(chat => (
              <li key={chat.id}>
                <div 
                  className={`relative flex items-center justify-between w-full rounded-md transition-colors ${
                    isChatSelected(chat.id)
                      ? 'bg-pink-100 text-purple-800' 
                      : activeChatId === chat.id
                        ? 'bg-purple-600 text-white shadow-md' 
                        : 'hover:bg-purple-100 text-purple-700'
                  }`}
                >
                  <div className="flex items-center flex-grow min-w-0 pr-1">
                    {/* Checkbox for multi-select mode */}
                    {multiSelectMode && (
                      <div 
                        className="ml-2 mr-1 flex-shrink-0"
                        onClick={(e) => toggleChatSelection(chat.id, e)}
                      >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                          isChatSelected(chat.id) 
                            ? 'bg-purple-600 border-purple-600' 
                            : 'border-gray-300'
                        }`}>
                          {isChatSelected(chat.id) && <Check size={12} className="text-white" />}
                        </div>
                      </div>
                    )}
                    
                    {/* Chat info */}
                    <button
                      onClick={() => setActiveChat(chat.id)}
                      className={`flex-grow min-w-0 text-left px-3 py-2.5 rounded-md flex items-center space-x-3`}
                    >
                      <MessageSquare size={20} className="flex-shrink-0" />
                      <div className="flex flex-col overflow-hidden flex-grow min-w-0">
                        <span className="truncate font-medium">{chat.name}</span>
                        <span className="text-xs opacity-75 truncate">
                          {chat.messages.length > 0 
                            ? shortenPrompt(chat.messages[0].text, 30)
                            : 'Empty chat'}
                        </span>
                      </div>
                    </button>
                  </div>
                  
                  {/* Delete button - only shown in non-multi-select mode */}
                  {!multiSelectMode && (
                    <button
                      onClick={(e) => handleDeleteChat(chat.id, e)}
                      className="p-1.5 mx-2 flex-shrink-0 rounded-md text-inherit opacity-70 hover:opacity-100 hover:bg-red-100 hover:text-red-600"
                      title="Delete chat"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}

export default ChatSelector;
