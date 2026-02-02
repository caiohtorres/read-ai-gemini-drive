import { uploadFileToDrive } from './drive.js';
import { generateMeetingSummary } from './gemini.js';

export function normalizeTranscript(payload) {
  const lines = [];

  if (payload.participants?.length) {
    lines.push("Participantes:");
    payload.participants.forEach(p => {
      lines.push(`- ${p.name}`);
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




export async function handleReadAiWebhook(req, res) {
  try {
    console.log("📥 Payload recebido do Read.ai:", JSON.stringify(req.body, null, 2));

    const payload = req.body;
    const transcriptText = normalizeTranscript(payload);
    console.log("📝 Transcript normalizado:", transcriptText);

    const ata = await generateMeetingSummary(transcriptText);
    console.log("🟢 ATA gerada pelo Gemini:", ata);

    const date = new Date().toISOString().split('T')[0];
    const filename = `Ata - ${date}.txt`;

    const fileId = await uploadFileToDrive(filename, ata);
    console.log("✅ Arquivo criado no Drive, ID:", fileId);

    res.status(200).json({
      success: true,
      fileId,
      url: `https://drive.google.com/file/d/${fileId}/view`
    });
  } catch (error) {
    console.error('❌ Erro no webhook:', error);
    res.status(500).json({ error: error.message });
  }
}


