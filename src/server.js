import 'dotenv/config';
import express from 'express';

import { handleReadAiWebhook } from './webhook.js';
import { handleFathomWebhook } from './webhook-fathom.js';
import { handleMeetGeekWebhook } from './webhook-meetgeek.js';

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================
// Read.ai
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

// ============================
// Fathom
// ============================
app.post('/webhook/fathom', async (req, res) => {
  res.sendStatus(200);

  try {
    await handleFathomWebhook(req.body);
  } catch (err) {
    console.error('Fathom error:', err);
  }
});

// ============================
// MeetGeek
// ============================
app.post('/webhook/meetgeek', async (req, res) => {
  res.sendStatus(200);

  try {
    await handleMeetGeekWebhook(req.body);
  } catch (err) {
    console.error('MeetGeek error:', err);
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server rodando na porta ${PORT}`);
});
