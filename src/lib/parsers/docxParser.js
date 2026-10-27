import mammoth from 'mammoth';
import { chunkText } from './chunker.js';

export async function parseDocxBuffer(buffer, docId, fileName) {
  const result = await mammoth.extractRawText({ buffer });
  const fullText = result.value || '';

  const chunks = chunkText(
    fullText,
    docId,
    fileName,
    'docx',
    { chunkSize: 650, chunkOverlap: 100 },
    { section: 'Word Document' }
  );

  chunks.forEach((chunk, idx) => {
    chunk.chunkIndex = idx;
    chunk.id = `${docId}-chunk-${idx}`;
  });

  const wordCount = fullText.split(/\s+/).filter(Boolean).length;

  const metadata = {
    id: docId,
    name: fileName,
    size: buffer.length,
    type: 'docx',
    uploadedAt: new Date().toISOString(),
    totalChunks: chunks.length,
    wordCount,
  };

  return { metadata, chunks, fullText };
}
