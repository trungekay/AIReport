import { parsePdfBuffer } from './pdfParser.js';
import { parseDocxBuffer } from './docxParser.js';
import { parseExcelBuffer } from './excelParser.js';

export function detectFileType(fileName) {
  const ext = (fileName || '').toLowerCase().split('.').pop() || '';
  if (ext === 'pdf') return 'pdf';
  if (ext === 'docx') return 'docx';
  if (ext === 'xlsx') return 'xlsx';
  if (ext === 'xls') return 'xls';
  if (ext === 'csv') return 'csv';
  return null;
}

export async function parseDocument(
  buffer,
  fileName,
  docId = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
) {
  const fileType = detectFileType(fileName);
  if (!fileType) {
    throw new Error(
      `Định dạng tệp không được hỗ trợ (${fileName}). Chỉ hỗ trợ file PDF (.pdf), Word (.docx), và Excel (.xlsx, .xls, .csv).`
    );
  }

  switch (fileType) {
    case 'pdf':
      return await parsePdfBuffer(buffer, docId, fileName);
    case 'docx':
      return await parseDocxBuffer(buffer, docId, fileName);
    case 'xlsx':
    case 'xls':
    case 'csv':
      return await parseExcelBuffer(buffer, docId, fileName, fileType);
  }
}
