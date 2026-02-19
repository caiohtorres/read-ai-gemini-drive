import { generateMeetingSummary } from './gemini.js';
import { uploadFileToDrive } from './drive.js';

export function normalizeTranscript(payload) {
  const lines = [];

  // 📌 Metadados da reunião (AGORA VISÍVEIS AO GEMINI)
  lines.push("METADADOS DA REUNIÃO:");
  lines.push(`Título da reunião: ${payload.title || "Não informado na transcrição"}`);
  lines.push(`Data da reunião: ${payload.start_time ? payload.start_time.split('T')[0] : "Não informado na transcrição"}`);
  lines.push(`Horário de início: ${payload.start_time || "Não informado na transcrição"}`);
  lines.push(`Horário de término: ${payload.end_time || "Não informado na transcrição"}`);
  lines.push(`Plataforma da reunião: ${payload.platform || "Não informado na transcrição"}`);
  lines.push("");

  // 👥 Participantes
  if (payload.participants?.length) {
    lines.push("PARTICIPANTES:");
    payload.participants.forEach(p => {
      lines.push(p.name);
    });
    lines.push("");
  }

  // 🗣️ Transcrição
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

        // 🏷️ Título da reunião
    const meetingTitle = payload.title
      ? payload.title.replace(/[<>:"/\\|?*]+/g, '') // remove caracteres inválidos
      : 'Reunião sem título';

    // 📅 Data e hora da reunião
    const meetingDateTime = payload.start_time
      ? new Date(payload.start_time)
          .toISOString()
          .replace('T', ' ')
          .substring(0, 16) // yyyy-mm-dd hh:mm
          .replace(':', '-')
      : new Date().toISOString().replace('T', ' ').substring(0, 16).replace(':', '-');

    // 📄 Nome final do arquivo
    const filename = `Ata - ${meetingTitle} - ${meetingDateTime}.txt`;


    const fileId = await uploadFileToDrive(filename, ata);

    console.log("✅ Arquivo criado no Drive, ID:", fileId);

  } catch (error) {
    console.error('❌ Erro no processamento do Read.ai:', error);
  }
}