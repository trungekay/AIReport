import mammoth from 'mammoth';
import { DocumentChunk, DocumentMetadata } from '../types';
import { chunkText } from './chunker';

export async function parseDocxBuffer(
  buffer: Buffer,
  docId: string,
  fileName: string
): Promise<{ metadata: DocumentMetadata; chunks: DocumentChunk[]; fullText: string }> {
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

  const metadata: DocumentMetadata = {
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
