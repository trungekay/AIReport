import { NextResponse } from 'next/server';
import { runAutonomousAgent } from '@/lib/agent/autonomousAgent.js';

export const maxDuration = 120; // Allow sufficient time for LLM + Tavily

export async function POST(req) {
  try {
    const body = await req.json();
    const documents = body.documents;
    const request = body.request;

    if (!documents || documents.length === 0) {
      return NextResponse.json(
        { error: 'Vui lòng cung cấp ít nhất một tài liệu nguồn (PDF, Word, hoặc Excel) để phân tích.' },
        { status: 400 }
      );
    }

    if (!request || !request.userPrompt || !request.userPrompt.trim()) {
      return NextResponse.json(
        { error: 'Vui lòng nhập yêu cầu hoặc mục tiêu phân tích cho bản báo cáo.' },
        { status: 400 }
      );
    }

    const report = await runAutonomousAgent(documents, request);

    return NextResponse.json({
      success: true,
      report,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
    console.error('Generate report API error:', error);
    return NextResponse.json(
      { error: `Lỗi trong quá trình AI Agent thực thi báo cáo: ${errorMessage}` },
      { status: 500 }
    );
  }
}
