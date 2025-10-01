'use client';

import axios from 'axios';
import { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Send, Scan, FileText, Bot } from 'lucide-react';

// Define a type for our chat messages
interface Message {
  role: 'user' | 'assistant';
  content: string;
}
interface Ingredient {
  ingredientName: string;
}

export default function ChromaScan() {
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [ingredientContext, setIngredientContext] = useState<Ingredient[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory, isLoading]);

  useEffect(() => {
    // Small delay to ensure DOM is fully rendered
    const timer = setTimeout(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError('');
    setChatHistory([]);
    setIngredientContext([]);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await axios.post('/api/analyze', formData);
      const data = response.data;

      setChatHistory([{ role: 'assistant', content: data.aiSummary }]);
      if (data.type === 'analysis') {
        setIngredientContext(data.foundIngredients);
      }

    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFollowUpSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const question = formData.get('question') as string;
    if (!question) return;

    const newHistory: Message[] = [...chatHistory, { role: 'user', content: question }];
    setChatHistory(newHistory);
    setIsLoading(true);
    form.reset();

    try {
      const response = await axios.post('/api/chat', {
        question,
        context: ingredientContext,
        chatHistory: newHistory,
      });
      const data = response.data;
      
      setChatHistory([...newHistory, { role: 'assistant', content: data.answer }]);

    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const triggerFileInput = (isCamera: boolean) => {
    if (isCamera) {
      cameraInputRef.current?.click();
    } else {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 text-center slide-in">
      {/* Enhanced Header */}
      <div className="mb-8 sm:mb-12 mt-8">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
          ChromaScan AI
        </h1>
         <p className="text-lg sm:text-xl text-high-contrast mb-4 sm:mb-6 max-w-2xl mx-auto font-medium px-2">
          Advanced AI-powered product label analysis with instant insights and intelligent follow-up
        </p>
        
        {/* Animated scanning bar */}
        <div className="w-24 sm:w-32 h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mb-6 sm:mb-8 glow-animation"></div>
      </div>

      {/* Enhanced Upload Section */}
      <div className="glass-effect rounded-2xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 border border-gray-200/20 dark:border-gray-700/20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {/* Camera Button */}
          <button
            onClick={() => triggerFileInput(true)}
            disabled={isLoading}
            className="group relative p-6 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold transition-all duration-300 hover:scale-105 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Camera className="w-6 h-6" />
              </div>
              <span>Scan with Camera</span>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>

          {/* Upload Button */}
          <button
            onClick={() => triggerFileInput(false)}
            disabled={isLoading}
            className="group relative p-6 rounded-xl glass-effect border border-gray-200/20 dark:border-gray-700/20 font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <div className="relative z-10">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6 text-white" />
              </div>
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Upload Image
              </span>
            </div>
          </button>
        </div>

        {/* Hidden Inputs */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
          disabled={isLoading}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          disabled={isLoading}
        />
      </div>

      {/* Enhanced Results Section */}
      <div className="glass-effect rounded-2xl p-4 sm:p-6 border border-gray-200/20 dark:border-gray-700/20 min-h-[300px] sm:min-h-[400px] text-left mb-6">
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full animate-pulse"></div>
          <h2 className="text-lg sm:text-xl md:text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AI Analysis
          </h2>
        </div>
        
        {error && (
          <div className="p-3 sm:p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-700 dark:text-red-400 mb-3 sm:mb-4 slide-in text-sm sm:text-base">
            {error}
          </div>
        )}
        
        {/* Enhanced Chat Display */}
        <div 
          ref={chatContainerRef} // Add the ref here
          className="space-y-3 sm:space-y-4 max-h-80 sm:max-h-96 overflow-y-auto pr-2 scroll-smooth" // Added scroll-smooth
        >
          {chatHistory.map((msg, index) => (
            <div 
              key={index} 
              className={`p-3 sm:p-4 rounded-xl slide-in text-sm sm:text-base ${
                msg.role === 'assistant' 
                  ? 'glass-effect border border-blue-500/20 text-high-contrast' 
                  : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white ml-4 sm:ml-8'
              }`}
            >
              <div className="flex items-start gap-2 sm:gap-3">
                {msg.role === 'assistant' && (
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-1">
                    <Bot className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                  </div>
                )}
                <div className="flex-1 leading-relaxed">
                  {msg.content}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && chatHistory.length > 0 && (
            <div className="p-3 sm:p-4 glass-effect rounded-xl border border-blue-500/20 text-high-contrast slide-in text-sm sm:text-base">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Bot className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                </div>
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {chatHistory.length === 0 && !isLoading && (
          <div className="text-center py-8 sm:py-12">
            <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <FileText className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-gray-500" />
            </div>
            <p className="text-high-contrast text-sm sm:text-base">
              Your AI-powered analysis will appear here...
            </p>
          </div>
        )}

        {/* Enhanced Follow-up Question Form */}
        {ingredientContext.length > 0 && (
          <form onSubmit={handleFollowUpSubmit} className="mt-4 sm:mt-6 slide-in">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <input
                type="text"
                name="question"
                placeholder="Ask a follow-up question..."
                className="flex-grow p-2.5 sm:p-3 lg:p-4 rounded-xl glass-effect border border-gray-200/20 dark:border-gray-700/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-high-contrast placeholder-gray-600 dark:placeholder-gray-400 text-sm sm:text-base"
                disabled={isLoading}
              />
              <button 
                type="submit" 
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-2.5 sm:py-3 lg:py-2 px-4 sm:px-6 rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 min-w-[100px] sm:min-w-[120px] text-sm sm:text-base whitespace-nowrap flex-shrink-0"
                disabled={isLoading}
              >
                <span>Ask</span>
                <Send className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Loading Overlay */}
      {isLoading && chatHistory.length === 0 && (
        <div className="fixed inset-0 glass-effect flex items-center justify-center z-50">
          <div className="text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-3 sm:mb-4"></div>
            <p className="text-base sm:text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Analyzing your product...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}