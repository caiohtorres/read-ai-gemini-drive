import { generateMeetingSummary } from './gemini.js';
import { uploadFileToDrive } from './drive.js';

export function normalizeTranscript(payload) {
  const lines = [];

  lines.push("METADADOS DA REUNIÃO:");
  lines.push(`Título da reunião: ${payload.title || "Não informado na transcrição"}`);
  lines.push(`Data da reunião: ${payload.start_time ? payload.start_time.split('T')[0] : "Não informado na transcrição"}`);
  lines.push(`Horário de início: ${payload.start_time || "Não informado na transcrição"}`);
  lines.push(`Horário de término: ${payload.end_time || "Não informado na transcrição"}`);
  lines.push(`Plataforma da reunião: ${payload.platform || "Não informado na transcrição"}`);
  lines.push("");

  if (payload.participants?.length) {
    lines.push("PARTICIPANTES:");
    payload.participants.forEach(p => {
      lines.push(p.name);
    });
    lines.push("");
  }

  if (payload.transcript?.speaker_blocks?.length) {
    lines.push("TRANSCRIÇÃO DA REUNIÃO:");
    payload.transcript.speaker_blocks.forEach(block => {
      const speaker = block.speaker?.name || "Desconhecido";
      const text = block.words || "";
      lines.push(`${speaker}: ${text}`);
    });
  }

  return lines.join("\n");
}

function isTranscriptRelevant(payload) {
  const blocks = payload.transcript?.speaker_blocks;

  if (!Array.isArray(blocks) || blocks.length === 0) {
    return false;
  }

  if (blocks.length < 2) {
    return false;
  }

  const fullText = blocks
    .map(b => (b.words || '').trim())
    .join(' ')
    .toLowerCase();

  const wordCount = fullText.split(/\s+/).filter(Boolean).length;
  if (wordCount < 30) {
    return false;
  }
  const irrelevantPatterns = [
    /^ok$/,
    /^okay$/,
    /^thank you$/,
    /^thanks$/,
    /^não sei$/,
    /^i don't know$/,
    /^teste$/,
    /^alô$/,
    /^hello$/,
  ];

  const isOnlyIrrelevant = irrelevantPatterns.some(pattern =>
    pattern.test(fullText)
  );

  if (isOnlyIrrelevant) {
    return false;
  }

  const speakers = new Set(
    blocks.map(b => b.speaker?.name).filter(Boolean)
  );

  if (speakers.size < 2) {
    return false;
  }

  return true;
}

export async function handleReadAiWebhook(payload) {
  try {
    console.log("📥 Payload recebido do Read.ai:", JSON.stringify(payload, null, 2));

    if (!isTranscriptRelevant(payload)) {
      console.warn("⚠️ Transcrição insuficiente ou irrelevante. Gemini não será acionado.");
      return;
    }

    const transcriptText = normalizeTranscript(payload);

    if (!transcriptText || transcriptText.trim() === "") {
      console.warn("⚠️ Transcrição vazia após normalização.");
      return;
    }

    console.log("📝 Transcript normalizado:", transcriptText);

    const ata = await generateMeetingSummary(transcriptText);

    if (!ata) {
      console.warn("⚠️ Gemini não retornou conteúdo.");
      return;
    }

    console.log("🟢 ATA gerada pelo Gemini.");

 
    const meetingTitle = payload.title
      ? payload.title.replace(/[<>:"/\\|?*]+/g, '')
      : 'Reunião sem título';

    const meetingDateTime = payload.start_time
      ? new Date(payload.start_time)
          .toISOString()
          .replace('T', ' ')
          .substring(0, 16)
          .replace(':', '-')
      : new Date().toISOString().replace('T', ' ').substring(0, 16).replace(':', '-');

    const filename = `Ata - ${meetingTitle} - ${meetingDateTime}.txt`;

    const fileId = await uploadFileToDrive(filename, ata);

    console.log("✅ Arquivo criado no Drive, ID:", fileId);

  } catch (error) {
    console.error('❌ Erro no processamento do Read.ai:', error);
  }
}
