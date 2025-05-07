import React, { useState } from 'react';
import { useChatContext } from '../context/ChatContext';
import { Sparkles, Image as ImageIcon } from 'lucide-react';
import PromptInput from './PromptInput';

function WelcomeScreen() {
  const { 
    createNewChat, 
    addMessage, 
    setActiveChat, 
    setLoading, 
    updateImageMessage, 
    setError 
  } = useChatContext();
  
  const [isGenerating, setIsGenerating] = useState(false);

  // Suggested sample prompts with descriptions
  const samplePrompts = [
    {
      title: 'Tiger on Skateboard',
      prompt: 'photorealistic image of a tiger skateboarding doing a kickflip on a stairway at white-house',
      id: 'tiger-skateboard'
    },
    {
      title: 'Goats in Coats',
      prompt: 'Goats wearing coats in a snowy mountain landscape',
      id: 'goats-coats'
    },
    {
      title: 'Cyberpunk City',
      prompt: 'Cyberpunk cityscape at night with neon lights and flying cars',
      id: 'cyberpunk-city'
    }
  ];

  const [promptText, setPromptText] = useState('');

  // Handle clicking a suggested prompt
  const handleSuggestionClick = (prompt) => {
    setPromptText(prompt.prompt);
  };

  // Handle sending the message
  const handleSendMessage = async (text) => {
    try {
      setIsGenerating(true);
      
      // Create a new chat and set it as active
      const chatId = createNewChat('New Chat');
      
      // Add the prompt message
      const promptMessageId = Date.now();
      addMessage({
        id: promptMessageId,
        type: 'prompt',
        text: text,
        timestamp: new Date().toISOString()
      });
      
      // Add placeholder for image response
      const placeholderImageId = promptMessageId + 1;
      addMessage({
        id: placeholderImageId,
        type: 'image',
        url: '',
        promptText: text, // Save prompt text for regeneration
        isLoading: true,
        status: 'generating',
        text: 'Generating image...'
      });
      
      // Set global loading state
      setLoading(true);
      
      // Import the API function dynamically to avoid circular dependencies
      const { generateImage } = await import('../api/veniceApi');
      
      // Call the API to generate the image
      const imageBlob = await generateImage(text);
      
      // Create an object URL from the blob
      const imageUrl = URL.createObjectURL(imageBlob);
      
      // Update the message with the generated image
      updateImageMessage(placeholderImageId, {
        status: 'complete',
        isLoading: false,
        newImageUrl: imageUrl
      });
    } catch (error) {
      console.error('Error generating image:', error);
      setError(`Failed to generate image: ${error.message}`);
      
      // Update the placeholder with error state
      if (placeholderImageId) {
        updateImageMessage(placeholderImageId, {
          isLoading: false,
          isError: true,
          text: `Error: ${error.message}`
        });
      }
    } finally {
      setLoading(false);
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-50 p-6 text-center">
      <div className="max-w-2xl w-full">
        <div className="mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-purple-600 text-white p-4 rounded-full">
              <ImageIcon size={32} />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome to Maitey Image Chat</h1>
          <p className="text-gray-600 mb-8">
            Create adorable images with just a text prompt! Choose a suggestion below or create your own.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {samplePrompts.map((prompt) => (
            <button
              key={prompt.id}
              onClick={() => handleSuggestionClick(prompt)}
              className="flex flex-col items-start p-4 bg-white border border-gray-200 rounded-lg text-left hover:bg-gray-50 hover:border-purple-300 transition-all shadow-sm"
            >
              <div className="flex items-center justify-between w-full mb-2">
                <div className="font-medium text-gray-800">{prompt.title}</div>
                <Sparkles size={18} className="text-purple-500 ml-2 flex-shrink-0" />
              </div>
              <div className="text-sm text-gray-500 line-clamp-2">{prompt.prompt}</div>
            </button>
          ))}
        </div>

        <div className="mb-8">
          <PromptInput onSendMessage={handleSendMessage} isLoading={isGenerating} value={promptText} />
        </div>

        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
          <h3 className="font-medium text-purple-800 mb-2 flex items-center">
            <Sparkles size={16} className="mr-2" />
            Maitey Tip
          </h3>
          <p className="text-purple-700 text-sm">
            Be detailed in your prompts. Try specifying styles, settings, lighting, 
            and other details for better results!
          </p>
        </div>
      </div>
    </div>
  );
}

export default WelcomeScreen;
