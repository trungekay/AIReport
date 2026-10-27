import * as XLSX from 'xlsx';
import { DocumentChunk, DocumentMetadata, SupportedFileType } from '../types';
import { chunkText } from './chunker';

export async function parseExcelBuffer(
  buffer: Buffer,
  docId: string,
  fileName: string,
  fileType: SupportedFileType = 'xlsx'
): Promise<{ metadata: DocumentMetadata; chunks: DocumentChunk[]; fullText: string }> {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetNames = workbook.SheetNames || [];
  const chunks: DocumentChunk[] = [];
  const fullTextParts: string[] = [];

  for (const sheetName of sheetNames) {
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) continue;

    // Convert sheet to json array of rows
    const rows = XLSX.utils.sheet_to_json<unknown[]>(worksheet, { header: 1 });
    if (!rows || rows.length === 0) continue;

    const headers = (rows[0] || []).map((h) => String(h || '').trim());
    const dataRows = rows.slice(1);

    let sheetText = `### Bảng Dữ Liệu Sheet: "${sheetName}" trong file ${fileName}\n`;
    sheetText += `Số cột: ${headers.length} | Số dòng: ${dataRows.length}\n`;
    sheetText += `Tiêu đề cột: ${headers.filter(Boolean).join(' | ')}\n\n`;

    // Render table rows in batches
    const rowBatchLines: string[] = [];
    for (let rIdx = 0; rIdx < dataRows.length; rIdx++) {
      const row = dataRows[rIdx];
      if (!row || row.length === 0 || row.every((val) => val === undefined || val === null || val === '')) {
        continue;
      }

      const rowDetails = headers
        .map((h, cIdx) => {
          const val = row[cIdx];
          if (val === undefined || val === null || val === '') return null;
          return `${h || `Cột ${cIdx + 1}`}: ${String(val).trim()}`;
        })
        .filter(Boolean)
        .join(' , ');

      rowBatchLines.push(`- Dòng ${rIdx + 1}: ${rowDetails}`);
    }

    sheetText += rowBatchLines.join('\n');
    fullTextParts.push(sheetText);

    const sheetChunks = chunkText(
      sheetText,
      docId,
      fileName,
      fileType,
      { chunkSize: 650, chunkOverlap: 100 },
      { sheet: sheetName, section: `Bảng dữ liệu: ${sheetName}` }
    );
    chunks.push(...sheetChunks);
  }

  const fullText = fullTextParts.join('\n\n---\n\n');
  chunks.forEach((chunk, idx) => {
    chunk.chunkIndex = idx;
    chunk.id = `${docId}-chunk-${idx}`;
  });

  const wordCount = fullText.split(/\s+/).filter(Boolean).length;

  const metadata: DocumentMetadata = {
    id: docId,
    name: fileName,
    size: buffer.length,
    type: fileType,
    uploadedAt: new Date().toISOString(),
    sheetCount: sheetNames.length,
    sheetNames,
    totalChunks: chunks.length,
    wordCount,
  };

  return { metadata, chunks, fullText };
}
