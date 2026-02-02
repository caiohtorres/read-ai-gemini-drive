import 'dotenv/config';
import express from 'express';
import { handleReadAiWebhook } from './webhook.js';

const app = express();

// 🔧 AUMENTA O LIMITE DO PAYLOAD (transcrições grandes)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 🚀 Webhook: responde rápido, processa depois
app.post('/webhook/read-ai', async (req, res) => {
  // responde imediatamente para o Read AI
  res.sendStatus(200);

  // processa em background (não bloqueia o webhook)
  try {
    await handleReadAiWebhook(req, null);
  } catch (err) {
    console.error('❌ Erro no processamento em background:', err);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server rodando na porta ${PORT}`);
});