import 'dotenv/config';
import { generateMeetingSummary } from './gemini.js';

async function testGemini() {
  const simulatedTranscript = `
Alice: Bom dia a todos, vamos iniciar a reunião.
Bob: Hoje vamos revisar os KPIs do mês e discutir vendas e marketing.
Caio: Perfeito, temos pontos importantes a tratar.
Alice: Primeiro ponto: resultados de vendas regionais, tivemos crescimento de 12%.
Bob: Excelente, mas precisamos melhorar a taxa de conversão do funil.
Caio: Sugiro treinamentos semanais para a equipe de vendas.
Alice: Segundo ponto: campanhas de marketing digital, desempenho abaixo do esperado.
Bob: Vamos ajustar anúncios e segmentações.
`;

  console.log('🟢 Enviando transcript para o Gemini...');

  const ata = await generateMeetingSummary(simulatedTranscript);

  console.log('✅ Resposta recebida do Gemini:');
  console.log('----------------------------------------');
  console.log(ata);
  console.log('----------------------------------------');
}

testGemini().catch(err => {
  console.error('❌ Erro ao testar o Gemini:', err);
});
