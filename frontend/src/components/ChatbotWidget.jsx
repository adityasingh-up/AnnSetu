import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, HelpCircle, MessageSquare, Zap } from 'lucide-react';
import axios from 'axios';

// Smart offline AI knowledge engine for AnnSetu
const getIntelligentAIAnswer = (query) => {
  const q = query.toLowerCase();
  
  if (q.includes('freshness') || q.includes('shelf') || q.includes('safe') || q.includes('expire')) {
    return "🧠 **AI Freshness Engine**: Cooked meals at room temperature generally remain safe for 4–6 hours. Refrigerated at 4°C, they stay fresh up to 24–36 hours. Our ML algorithm analyzes preparation timestamp, ambient temperature, and food category to calculate safe dispatch urgency.";
  }
  if (q.includes('donate') || q.includes('donor') || q.includes('surplus') || q.includes('food')) {
    return "🥗 **How to Donate**: Simply navigate to your **Donor Dashboard** and click **'Donate Surplus Food'**. Enter the title, quantity (Kg), cooking time, and pickup address. Our system automatically alerts nearest volunteers via geospatial radar.";
  }
  if (q.includes('volunteer') || q.includes('pickup') || q.includes('mission')) {
    return "🚴 **Volunteer Missions**: Once logged in as a Volunteer, check the **Rescue Radar**. Accept any nearby donation, navigate to the donor's address, verify physical handover with the **6-digit OTP**, and deliver to the assigned NGO shelter.";
  }
  if (q.includes('otp') || q.includes('verify') || q.includes('code')) {
    return "🔐 **OTP Handover Protocol**: A unique 6-digit cryptographic OTP is generated for each rescue. When the volunteer reaches the donor's premises, the donor shares this OTP. The volunteer enters it into their app to unlock transit authorization.";
  }
  if (q.includes('ngo') || q.includes('shelter') || q.includes('distribute')) {
    return "🏢 **NGO Management**: Verified NGOs can log in to track incoming shipments, verify storage temperature, and click **'Record Distribution'** to log beneficiary meals served for full audit transparency.";
  }
  if (q.includes('co2') || q.includes('carbon') || q.includes('emission') || q.includes('environment')) {
    return "🌱 **Environmental Impact**: Every 1 Kg of food saved from landfills prevents approximately **2.5 Kg of CO₂ equivalent greenhouse gas emissions** (primarily methane). AnnSetu tracks your total carbon offset live!";
  }
  if (q.includes('hello') || q.includes('hi') || q.includes('hey')) {
    return "👋 Hello! I am AnnSetu AI Assistant. I can help you with food freshness audits, donation guidelines, volunteer dispatching, OTP verification, and environmental impact metrics. What would you like to know?";
  }
  
  return "🤖 **AnnSetu AI Rescue Advice**: To ensure food quality, pack surplus meals in clean, sealed containers with clear labels. You can post donations directly on your dashboard or accept nearby missions as a volunteer!";
};

export const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello! I am AnnSetu AI Assistant. Ask me about food freshness estimation, donation logistics, volunteer missions, or carbon offset!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const quickPrompts = [
    "How to donate surplus food?",
    "How does AI freshness work?",
    "How does OTP handover work?",
    "Volunteer badges & points"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendQuery = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    setMessages((prev) => [...prev, { sender: 'user', text: query }]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      // Try external AI service with 2s timeout
      const res = await axios.post('http://127.0.0.1:8000/chatbot', { query }, { timeout: 2000 });
      const botResponse = res.data?.answer || getIntelligentAIAnswer(query);
      setMessages((prev) => [...prev, { sender: 'bot', text: botResponse }]);
    } catch (err) {
      // Offline fallback: use local knowledge engine
      const intelligentAnswer = getIntelligentAIAnswer(query);
      setMessages((prev) => [...prev, { sender: 'bot', text: intelligentAnswer }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    handleSendQuery(input);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center shadow-2xl shadow-emerald-600/40 hover:scale-110 active:scale-95 transition-all group border-2 border-white/20"
          title="AnnSetu AI Assistant"
        >
          <Bot className="w-7 h-7 group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white animate-ping"></span>
        </button>
      ) : (
        <div className="w-80 sm:w-96 h-[520px] bg-white dark:bg-[#131b2e] rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          
          {/* Chat Header */}
          <div className="p-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm">AnnSetu AI Rescue Bot</h4>
                <div className="flex items-center space-x-1 text-[10px] text-emerald-100">
                  <span className="w-2 h-2 rounded-full bg-emerald-300 inline-block animate-pulse"></span>
                  <span>AI Freshness & Logistics Assistant</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50 dark:bg-[#0b0f17]/50">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl text-xs font-medium leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-br-none shadow-md'
                      : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-bl-none shadow-sm'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center space-x-2 text-xs text-emerald-500 font-bold animate-pulse p-2">
                <Sparkles className="w-4 h-4" />
                <span>AI analyzing rescue query...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Chips */}
          <div className="px-3 py-2 bg-gray-100 dark:bg-gray-900/60 border-t border-gray-200 dark:border-gray-800 flex gap-1.5 overflow-x-auto">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendQuery(p)}
                className="text-[10px] px-2.5 py-1 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-emerald-500 hover:text-emerald-500 whitespace-nowrap shrink-0 transition-all font-semibold"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form onSubmit={handleSend} className="p-3 border-t border-gray-200 dark:border-gray-800 flex items-center space-x-2 bg-white dark:bg-[#131b2e]">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about food rescue, safety..."
              className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white disabled:opacity-50 transition-all shadow-md"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
    </div>
  );
};

