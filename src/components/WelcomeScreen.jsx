import React from 'react';
import { useChatContext } from '../context/ChatContext';
import { Sparkles, Image as ImageIcon } from 'lucide-react';

function WelcomeScreen() {
  const { createNewChat, addMessage, setActiveChat } = useChatContext();

  // Suggested sample prompts with descriptions
  const samplePrompts = [
    {
      title: 'Tiger on Skateboard',
      prompt: 'photorealistic image of a tiger skateboarding doing a kickflip on a stairway at white-house',
      id: 'tiger-skateboard'
    },
    {
      title: 'Goats in Coats',
      prompt: 'Goats wearing coats',
      id: 'goats-coats'
    },
    {
      title: 'Research AI campaigns',
      prompt: 'AI-driven marketing campaign visualization for annual planning',
      id: 'ai-campaigns'
    },
    {
      title: 'Research battery tech',
      prompt: 'Futuristic battery technology visualization for a market analysis',
      id: 'battery-tech'
    },
    {
      title: 'Research sensor trends',
      prompt: 'Advanced sensor technology visualization for robotics essay',
      id: 'sensor-trends'
    }
  ];

  // Handle clicking a suggested prompt
  const handleSuggestionClick = (prompt) => {
    // Create a new chat with the suggestion as the name
    const chatId = createNewChat(prompt.title);
    
    // We need to wait for the chat to be created before adding a message
    setTimeout(() => {
      // Add the prompt message
      const messageId = {
        id: 1,
        type: 'prompt',
        text: prompt.prompt
      };
      addMessage(messageId);
    }, 100);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-50 p-6 text-center">
      <div className="max-w-2xl w-full">
        <div className="mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 text-white p-4 rounded-full">
              <ImageIcon size={32} />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome to Venice Image Chat</h1>
          <p className="text-gray-600 mb-8">
            Generate amazing images with just a text prompt. Choose a suggestion below or create your own.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {samplePrompts.map((prompt) => (
            <button
              key={prompt.id}
              onClick={() => handleSuggestionClick(prompt)}
              className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg text-left hover:bg-gray-50 hover:border-blue-300 transition-all shadow-sm"
            >
              <div>
                <div className="font-medium text-gray-800">{prompt.title}</div>
                <div className="text-sm text-gray-500 truncate">{prompt.prompt}</div>
              </div>
              <Sparkles size={18} className="text-blue-500 ml-2 flex-shrink-0" />
            </button>
          ))}
        </div>

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <h3 className="font-medium text-blue-800 mb-2 flex items-center">
            <Sparkles size={16} className="mr-2" />
            Pro Tip
          </h3>
          <p className="text-blue-700 text-sm">
            Be detailed in your prompts. Try specifying styles, settings, lighting, 
            and other details for better results.
          </p>
        </div>
      </div>
    </div>
  );
}

export default WelcomeScreen;
