import { NextRequest, NextResponse } from 'next/server';
import { getGeminiClient } from '@/lib/services/geminiService';



export async function POST(req: NextRequest) {
  try {
    const { question, reportContext, apiKey } = await req.json();

    if (!question || !question.trim()) {
      return NextResponse.json({ error: 'Câu hỏi không được để trống.' }, { status: 400 });
    }

    const client = getGeminiClient(apiKey);
    if (!client) {
      return NextResponse.json({
        reply: `[Chế độ Demo] Trả lời cho câu hỏi "${question}": Dựa trên báo cáo đối chiếu, các chỉ số cốt lõi đã được kiểm chứng giữa số liệu PDF, Excel và dữ liệu thị trường trực tuyến từ Tavily. Bạn có thể nhập Gemini API Key trong phần Cài đặt để nhận câu trả lời phân tích sâu theo thời gian thực.`,
      });
    }

    const prompt = `Bạn là Trợ lý Phân tích Báo cáo Thông minh (AI Report Assistant).
Người dùng có câu hỏi làm rõ về bản báo cáo đã lập:
"${question}"

Bối cảnh báo cáo đã tạo:
"""
${(reportContext || '').slice(0, 8000)}
"""

Hãy trả lời câu hỏi của người dùng một cách chính xác, ngắn gọn, súc tích và bám sát số liệu có trong báo cáo.`;

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return NextResponse.json({
      reply: response.text || 'Không nhận được phản hồi từ AI.',
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Lỗi xử lý';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
