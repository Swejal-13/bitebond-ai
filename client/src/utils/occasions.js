/**
 * Occasion configuration — shared across Occasion Planner, Cart, Gift pages
 */

export const OCCASIONS = [
  { key: 'birthday',         label: 'Birthday',         emoji: '🎂', color: 'from-pink-400 to-rose-400',    description: 'Make their day unforgettable' },
  { key: 'anniversary',      label: 'Anniversary',      emoji: '💑', color: 'from-red-400 to-pink-500',     description: 'Celebrate your love story' },
  { key: 'festival',         label: 'Festival',         emoji: '🎊', color: 'from-amber-400 to-orange-400', description: 'Spread festive cheer' },
  { key: 'congratulations',  label: 'Congratulations',  emoji: '🎉', color: 'from-purple-400 to-indigo-400',description: 'Celebrate their achievement' },
  { key: 'thank_you',        label: 'Thank You',        emoji: '🙏', color: 'from-teal-400 to-cyan-400',    description: 'Show your appreciation' },
  { key: 'get_well_soon',    label: 'Get Well Soon',    emoji: '💙', color: 'from-blue-400 to-sky-400',     description: 'Send healing wishes' },
];

export const getOccasion = (key) => OCCASIONS.find((o) => o.key === key);
