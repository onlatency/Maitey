import React from 'react';
import { MessageSquare } from 'lucide-react'; 
import { useChatContext } from '../context/ChatContext';
import { shortenPrompt } from '../utils/imageUtils';

function ChatList() {
  const { chats, activeChatId, setActiveChat } = useChatContext();

  return (
    <div className="flex-grow overflow-y-auto">
      <ul className="space-y-1 p-2">
        {chats.length === 0 ? (
          <li className="text-gray-200 text-sm p-3">No chats yet. Create one to get started!</li>
        ) : (
          chats.map(chat => (
            <li key={chat.id}>
              <button
                onClick={() => setActiveChat(chat.id)}
                className={`w-full text-left px-3 py-2.5 rounded-md flex items-center space-x-3 transition-colors 
                  ${activeChatId === chat.id ? 'bg-purple-600 text-white shadow-md' : 'hover:bg-purple-700 hover:text-gray-100 text-gray-300'}`}
              >
                <MessageSquare size={20} className="flex-shrink-0" />
                <div className="flex flex-col overflow-hidden">
                  <span className="truncate font-medium">{chat.name}</span>
                  <span className="text-xs opacity-75 truncate">
                    {chat.messages.length > 0 
                      ? shortenPrompt(chat.messages[0].text, 30)
                      : 'Empty chat'}
                  </span>
                </div>
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export default ChatList;
