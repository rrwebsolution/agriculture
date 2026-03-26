import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';

// Note: This is for testing purposes only. 
// When you deploy this app, it is highly recommended to store the API key in a .env file.
const ai = new GoogleGenAI({ apiKey: 'AIzaSyD75uFuhwTb0ldWEPcesdvel7QlBzao4iA' });

const AiChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    setIsLoading(true);
    setResponse(''); // Clear the previous response

    try {
      const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `You are an AI Agriculture Assistant for LGU Gingoog. Answer this: ${input}`,
      });
      
      // Fallback string added to prevent TypeScript errors if result is undefined
      setResponse(result.text || "Sorry, the AI couldn't generate a response right now.");
      
    } catch (error) {
      console.error("Error connecting to Gemini:", error);
      setResponse("Sorry, there was an error connecting to the server.");
    }

    setIsLoading(false);
  };

  // BAG-O: Function para i-restart/i-clear ang chat
  const handleRestart = () => {
    setInput('');
    setResponse('');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 overflow-hidden flex flex-col transition-all duration-300">
          
          {/* HEADER AREA */}
          <div className="bg-primary p-4 text-white flex justify-between items-center">
            <h3 className="font-bold">Agri AI Assistant 🌱</h3>
            
            <div className="flex items-center gap-4">
              {/* RESTART BUTTON */}
              <button 
                onClick={handleRestart} 
                className="text-white hover:text-gray-200 transition-transform hover:scale-110" 
                title="Restart Chat"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>

              {/* CLOSE BUTTON */}
              <button onClick={() => setIsOpen(false)} className="text-white hover:text-gray-200 font-bold" title="Close">
                ✕
              </button>
            </div>
          </div>

          <div className="p-4 h-64 overflow-y-auto bg-gray-50 dark:bg-slate-800 text-sm text-gray-800 dark:text-gray-200">
            {isLoading ? (
              <p className="animate-pulse italic">AI is thinking...</p>
            ) : response ? (
              <div className="whitespace-pre-wrap">{response}</div>
            ) : (
              <p className="text-gray-500 italic">How can I help you with agriculture today?</p>
            )}
          </div>

          <div className="p-3 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask your question here..."
              className="flex-1 p-2 border rounded-lg dark:bg-slate-800 dark:text-white dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={isLoading}
              className="bg-primary hover:bg-primary/75 text-white px-4 py-2 rounded-lg font-medium transition disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer bg-primary hover:bg-primary/80 text-white p-4 rounded-full shadow-lg items-center justify-center transition-transform hover:scale-110 ml-auto block"
        title="Ask AI"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </button>
    </div>
  );
};

export default AiChatWidget;