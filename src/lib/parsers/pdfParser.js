import { chunkText } from './chunker.js';

export async function parsePdfBuffer(buffer, docId, fileName) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfModule = require('pdf-parse');
  const PDFParse = pdfModule.PDFParse || pdfModule.default?.PDFParse;

  if (!PDFParse) {
    throw new Error('PDFParse class not found in pdf-parse module');
  }

  const parser = new PDFParse({ data: buffer });
  const parsed = await parser.getText();
  await parser.destroy?.();

  const totalPages = parsed.total || parsed.pages?.length || 1;
  const fullText = parsed.text || '';
  const chunks = [];

  if (Array.isArray(parsed.pages) && parsed.pages.length > 0) {
    for (const page of parsed.pages) {
      const pageText = page.text || '';
      if (!pageText.trim()) continue;

      const pageChunks = chunkText(
        pageText,
        docId,
        fileName,
        'pdf',
        { chunkSize: 650, chunkOverlap: 100 },
        { page: page.num || 1, section: `Trang ${page.num || 1}` }
      );
      chunks.push(...pageChunks);
    }
  } else {
    const generalChunks = chunkText(
      fullText,
      docId,
      fileName,
      'pdf',
      { chunkSize: 650, chunkOverlap: 100 },
      { page: 1, section: 'Nội dung PDF' }
    );
    chunks.push(...generalChunks);
  }

  chunks.forEach((chunk, idx) => {
    chunk.chunkIndex = idx;
    chunk.id = `${docId}-chunk-${idx}`;
  });

  const wordCount = fullText.split(/\s+/).filter(Boolean).length;

  const metadata = {
    id: docId,
    name: fileName,
    size: buffer.length,
    type: 'pdf',
    uploadedAt: new Date().toISOString(),
    pageCount: totalPages,
    totalChunks: chunks.length,
    wordCount,
  };

  return { metadata, chunks, fullText };
}
