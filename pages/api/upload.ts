import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadsDir = path.join(process.cwd(), 'public', 'uploads');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  await fs.promises.mkdir(uploadsDir, { recursive: true });

  const form = formidable({ multiples: false, uploadDir: uploadsDir, keepExtensions: true, maxFileSize: 5 * 1024 * 1024 });
  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(500).json({ error: 'Upload failed', details: String(err) });
    }
    const file = files.file || files.image;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const uploaded = Array.isArray(file) ? file[0] : file;
    if (!uploaded.mimetype?.startsWith('image/')) {
      return res.status(400).json({ error: 'Only image files allowed' });
    }
    const filename = path.basename(uploaded.filepath || uploaded.newFilename);
    return res.status(200).json({ filename });
  });
} 