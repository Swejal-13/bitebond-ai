/**
 * AIWishGenerator
 * Compact inline widget: pick a tone, generate an AI wish, insert into a target field
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiZap, FiRefreshCw, FiCheck } from 'react-icons/fi';
import aiService from '../../services/aiService';
import toast from 'react-hot-toast';

const TONES = [
  { val: 'birthday', label: '🎂 Birthday' },
  { val: 'romantic', label: '💕 Romantic' },
  { val: 'funny', label: '😄 Funny' },
  { val: 'emotional', label: '🥹 Emotional' },
];

const AIWishGenerator = ({ recipientName = '', onInsert }) => {
  const [open, setOpen] = useState(false);
  const [tone, setTone] = useState('birthday');
  const [context, setContext] = useState('');
  const [wish, setWish] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const data = await aiService.generateWish({ recipientName, tone, context });
      setWish(data.wish);
    } catch {
      toast.error('Could not generate wish. Try again.');
    } finally { setLoading(false); }
  };

  const handleInsert = () => {
    onInsert(wish);
    setOpen(false);
    toast.success('Wish added! ✨');
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-xs font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 transition-colors">
        <FiZap size={13} /> Generate with AI ✨
      </button>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
      className="mt-2 p-3 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
          <FiZap size={12} /> AI Wish Generator
        </p>
        <button onClick={() => setOpen(false)} className="text-xs text-gray-400 hover:text-gray-600">Close</button>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-2">
        {TONES.map((t) => (
          <button key={t.val} onClick={() => setTone(t.val)}
            className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all ${
              tone === t.val ? 'bg-purple-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <input value={context} onChange={(e) => setContext(e.target.value)}
        placeholder="Optional context (e.g. 'turning 30', 'best friend')"
        className="w-full text-xs px-3 py-2 rounded-lg border border-purple-200 dark:border-purple-800 bg-white dark:bg-gray-900 mb-2 focus:outline-none focus:ring-1 focus:ring-purple-300" />

      <button onClick={handleGenerate} disabled={loading}
        className="w-full text-xs font-semibold bg-purple-500 hover:bg-purple-600 text-white py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors disabled:opacity-60">
        {loading ? <><FiRefreshCw size={12} className="animate-spin" /> Generating…</> : <><FiZap size={12} /> {wish ? 'Regenerate' : 'Generate Wish'}</>}
      </button>

      <AnimatePresence>
        {wish && (
          <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="mt-2">
            <p className="text-sm text-gray-700 dark:text-gray-300 italic bg-white dark:bg-gray-900 p-2.5 rounded-lg border border-purple-100 dark:border-purple-900">
              "{wish}"
            </p>
            <button onClick={handleInsert}
              className="w-full mt-1.5 text-xs font-semibold bg-green-500 hover:bg-green-600 text-white py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors">
              <FiCheck size={12} /> Use this wish
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AIWishGenerator;
