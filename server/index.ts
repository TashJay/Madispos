import express from 'express';
import { GoogleGenAI } from '@google/genai';

const app = express();
app.use(express.json({ limit: '1mb' }));

const PORT = parseInt(process.env.PORT || '5001', 10);

const ai = new GoogleGenAI({
  apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY,
  httpOptions: {
    apiVersion: '',
    baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL,
  },
});

app.post('/api/ai/chat', async (req, res) => {
  try {
    const { systemInstruction, history, message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'message is required' });
    }

    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: systemInstruction ? { systemInstruction } : {},
      history: history || [],
    });

    const result = await chat.sendMessage({ message });
    return res.json({ text: result.text || '' });
  } catch (err: any) {
    console.error('AI chat error:', err?.message || err);
    return res.status(500).json({ error: 'AI request failed' });
  }
});

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`API server listening on port ${PORT}`);
});
