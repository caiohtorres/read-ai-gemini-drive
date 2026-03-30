import { GoogleGenerativeAI } from '@google/generative-ai';
import 'dotenv/config';

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY não definida no .env');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function generateWithRetry(model, prompt, maxRetries = 3) {
  let lastError;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      console.log(`🤖 Gemini tentativa ${attempt + 1}`);

      const result = await model.generateContent(prompt);
      return result.response.text();

    } catch (error) {
      lastError = error;

      const retryable =
        error?.status === 503 ||
        error?.status === 429 ||
        error?.message?.includes('high demand');

      if (!retryable) {
        throw error;
      }

      const delay = 1000 * Math.pow(2, attempt); // 1s, 2s, 4s
      console.log(`⚠️ Gemini sobrecarregado. Nova tentativa em ${delay / 1000}s...`);
      await sleep(delay);
    }
  }

  throw lastError;
}

export async function generateMeetingSummary(transcript) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-lite"
  });

  const prompt = `
Você é uma inteligência artificial especializada em secretariado executivo, atas corporativas e documentação formal de reuniões.

Sua tarefa é analisar cuidadosamente a transcrição fornecida e gerar uma ATA DE REUNIÃO COMPLETA, DETALHADA, OBJETIVA e PROFISSIONAL, em português brasileiro.

REGRAS OBRIGATÓRIAS (SIGA TODAS):
- NÃO use HTML.
- NÃO use Markdown.
- NÃO use emojis.
- NÃO use listas com símbolos especiais (*, -, •).
- NÃO invente informações que não estejam explícitas na transcrição.
- Quando uma informação não estiver disponível, escreva claramente: "Não informado na transcrição".
- Retorne SOMENTE TEXTO PURO, organizado por seções e parágrafos.
- Utilize linguagem corporativa clara, formal e impessoal.
- O texto será inserido diretamente em um Google Docs.

ESTRUTURA OBRIGATÓRIA DA ATA:

ATA DE REUNIÃO

Data da reunião:
Horário de início:
Horário de término:
Plataforma da reunião:
Título da reunião:

PARTICIPANTES:
Liste todos os participantes identificados na transcrição.
Caso seja possível identificar quem participou ativamente e quem apenas ouviu, separe.
Se não for possível, liste todos juntos.

1. CONTEXTO E OBJETIVO DA REUNIÃO
Descreva o contexto da reunião e seu objetivo principal com base no conteúdo da transcrição.
Não faça suposições além do que foi falado.

2. RESUMO DETALHADO DA REUNIÃO
Relate, em formato narrativo e cronológico, os principais pontos discutidos.
Explique claramente cada tema abordado, mantendo fidelidade ao que foi dito.
Evite frases genéricas. Seja específico.

3. DECISÕES TOMADAS
Registre apenas decisões estratégicas ou definições formais realizadas durante a reunião.
Não inclua tarefas operacionais, atividades ou acompanhamentos.
Se nenhuma decisão clara tiver sido tomada, informe isso.

4. PLANO DE AÇÃO (RESPONSÁVEIS, PRAZOS E PRÓXIMOS PASSOS)
Consolide em uma única seção todas as ações, encaminhamentos e próximos passos definidos na reunião.

Para cada item, descreva de forma direta:
- o que será feito,
- quem é o responsável (somente se estiver explícito),
- e o prazo (somente se informado).

5. PONTOS DE ATENÇÃO, RISCOS OU DEPENDÊNCIAS
Registre alertas, dúvidas, impedimentos, dependências ou pontos que exigem acompanhamento, se houver.

6. CONCLUSÃO DA REUNIÃO
Descreva como a reunião foi encerrada e o entendimento geral final, se isso puder ser identificado.

OBSERVAÇÕES FINAIS:
Não acrescente opiniões próprias.
Não faça recomendações que não tenham base na transcrição.
Mantenha o texto claro, objetivo e fiel ao conteúdo analisado.
Evite repetir informações já descritas na seção de decisões.
Evite duplicidade entre itens.
Agrupe ações relacionadas quando fizer sentido.
Se não houver responsáveis definidos, registre como "Responsável não definido na transcrição".
-Evite redundância entre seções. Cada seção deve conter informações únicas e não repetidas.

TRANSCRIÇÃO DA REUNIÃO:
${transcript}
`;

  return await generateWithRetry(model, prompt);
}
