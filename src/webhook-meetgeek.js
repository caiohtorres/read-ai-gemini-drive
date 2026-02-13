import axios from 'axios';
import { uploadFileToDrive } from './drive.js';
import { generateMeetingSummary } from './gemini.js';

export async function handleMeetGeekWebhook(payload) {
  console.log('📥 MeetGeek webhook:', JSON.stringify(payload, null, 2));

  if (payload.event !== 'meeting.completed') {
    console.log('ℹ️ Evento ignorado:', payload.event);
    return;
  }

  const meeting = payload.meeting;
  if (!meeting?.id) {
    console.warn('⚠️ ID da reunião ausente');
    return;
  }

  console.log('✅ Reunião finalizada:', meeting.title);

  if (!meeting.transcript || !Array.isArray(meeting.transcript)) {
    console.warn('⚠️ Transcrição não disponível');
    return;
  }

  const transcriptText = meeting.transcript
    .map(t => `${t.speaker}: ${t.text}`)
    .join('\n');

  console.log('📝 Transcrição normalizada:', transcriptText);
  
  const ata = await generateMeetingSummary(transcriptText);
  console.log('🟢 ATA gerada:', ata);

  const date = new Date().toISOString().split('T')[0];
  const filename = `Ata - ${meeting.title} - ${date}.txt`;

  const fileId = await uploadFileToDrive(filename, ata);

  console.log('✅ ATA salva no Drive. ID:', fileId);
}
