import React, { useState, useRef, useEffect } from 'react';

// Custom hook for typewriter effect
const useTypewriter = (text: string, speed: number = 50) => {
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    let i = 0;
    const typingInterval = setInterval(() => {
      if (i < text.length) {
        setDisplayText(prevText => prevText + text.charAt(i));
        i++;
      } else {
        clearInterval(typingInterval);
      }
    }, speed);

    return () => {
      clearInterval(typingInterval);
    };
  }, [text, speed]);

  return displayText;
};

// Typewriter component
const Typewriter = ({ text, speed }: { text: string; speed: number }) => {
  const displayText = useTypewriter(text, speed);

  return <p>{displayText}</p>;
};

interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  isTyping?: boolean;
}

// Add keyframes for fade-in animation
const fadeInAnimation = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

// Add typing animation
const typingAnimation = `
  @keyframes typing {
    from { width: 0 }
    to { width: 100% }
  }
`;

// Implement a faster letter-by-letter fade-in effect with proper spacing
const LetterFadeIn = ({ text }: { text: string }) => {
  return (
    <span>
      {text.split('').map((char, index) => (
        <span
          key={index}
          style={{
            display: 'inline-block',
            opacity: 0,
            animation: `fadeIn 0.3s ease-in-out forwards`,
            animationDelay: `${index * 0.03}s`,
            whiteSpace: 'pre', // Preserve spaces
            fontSize: '15px', // Set text size to 15px
          }}
        >
          {char}
        </span>
      ))}
    </span>
  );
};

interface ChatInterfaceProps {
  fileId: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ fileId }) => {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: "Hello! I'm Papermind AI. Ask me anything about your document.",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [typingText, setTypingText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [currentTypingIndex, setCurrentTypingIndex] = useState(-1);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages, isProcessing, typingText]);

  // Handle typing animation for the latest AI message
  useEffect(() => {
    const typingMessage = chatMessages.findIndex(msg => msg.isTyping === true);
    
    if (typingMessage !== -1 && typingMessage !== currentTypingIndex) {
      setCurrentTypingIndex(typingMessage);
      setTypingText('');
      setIsTypingComplete(false);
      
      const message = chatMessages[typingMessage].content;
      let index = 0;
      
      const typingInterval = setInterval(() => {
        if (index < message.length) {
          setTypingText(prev => prev + message.charAt(index));
          index++;
        } else {
          clearInterval(typingInterval);
          setIsTypingComplete(true);
          
          // Update the message to remove the typing flag
          setChatMessages(prev => 
            prev.map((msg, i) => 
              i === typingMessage ? { ...msg, isTyping: false } : msg
            )
          );
          
          setCurrentTypingIndex(-1); // Reset currentTypingIndex after completion
        }
      }, 100); // Speed of typing
      
      return () => clearInterval(typingInterval);
    }
  }, [chatMessages, currentTypingIndex]);

  // Handle sending a chat message
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isProcessing) return;
    
    // Add user message to chat
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputMessage,
      isUser: true,
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsProcessing(true);
    
    try {
      // Fetch response from our FastAPI endpoint
      const response = await fetch('http://localhost:8000/test');
      const data = await response.json();
      
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: data.message,
        isUser: false,
        timestamp: new Date(),
        isTyping: true
      };
      
      setChatMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error fetching response:', error);
      // Show error message in chat
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, I'm having trouble connecting to the AI service. Please check your internet connection and try again.",
        isUser: false,
        timestamp: new Date(),
        isTyping: true
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);
  };
  
  // Handle pressing Enter to send message
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Add the keyframes for the animations */}
      <style>{fadeInAnimation}</style>
      
      {/* Custom scrollbar styles */}
      <style>{`
        /* Custom scrollbar */
        .chat-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        
        .chat-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .chat-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(0, 0, 0, 0.08);
          border-radius: 20px;
        }
        
        .chat-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(0, 0, 0, 0.15);
        }
      `}</style>
      
      {/* Chat messages area - taking up all available space except for input area */}
      <div 
        ref={chatContainerRef} 
        className="flex-1 overflow-y-auto px-4 pt-4 pb-2 chat-scrollbar"
        style={{ height: 'calc(100% - 70px)' }}
      >
        {chatMessages.map((message, index) => (
          <div key={message.id} className={`flex mb-6 ${message.isUser ? 'justify-end' : 'justify-start'}`}>
            {!message.isUser && (
              <div className="flex-shrink-0 mr-3">
                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-gray-800 text-xs font-bold">AI</span>
                </div>
              </div>
            )}
            
            {message.isUser ? (
              <div className="bg-gray-200 p-3 rounded-lg max-w-[80%]">
                <p className="text-sm text-gray-800">{message.content}</p>
              </div>
            ) : (
              <div className="max-w-[80%]">
                <LetterFadeIn text={message.content} />
              </div>
            )}
          </div>
        ))}
        
        {/* Loading indicator */}
        {isProcessing && (
          <div className="flex mb-6 justify-start">
            <div className="flex-shrink-0 mr-3">
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-gray-800 text-xs font-bold">AI</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}
      </div>
      
      {/* Input area - fixed at the bottom */}
      <div className="px-4 py-3 border-t mt-auto" style={{ height: '70px' }}>
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="Ask a question about your document..."
            className="flex-1 border border-gray-300 rounded-full py-2 pl-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm"
            value={inputMessage}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
          />
          <button
            className="absolute right-1 bg-purple-500 text-white p-2 rounded-full hover:bg-purple-600 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
            onClick={handleSendMessage}
            disabled={isProcessing}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface; 