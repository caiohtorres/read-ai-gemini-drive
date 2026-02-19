import 'dotenv/config';
import express from 'express';

import { handleReadAiWebhook } from './webhook.js';

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================
// Read.ai (ÚNICO WEBHOOK)
// ============================
app.post('/webhook/read-ai', async (req, res) => {
  // Webhook SEMPRE responde rápido
  res.sendStatus(200);

  try {
    await handleReadAiWebhook(req.body);
  } catch (err) {
    console.error('Read.ai error:', err);
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server rodando na porta ${PORT}`);
});
