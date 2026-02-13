import { uploadFileToDrive } from './drive.js';
import { generateMeetingSummary } from './gemini.js';
import { normalizeFathomTranscript } from './normalize-fathom.js';

export async function handleFathomWebhook(payload) {
  console.log('📥 Payload recebido do Fathom:', JSON.stringify(payload, null, 2));

  const transcriptText = normalizeFathomTranscript(payload);
  console.log('📝 Transcript normalizado:', transcriptText);

  const ata = await generateMeetingSummary(transcriptText);
  console.log('🟢 ATA gerada:', ata);

  const date = new Date().toISOString().split('T')[0];
  const filename = `Ata - ${date}.txt`;

  const fileId = await uploadFileToDrive(filename, ata);
  console.log('✅ Arquivo criado no Drive:', fileId);
}
