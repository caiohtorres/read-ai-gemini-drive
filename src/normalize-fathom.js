export function normalizeFathomTranscript(payload) {
  const lines = [];

  const meeting = payload.meeting || {};

  // Participantes
  if (meeting.participants?.length) {
    lines.push('Participantes:');
    meeting.participants.forEach(p => {
      lines.push(`- ${p.name}`);
    });
    lines.push('');
  }

  // Transcrição
  if (meeting.transcript?.length) {
    lines.push('Transcrição:');
    meeting.transcript.forEach(item => {
      lines.push(`${item.speaker}: ${item.text}`);
    });
  }

  return lines.join('\n');
}
