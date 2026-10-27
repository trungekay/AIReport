/**
 * Chia nhỏ văn bản thành các chunks có độ chồng lấp (overlap)
 */
export function chunkText(
  text,
  docId,
  docName,
  docType,
  options = {},
  defaultMetadata = {}
) {
  const chunkSize = options.chunkSize || 600;
  const chunkOverlap = options.chunkOverlap || 120;

  const cleanText = (text || '').replace(/\r\n/g, '\n').trim();
  if (!cleanText) return [];

  // Phân tách thành từng đoạn văn bản
  const paragraphs = cleanText.split(/\n\s*\n/);
  const chunks = [];
  let currentBuffer = '';
  let chunkIndex = 0;

  for (const paragraph of paragraphs) {
    const trimmed = paragraph.trim();
    if (!trimmed) continue;

    if (currentBuffer.length + trimmed.length + 1 <= chunkSize) {
      currentBuffer = currentBuffer ? `${currentBuffer}\n\n${trimmed}` : trimmed;
    } else {
      if (currentBuffer.length > 0) {
        chunks.push({
          id: `${docId}-chunk-${chunkIndex++}`,
          docId,
          docName,
          docType,
          chunkIndex: chunks.length,
          content: currentBuffer,
          metadata: { ...defaultMetadata },
        });

        const overlapStart = Math.max(0, currentBuffer.length - chunkOverlap);
        const overlapText = currentBuffer.slice(overlapStart);
        currentBuffer = `${overlapText}\n\n${trimmed}`.slice(0, chunkSize);
      } else {
        let remaining = trimmed;
        while (remaining.length > 0) {
          const slice = remaining.slice(0, chunkSize);
          chunks.push({
            id: `${docId}-chunk-${chunkIndex++}`,
            docId,
            docName,
            docType,
            chunkIndex: chunks.length,
            content: slice,
            metadata: { ...defaultMetadata },
          });
          remaining = remaining.slice(chunkSize - chunkOverlap).trim();
          if (remaining.length <= chunkOverlap) break;
        }
        currentBuffer = '';
      }
    }
  }

  if (currentBuffer.trim().length > 0) {
    chunks.push({
      id: `${docId}-chunk-${chunkIndex++}`,
      docId,
      docName,
      docType,
      chunkIndex: chunks.length,
      content: currentBuffer.trim(),
      metadata: { ...defaultMetadata },
    });
  }

  return chunks;
}
