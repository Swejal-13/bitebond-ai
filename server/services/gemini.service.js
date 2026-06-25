/**
 * Gemini AI Service
 * Wraps Google Gemini API calls for all AI features.
 * Uses the free-tier Gemini model via REST (no SDK dependency needed).
 *
 * Set GEMINI_API_KEY in .env — get a free key at https://aistudio.google.com/apikey
 */

const axios = require('axios');

const GEMINI_MODEL = 'gemini-2.0-flash';
const GEMINI_BASE_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

/**
 * Low-level call to Gemini's generateContent endpoint.
 * @param {string} prompt — the full prompt text
 * @param {object} options — { temperature, maxOutputTokens, jsonMode }
 */
const callGemini = async (prompt, options = {}) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_gemini_api_key') {
    throw new GeminiNotConfiguredError();
  }

  const { temperature = 0.7, maxOutputTokens = 1024, jsonMode = false } = options;

  try {
    const response = await axios.post(
      `${GEMINI_BASE_URL}?key=${apiKey}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature,
          maxOutputTokens,
          ...(jsonMode && { responseMimeType: 'application/json' }),
        },
      },
      { timeout: 15000, headers: { 'Content-Type': 'application/json' } }
    );

    const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Empty response from Gemini');
    return text;
  } catch (error) {
    if (error.response) {
      console.error('Gemini API error:', error.response.status, error.response.data);
      throw new Error(`Gemini API error: ${error.response.data?.error?.message || error.response.status}`);
    }
    throw error;
  }
};

/**
 * Custom error for missing API key — lets controllers fall back gracefully
 */
class GeminiNotConfiguredError extends Error {
  constructor() {
    super('Gemini API key not configured');
    this.name = 'GeminiNotConfiguredError';
  }
}

/**
 * Safely parse JSON from a Gemini response, stripping markdown code fences if present
 */
const parseJsonResponse = (text) => {
  const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    console.error('Failed to parse Gemini JSON response:', cleaned.slice(0, 300));
    throw new Error('AI returned an unexpected format. Please try again.');
  }
};

module.exports = { callGemini, parseJsonResponse, GeminiNotConfiguredError };
