import React from 'react';
import { useChatContext } from '../context/ChatContext';
import ImageCard from './ImageCard';

function ImageGallery() {
  const { getActiveChat, isLoading, activeGenerations } = useChatContext();
  const activeChat = getActiveChat();

  // Add logging to debug the active chat and messages
  console.log('Active Chat:', activeChat);

  // Extract all image messages from the active chat
  const imageMessages = activeChat?.messages?.filter(msg => 
    msg.type === 'image' || msg.images?.length > 0
  ) || [];
  
  console.log('Image Messages:', imageMessages);

  return (
    <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
      {activeChat ? (
        <div className="gallery-container">
          {imageMessages.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center p-8 text-center text-gray-400">
              <p className="mb-2 text-lg">No images generated yet.</p>
              <p className="text-sm">Enter a prompt below to create your first image!</p>
            </div>
          ) : (
            // Map through all messages that contain images
            imageMessages.map(message => {
              console.log('Rendering message:', message);
              // If the message has an images array (new format)
              if (message.images && message.images.length > 0) {
                console.log('Message has images array:', message.images);
                // Create a card for each image in the message
                return message.images.map((image, index) => {
                  console.log('Creating card for image:', image);
                  return (
                    <ImageCard
                      key={`${message.id}-${index}`}
                      image={image}
                      prompt={message.text}
                      messageId={message.id}
                      status={message.status}
                    />
                  );
                });
              } 
              // For backward compatibility with old format
              else if (message.url) {
                console.log('Message has url:', message.url);
                return (
                  <ImageCard
                    key={message.id}
                    image={{ url: message.url, timestamp: message.timestamp }}
                    prompt={message.text}
                    messageId={message.id}
                    status={message.status}
                  />
                );
              }
              console.log('Message has no images or url:', message);
              return null;
            }).flat() // Flatten because map within map returns nested arrays
          )}
          
          {/* Show a placeholder card for the image being generated */}
          {isLoading && (
            <ImageCard isLoading={true} />
          )}
        </div>
      ) : (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-400">Select a chat or create a new one to start.</p>
        </div>
      )}
    </div>
  );
}

export default ImageGallery;
