import { GoogleGenerativeAI } from '@google/generative-ai';
import 'dotenv/config';

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY não definida no .env');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function generateMeetingSummary(transcript) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-lite"
  });

  const prompt = `
Você é um assistente corporativo altamente detalhado.

Gere uma ATA DE REUNIÃO COMPLETA em português com estas seções:

A Ata será enviada posteriormente para o Docs no Drive, formate de acordo com o formato, centralizando elementos, como uma ata formal.
No cabeçalho coloque a data da reunião, horário de início e de fim (tragos pela transcrição da reunião).
Coloque os convidados para a reunião, se conseguir diferencie entre pessoas que participaram ativamente e pessoas que apenas ouviram.

1️⃣ Resumo da reunião (resuma o que foi discutido, sendo bem detalhista nos pontos mais importantes).
2️⃣ Decisões tomadas (liste todas as decisões concretas que foram discutidas e tomadas).
3️⃣ Responsáveis (quem vai executar cada decisão).
4️⃣ Próximos passos.
5️⃣ Observações ou insights adicionais.

Reunião:
${transcript}
`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}
