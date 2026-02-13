import { google } from 'googleapis';
import 'dotenv/config';
import path from 'path';
import { Readable } from 'stream';

const auth = new google.auth.GoogleAuth({
  keyFile: path.join(process.cwd(), process.env.GOOGLE_KEYFILE),
  scopes: ['https://www.googleapis.com/auth/drive']
});

const drive = google.drive({ version: 'v3', auth });

export async function uploadFileToDrive(filename, content) {
  try {
    console.log('📄 Criando arquivo no Drive...');

    const fileMetadata = {
      name: filename,
      parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
    };

const media = {
  mimeType: 'text/plain',
  body: Readable.from([content]),
};


    const res = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      supportsAllDrives: true,
      fields: 'id, name'
    });

    console.log('✅ Arquivo criado:', res.data.name, res.data.id);
    return res.data.id;

  } catch (error) {
    console.error('❌ Erro ao criar arquivo:', error);
    throw error;
  }
}
