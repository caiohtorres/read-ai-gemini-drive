import { uploadFileToDrive } from './drive.js';
import { generateMeetingSummary } from './gemini.js';

export function normalizeTranscript(payload) {
  const lines = [];

  if (payload.participants?.length) {
    lines.push("Participantes:");
    payload.participants.forEach(p => {
      lines.push(p.name);
    });
    lines.push("");
  }

  if (payload.transcript?.speaker_blocks?.length) {
    lines.push("Transcrição:");
    payload.transcript.speaker_blocks.forEach(block => {
      const speaker = block.speaker?.name || "Desconhecido";
      const text = block.words || "";
      lines.push(`${speaker}: ${text}`);
    });
  }

  return lines.join("\n");
}

export async function handleReadAiWebhook(payload) {
  try {
    console.log("📥 Payload recebido do Read.ai:", JSON.stringify(payload, null, 2));

    const transcriptText = normalizeTranscript(payload);

    if (!transcriptText || transcriptText.trim() === "") {
      console.warn("⚠️ Transcrição vazia.");
      return;
    }

    console.log("📝 Transcript normalizado:", transcriptText);

    const ata = await generateMeetingSummary(transcriptText);

    if (!ata) {
      console.warn("⚠️ Gemini não retornou conteúdo.");
      return;
    }

    console.log("🟢 ATA gerada pelo Gemini.");

    const date = new Date().toISOString().split('T')[0];
    const filename = `Ata - ${date}.txt`;

    const fileId = await uploadFileToDrive(filename, ata);

    console.log("✅ Arquivo criado no Drive, ID:", fileId);

  } catch (error) {
    console.error('❌ Erro no processamento do Read.ai:', error);
  }
}
