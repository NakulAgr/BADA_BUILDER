import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Home, Calculator, Calendar, Phone, Bot, User, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Shadcn UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const Chatbot = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { type: 'bot', text: 'Hello! 👋 Welcome to Bada Builder. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickActions = [
    { icon: Home, label: 'Find Property', action: () => navigate('/exhibition') },
    { icon: Calculator, label: 'Calculator', action: () => navigate('/npv-calculator') },
    { icon: Calendar, label: 'Book Visit', action: () => navigate('/booksitevisit') },
    { icon: Phone, label: 'Contact Us', action: () => navigate('/contact') },
  ];

  const getBotResponse = (userMessage) => {
    const msg = userMessage.toLowerCase();
    if (msg.includes('hello') || msg.includes('hi')) {
      return "Hi there! I'm here to help you find your perfect property. What are you looking for?";
    }
    if (msg.includes('property') || msg.includes('home') || msg.includes('house')) {
      return "Great! We have amazing properties across India. Would you like to browse our listings or tell me your specific requirements?";
    }
    if (msg.includes('price') || msg.includes('cost') || msg.includes('budget')) {
      return "We have properties across all budget ranges. Could you share your preferred budget range?";
    }
    if (msg.includes('location') || msg.includes('city') || msg.includes('area')) {
      return "We operate in 50+ cities across India including Mumbai, Delhi, Bangalore, and more. Which location interests you?";
    }
    if (msg.includes('visit') || msg.includes('book')) {
      return "You can book a site visit through our website. Shall I redirect you to the booking page?";
    }
    if (msg.includes('contact') || msg.includes('call') || msg.includes('speak')) {
      return "You can reach us at +91 98765 43210 or visit our Contact page. Would you like me to take you there?";
    }
    return "Thanks for your message! Our team will get back to you soon. Meanwhile, feel free to explore our properties or use the quick actions above.";
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { type: 'user', text: userMessage }]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const response = getBotResponse(userMessage);
      setMessages(prev => [...prev, { type: 'bot', text: response }]);
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg",
          "flex items-center justify-center transition-colors",
          isOpen ? "bg-gray-100 text-gray-900" : "bg-gray-900 text-white hover:bg-gray-800"
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <MessageCircle className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-gray-900 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Bada Builder Assistant</h3>
                  <div className="flex items-center gap-1 text-xs text-gray-300">
                    <span className="w-2 h-2 rounded-full bg-green-400"></span>
                    Online
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="p-3 bg-gray-50 border-b border-gray-100">
              <div className="flex gap-2 overflow-x-auto pb-1">
                {quickActions.map((action, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    size="sm"
                    onClick={action.action}
                    className="shrink-0 gap-1.5 text-xs border-gray-200 text-gray-600 hover:bg-white rounded-full"
                  >
                    <action.icon className="w-3 h-3" />
                    {action.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Messages */}
            <div className="h-80 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex gap-2",
                    msg.type === 'user' ? 'flex-row-reverse' : ''
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                    msg.type === 'user' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'
                  )}>
                    {msg.type === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={cn(
                    "max-w-[75%] px-4 py-2.5 text-sm rounded-2xl",
                    msg.type === 'user' 
                      ? 'bg-gray-900 text-white rounded-br-sm' 
                      : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                  )}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-2"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-100 bg-white">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="flex-1 bg-gray-50 border-gray-200"
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="bg-gray-900 text-white hover:bg-gray-800"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;
