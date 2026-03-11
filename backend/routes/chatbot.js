const express = require('express');
const router = express.Router();
const axios = require('axios');
const authMiddleware = require('../middleware/auth');

// Groq AI configuration
const GROQ_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.1-70b-versatile';
// Alternative models to try if the default fails
const FALLBACK_MODELS = [
  'llama-3.1-70b-versatile',
  'llama-3.1-8b-instant', 
  'llama-3-70b-8192',
  'llama3-70b-8192',
  'mixtral-8x7b-32768'
];
// base URL for Groq's OpenAI-compatible API
// Use /openai/v1 for chat completions endpoint
const GROQ_URL = process.env.GROQ_URL || 'https://api.groq.com/openai/v1';

// keep a simple in-memory conversation history per user
const conversations = {};

async function callGroq(prompt) {
  if (!GROQ_KEY) {
    // fail early with helpful message
    const msg = 'GROQ_API_KEY is not set';
    console.error(msg);
    throw new Error(msg);
  }
  const systemInstruction = `You are a friendly and empathetic medical assistant from Kenya (But dont insist on the Kenyan lingo. Just Stick to english). Your goal is to help users by asking follow-up questions to understand their concerns better, then provide suggestions.

RULES:
1. Keep your responses SHORT and CONCISE - use 2-3 sentences maximum per response
2. Always ask follow-up questions to gather more information
3. After 3-4 follow-up exchanges, provide possible disease diagnosis, and  clear suggestions or recommendations
4. Use short paragraphs (1-2 sentences each)
5. Be conversational and warm
6. If the user asks about unrelated topics, politely redirect to medical matters
7. Ensure you identify the gender of the user so that you may suggest possible diseases and treatments based on that, as some diseases and treatments are gender-specific. If you don't know the user's gender, ask them for it in a polite way.


Remember: Short responses, ask questions, then suggest!`;
  const fullPrompt = `${systemInstruction}\n${prompt}`;

  // helper that actually makes the request to a given base URL
  async function doRequest(baseUrl, model) {
    const modelToUse = model || GROQ_MODEL;
    console.log('Making Groq request with model:', modelToUse);
    // Use /chat/completions endpoint for Groq's OpenAI-compatible API
    // Combine system instruction into user message to avoid compatibility issues
    const resp = await axios.post(`${baseUrl}/chat/completions`, {
      model: modelToUse,
      messages: [
        { role: 'user', content: `${systemInstruction}\n\nUser: ${prompt}` }
      ],
      max_tokens: 150,
      temperature: 0.7
    }, {
      headers: {
        Authorization: `Bearer ${GROQ_KEY}`,
        'Content-Type': 'application/json'
      },
      validateStatus: () => true
    });
    return resp;
  }

  // Try with fallback models if initial request fails
  async function tryWithFallbacks(baseUrl) {
    // First try with configured/default model
    let resp = await doRequest(baseUrl, GROQ_MODEL);
    
    // If that fails with 400, try fallback models
    if (resp.status === 400) {
      console.warn(`Model ${GROQ_MODEL} failed with 400, trying fallback models...`);
      for (const fallbackModel of FALLBACK_MODELS) {
        if (fallbackModel === GROQ_MODEL) continue; // Skip the one we already tried
        console.log('Trying fallback model:', fallbackModel);
        resp = await doRequest(baseUrl, fallbackModel);
        if (resp.status < 400) {
          console.log('Success with fallback model:', fallbackModel);
          break;
        }
      }
    }
    return resp;
  }

  try {
    // try primary URL first
    let resp = await tryWithFallbacks(GROQ_URL);

    // if we hit a 404, try alternative endpoints
    if (resp.status === 404) {
      // Try with /v1 suffix if not already
      if (!GROQ_URL.endsWith('/v1')) {
        const altUrl = GROQ_URL + '/v1';
        console.warn('Primary Groq URL returned 404, retrying with /v1 suffix', altUrl);
        resp = await tryWithFallbacks(altUrl);
      }
      // Try legacy openai/v1 endpoint
      if (resp.status === 404 && !GROQ_URL.includes('/openai/')) {
        const legacy = GROQ_URL.replace('/v1', '/openai/v1');
        console.warn('Primary Groq URL returned 404, retrying with legacy endpoint', legacy);
        resp = await tryWithFallbacks(legacy);
      }
      if (resp.status === 404) {
        console.error('All Groq endpoints returned 404');
        throw new Error('Received 404 from Groq API endpoint');
      }
    }

    if (resp.status >= 400) {
      const err = new Error(`HTTP ${resp.status}`);
      err.response = resp;
      throw err;
    }

    // Parse response - Groq's chat/completions returns message.content
    let text = resp.data?.choices?.[0]?.message?.content;
    if (!text) {
      console.warn('Groq responded without text', JSON.stringify(resp.data));
      return '';
    }
    
    // Limit response length - truncate if too long (keep around 500 chars max)
    const MAX_LENGTH = 500;
    if (text.length > MAX_LENGTH) {
      // Try to truncate at a sentence boundary
      const truncated = text.substring(0, MAX_LENGTH);
      const lastPeriod = truncated.lastIndexOf('.');
      const lastNewline = truncated.lastIndexOf('\n');
      const cutoff = Math.max(lastPeriod, lastNewline);
      if (cutoff > MAX_LENGTH * 0.5) {
        text = text.substring(0, cutoff + 1);
      } else {
        text = truncated + '...';
      }
    }
    
    return text;
  } catch (err) {
    const status = err.response?.status;
    const data = err.response?.data;
    console.error('Groq API call failed', status, data || err.message);
    
    // Build detailed error message
    let errorMsg = `HTTP ${status}`;
    if (data?.error?.message) {
      errorMsg += `: ${data.error.message}`;
    } else if (data?.message) {
      errorMsg += `: ${data.message}`;
    } else if (err.message) {
      errorMsg = err.message;
    }
    
    if (status === 404) {
      // make the frontend error more descriptive
      throw new Error('Requested Groq URL returned 404 – check GROQ_URL/model/endpoint');
    }
    // Include the actual error for 400 errors to help debug
    throw new Error(errorMsg);
  }
}

// main endpoint used by frontend
router.post('/message', authMiddleware, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message required' });

    const userKey = req.user?.username || req.ip || 'anon';
    const history = conversations[userKey] || [];
    history.push({ role: 'user', content: message });

    const prompt = history.map(h => `${h.role}: ${h.content}`).join('\n');
    const botReply = await callGroq(prompt);

    history.push({ role: 'assistant', content: botReply });
    conversations[userKey] = history;

    res.json({ reply: botReply });
  } catch (err) {
    let msg = err.message || 'unknown'
    console.error('Chat error:', err.response?.status, err.response?.data || msg);
    // common DNS lookup failure
    if (msg.includes('ENOTFOUND')) {
      msg += ' (unable to resolve api.groq.com - check internet/DNS)';
    }
    res.status(500).json({ error: 'Chat service error: ' + msg });
  }
});

// allow the frontend to clear a conversation
router.post('/reset', authMiddleware, (req, res) => {
  try {
    const userKey = req.user?.username || req.ip || 'anon';
    delete conversations[userKey];
    res.json({ reply: "👋 Chat reset! I'm MyAI, your healthcare assistant. How can I help you today?" });
  } catch (err) {
    console.error('Reset error:', err);
    res.status(500).json({ error: 'Reset failed' });
  }
});

module.exports = router;
