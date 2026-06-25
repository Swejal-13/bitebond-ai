/**
 * OtpInput — 6-digit OTP box component
 * Auto-advances on input, supports paste, backspace navigation
 */

import React, { useRef, useState } from 'react';

const OtpInput = ({ length = 6, onComplete, disabled }) => {
  const [values, setValues] = useState(Array(length).fill(''));
  const inputs = useRef([]);

  const handleChange = (index, e) => {
    const val = e.target.value.replace(/\D/g, '').slice(-1);
    const next = [...values];
    next[index] = val;
    setValues(next);
    if (val && index < length - 1) inputs.current[index + 1]?.focus();
    if (next.every((v) => v !== '')) onComplete(next.join(''));
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (values[index]) {
        const next = [...values];
        next[index] = '';
        setValues(next);
      } else if (index > 0) {
        inputs.current[index - 1]?.focus();
      }
    }
    if (e.key === 'ArrowLeft' && index > 0) inputs.current[index - 1]?.focus();
    if (e.key === 'ArrowRight' && index < length - 1) inputs.current[index + 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!pasted) return;
    const next = Array(length).fill('');
    pasted.split('').forEach((c, i) => { next[i] = c; });
    setValues(next);
    const focusIndex = Math.min(pasted.length, length - 1);
    inputs.current[focusIndex]?.focus();
    if (pasted.length === length) onComplete(pasted);
  };

  return (
    <div className="flex justify-center gap-3">
      {values.map((val, i) => (
        <input
          key={i}
          ref={(el) => (inputs.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={val}
          disabled={disabled}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={i === 0 ? handlePaste : undefined}
          className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 transition-all duration-200
            bg-white dark:bg-surface-dark-muted text-gray-900 dark:text-white
            focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800
            ${val ? 'border-primary-400 bg-primary-50 dark:bg-primary-950' : 'border-gray-200 dark:border-gray-700'}
            disabled:opacity-50 disabled:cursor-not-allowed`}
        />
      ))}
    </div>
  );
};

export default OtpInput;
