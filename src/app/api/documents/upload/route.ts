import { NextRequest, NextResponse } from 'next/server';
import { parseDocument } from '@/lib/parsers/documentParser';



export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'Không tìm thấy tệp tải lên. Vui lòng chọn ít nhất 1 tệp PDF, Word (.docx) hoặc Excel (.xlsx).' },
        { status: 400 }
      );
    }

    const parsedDocs = [];

    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      try {
        const parsed = await parseDocument(buffer, file.name);
        parsedDocs.push({
          metadata: parsed.metadata,
          chunks: parsed.chunks,
          previewSnippet: parsed.fullText.slice(0, 300) + (parsed.fullText.length > 300 ? '...' : ''),
        });
      } catch (parseErr: unknown) {
        const errorMessage = parseErr instanceof Error ? parseErr.message : 'Lỗi không xác định khi đọc tệp';
        console.error(`Error parsing file ${file.name}:`, parseErr);
        return NextResponse.json(
          { error: `Lỗi xử lý tệp "${file.name}": ${errorMessage}` },
          { status: 422 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: `Đã phân tích thành công ${parsedDocs.length} tài liệu.`,
      documents: parsedDocs,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Lỗi máy chủ';
    console.error('Upload handler error:', error);
    return NextResponse.json(
      { error: `Lỗi máy chủ khi tải tệp: ${errorMessage}` },
      { status: 500 }
    );
  }
}
