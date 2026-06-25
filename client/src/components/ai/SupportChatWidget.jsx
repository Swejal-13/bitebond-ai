/**
 * SupportChatWidget
 * Floating chat bubble + panel, visible app-wide for logged-in users.
 * Uses Gemini-powered /api/ai/chat-support with FAQ context.
 */
import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageCircle, FiX, FiSend, FiZap } from 'react-icons/fi';
import aiService from '../../services/aiService';

const QUICK_PROMPTS = [
  'Where is my order?',
  'How do I cancel an order?',
  'Tell me about loyalty points',
  'What is surprise mode?',
];

const SupportChatWidget = () => {
  const { isAuthenticated } = useSelector((s) => s.auth);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: "Hi! I'm BiteBond's AI assistant 🤖 Ask me about orders, refunds, loyalty points, or anything else!" },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  if (!isAuthenticated) return null;

  const sendMessage = async (text) => {
    const msg = text || input;
    if (!msg.trim() || loading) return;

    setMessages((prev) => [...prev, { role: 'user', text: msg }]);
    setInput('');
    setLoading(true);

    try {
      const data = await aiService.chatSupport(msg);
      setMessages((prev) => [...prev, { role: 'bot', text: data.reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'bot', text: "Sorry, I'm having trouble connecting. Please try again or email support@bitebond.app." }]);
    } finally { setLoading(false); }
  };

  return (
    <>
      {/* Floating button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary-500 hover:bg-primary-600 text-white shadow-glow-primary flex items-center justify-center transition-colors"
        aria-label="Open support chat"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ opacity: 0 }}>
              <FiX size={22} />
            </motion.span>
          ) : (
            <motion.span key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ opacity: 0 }}>
              <FiMessageCircle size={22} />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-50 w-[calc(100vw-3rem)] sm:w-96 h-[28rem] card shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-500 to-accent-500 p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                <FiZap className="text-white" size={16} />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">BiteBond Assistant</p>
                <p className="text-white/70 text-xs flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-300" /> Online · AI Powered
                </p>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-surface-dark">
              {messages.map((m, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-primary-500 text-white rounded-br-md'
                      : 'bg-white dark:bg-surface-dark-card text-gray-700 dark:text-gray-200 rounded-bl-md shadow-sm'
                  }`}>
                    {m.text}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-surface-dark-card px-4 py-3 rounded-2xl rounded-bl-md shadow-sm flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.span key={i} className="w-1.5 h-1.5 rounded-full bg-gray-400"
                        animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />
                    ))}
                  </div>
                </div>
              )}

              {/* Quick prompts — only show initially */}
              {messages.length === 1 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {QUICK_PROMPTS.map((p) => (
                    <button key={p} onClick={() => sendMessage(p)}
                      className="text-xs bg-white dark:bg-surface-dark-card border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1.5 rounded-full hover:border-primary-300 hover:text-primary-600 transition-colors">
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2 bg-white dark:bg-surface-dark-card">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Ask me anything…"
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-gray-100 dark:bg-surface-dark-muted text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-300"
              />
              <button onClick={() => sendMessage()} disabled={loading || !input.trim()}
                className="w-9 h-9 rounded-xl bg-primary-500 hover:bg-primary-600 text-white flex items-center justify-center transition-colors disabled:opacity-50 flex-shrink-0">
                <FiSend size={15} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SupportChatWidget;
