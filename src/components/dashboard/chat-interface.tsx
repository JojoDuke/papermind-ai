import React, { useState, useRef, useEffect, FC } from 'react';
import { supabase } from '../../lib/supabase';
import { Loader2 } from 'lucide-react';
import { useToast } from "../ui/use-toast";
import { useCredits } from "@/contexts/CreditsContext";
import { UpgradeModal } from "./upgrade-modal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Coins, Sparkles } from 'lucide-react';

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

// Add shimmer effect component
const ShimmerMessage = () => (
  <div className="animate-pulse space-y-4">
    {[1, 2, 3].map((i) => (
      <div key={i} className={`flex mb-6 ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
        {i % 2 !== 0 && (
          <div className="flex-shrink-0 mr-3">
            <div className="w-8 h-8 rounded-full bg-gray-200"></div>
          </div>
        )}
        <div className={`rounded-lg ${i % 2 === 0 ? 'bg-gray-200' : 'bg-gray-100'} h-16`} style={{ width: `${Math.random() * 30 + 40}%` }}></div>
      </div>
    ))}
  </div>
);

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
    <div className="rounded-lg">
      <div className="text-gray-800" style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
        {text.split('').map((char, index) => (
          <span
            key={index}
            style={{
              display: 'inline',
              opacity: 0,
              animation: `fadeIn 0.3s ease-in-out forwards`,
              animationDelay: `${index * 0.01}s`,
              fontSize: '15px'
            }}
          >
            {char}
          </span>
        ))}
      </div>
    </div>
  );
};

interface ChatInterfaceProps {
  fileId: string;
  fileName?: string;
  collectionId?: string;
}

const ChatInterface: FC<ChatInterfaceProps> = ({ fileId, fileName, collectionId }) => {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTypingIndex, setCurrentTypingIndex] = useState(-1);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [typingText, setTypingText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const { toast } = useToast();
  const { credits, isPremium, updateCredits } = useCredits();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showPurchaseCreditsModal, setShowPurchaseCreditsModal] = useState(false);

  const loadChatMessages = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: messages, error: fetchError } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('file_id', fileId)
        .eq('user_id', user.id)
        .order('timestamp', { ascending: true });

      if (fetchError) throw new Error(fetchError.message);

      if (messages) {
        setChatMessages(messages.map(msg => ({
          id: msg.id,
          content: msg.content,
          isUser: msg.is_user,
          timestamp: new Date(msg.timestamp)
        })));
      } else {
        setChatMessages([]);
      }
    } catch (err) {
      console.error('Error loading messages:', err);
      setError('Failed to load chat messages. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Save a chat message to Supabase
  const saveChatMessage = async (message: ChatMessage) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('chat_messages')
        .insert([{
          file_id: fileId,
          content: message.content,
          is_user: message.isUser,
          user_id: user.id,
          timestamp: message.timestamp.toISOString()
        }]);

      if (error) throw error;
    } catch (error) {
      console.error('Error saving chat message:', error);
      setError('Failed to save message. Please try again.');
    }
  };

  // Load chat messages when component mounts or fileId changes
  useEffect(() => {
    loadChatMessages();
  }, [fileId]);

  // Initialize chat with welcome message if empty
  useEffect(() => {
    const initializeChat = async () => {
      if (chatMessages.length === 0 && !isLoading && !error) {
        const welcomeMessage: ChatMessage = {
          id: 'welcome',
          content: 'Hello! I\'m here to help you analyze this document. What would you like to know?',
          isUser: false,
          timestamp: new Date()
        };
        await saveChatMessage(welcomeMessage);
        setChatMessages([welcomeMessage]);
      }
    };

    initializeChat();
  }, [isLoading, error]);

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

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || isProcessing) return;

    // Check if user has credits
    if (credits === 0) {
      if (isPremium) {
        setShowPurchaseCreditsModal(true);
      } else {
        setShowUpgradeModal(true);
      }
      return;
    }

    try {
      setIsProcessing(true);
      setInputMessage('');

      // Add user message to chat
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        content: message,
        isUser: true,
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, userMessage]);
      await saveChatMessage(userMessage);

      // Deduct credits for all users if they have credits available
      if (credits > 0) {
        try {
          await updateCredits(credits - 1);
        } catch (err: unknown) {
          if (err instanceof Error) {
            throw err;
          }
          throw new Error('Failed to deduct credit');
        }
      }

      // Send message to backend API
      const response = await fetch('https://papermind-ai-backend.onrender.com/query-collection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message.trim(),
          collection_id: collectionId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response from AI');
      }

      const data = await response.json();

      // Create and save AI response
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: data.message,
        isUser: false,
        timestamp: new Date(),
        isTyping: true
      };

      setChatMessages(prev => [...prev, aiMessage]);
      await saveChatMessage(aiMessage);

    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message to chat
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: "I apologize, but I'm having trouble connecting to the AI service. Please check your internet connection and try again.",
        isUser: false,
        timestamp: new Date(),
        isTyping: true
      };
      
      setChatMessages(prev => [...prev, errorMessage]);
      await saveChatMessage(errorMessage);
      setError('Failed to send message. Please try again.');
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
      handleSendMessage(inputMessage);
    }
  };

  return (
    <>
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
        {isLoading ? (
          <ShimmerMessage />
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="text-red-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-sm text-gray-600">{error}</p>
              <button
                onClick={loadChatMessages}
                className="px-4 py-2 text-sm font-medium text-white bg-purple-500 rounded-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : (
          <>
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
          </>
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
            onClick={() => handleSendMessage(inputMessage)}
            disabled={isProcessing}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </button>
        </div>
      </div>
      <UpgradeModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)} 
      />
      <Dialog open={showPurchaseCreditsModal} onOpenChange={setShowPurchaseCreditsModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-purple-500" />
              Purchase Additional Credits
            </DialogTitle>
            <DialogDescription>
              Get 50 more credits to continue using the chat feature.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-500">
              You've used all your 100 credits. No worries! You can purchase an additional package of credits:
            </p>
            <ul className="list-disc pl-4 text-sm text-gray-500 space-y-2">
              <li>50 additional credits</li>
              <li>One-time purchase</li>
              <li>Instant activation</li>
              <li>Use anytime</li>
            </ul>
          </div>
          <div className="flex justify-center w-full gap-2">
            <Button 
              onClick={() => {
                // Logic to handle purchasing credits
                setShowPurchaseCreditsModal(false);
              }}
              className="flex-1 bg-gradient-to-r from-purple-500 via-purple-600 to-indigo-500 hover:from-purple-600 hover:via-purple-700 hover:to-indigo-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <Sparkles className="h-5 w-5" />
              Purchase Credits ($5)
            </Button>
            <Button
              onClick={() => setShowPurchaseCreditsModal(false)}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ChatInterface; 