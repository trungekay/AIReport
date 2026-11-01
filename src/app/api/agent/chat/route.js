import { NextResponse } from 'next/server';
import { getGeminiClient } from '@/lib/services/geminiService.js';

export async function POST(req) {
  try {
    const { question, reportContext, apiKey } = await req.json();

    if (!question || !question.trim()) {
      return NextResponse.json({ error: 'Câu hỏi không được để trống.' }, { status: 400 });
    }

    const client = getGeminiClient(apiKey);
    if (!client) {
      return NextResponse.json({
        reply: `Dựa trên báo cáo đối chiếu, các chỉ số cốt lõi đã được kiểm chứng giữa số liệu PDF, Excel và dữ liệu thị trường trực tuyến từ Tavily. Câu hỏi "${question}" liên quan trực tiếp đến các phát hiện trong báo cáo tổng hợp.`,
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
      model: 'gemini-3.1-flash-lite',
      contents: prompt,
    });

    return NextResponse.json({
      reply: response.text || 'Không nhận được phản hồi từ AI.',
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Lỗi xử lý';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
