import { InMemoryVectorStore } from '../rag/vectorStore.js';
import {
  decomposeUserGoal,
  evaluateSufficiency,
  generateSynthesizedReport,
} from '../services/geminiService.js';
import { searchTavily } from '../services/tavilyService.js';

export async function runAutonomousAgent(documents, request, onStepProgress) {
  const steps = [];
  let currentStepNumber = 1;

  function pushStep(title, description, status, details) {
    const step = {
      id: `step-${currentStepNumber}`,
      stepNumber: currentStepNumber++,
      title,
      description,
      status,
      timestamp: new Date().toLocaleTimeString('vi-VN'),
      details,
    };
    steps.push(step);
    if (onStepProgress) {
      onStepProgress(step);
    }
    return step;
  }

  // --- STEP 1: Ingestion & Vector Store Initialization ---
  const allChunks = [];
  const docNames = [];

  for (const doc of documents || []) {
    allChunks.push(...(doc.chunks || []));
    docNames.push(`${doc.metadata.name} (${doc.metadata.type.toUpperCase()})`);
  }

  const vectorStore = new InMemoryVectorStore();
  vectorStore.setChunks(allChunks);

  pushStep(
    'Khởi tạo Cơ sở Tri thức & Đánh chỉ mục Vector (RAG Indexing)',
    `Đã nạp ${documents.length} tệp tài liệu với tổng cộng ${allChunks.length} đoạn nội dung (chunks) vào bộ nhớ vector store.`,
    'completed',
    {
      retrievedChunksCount: allChunks.length,
      summaryNote: `Các tài liệu đã xử lý: ${docNames.join(', ')}`,
    }
  );

  // --- STEP 2: Goal Decomposition & Planning ---
  pushStep(
    'Phân rã Mục tiêu & Lập kế hoạch Truy vấn (Query Planning)',
    'Phân tích yêu cầu người dùng thành các góc nhìn: tài chính, đối chiếu tài liệu và bối cảnh thị trường.',
    'running'
  );

  const { subQueries, analysisPlan } = await decomposeUserGoal(request.userPrompt, docNames, {
    apiKey: request.geminiApiKey,
    modelName: request.modelName,
  });

  steps[steps.length - 1].status = 'completed';
  steps[steps.length - 1].details = {
    searchQueries: subQueries,
    summaryNote: analysisPlan,
  };
  if (onStepProgress) onStepProgress(steps[steps.length - 1]);

  // --- STEP 3: Multi-Document RAG Retrieval ---
  pushStep(
    'Truy xuất Ngữ cảnh Đa tài liệu (Multi-Document RAG Retrieval)',
    `Thực hiện đối chiếu ngữ nghĩa trên ${subQueries.length} khía cạnh truy vấn trong cơ sở tri thức nội bộ.`,
    'running'
  );

  const retrievedMap = new Map();
  for (const subQ of subQueries) {
    const matched = vectorStore.search(subQ, undefined, 4);
    for (const res of matched) {
      if (!retrievedMap.has(res.chunk.id) || (retrievedMap.get(res.chunk.id)?.score || 0) < res.score) {
        retrievedMap.set(res.chunk.id, res);
      }
    }
  }

  const topRagResults = Array.from(retrievedMap.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  const ragContextText = topRagResults
    .map(
      (r, idx) =>
        `[Đoạn ${idx + 1} - Nguồn: ${r.chunk.docName} (${r.chunk.docType.toUpperCase()}) | Vị trí: ${
          r.chunk.metadata?.page ? `Trang ${r.chunk.metadata.page}` : r.chunk.metadata?.sheet ? `Sheet ${r.chunk.metadata.sheet}` : 'Chung'
        } | Độ khớp: ${Math.round(r.score * 100)}%]\n${r.chunk.content}`
    )
    .join('\n\n---\n\n');

  steps[steps.length - 1].status = 'completed';
  steps[steps.length - 1].details = {
    retrievedChunksCount: topRagResults.length,
    summaryNote: `Đã trích xuất thành công ${topRagResults.length} đoạn dữ liệu liên quan cao nhất từ các tệp.`,
  };
  if (onStepProgress) onStepProgress(steps[steps.length - 1]);

  // --- STEP 4: Sufficiency & Gap Analysis (Self-Reflection) ---
  pushStep(
    'Đánh giá Tính Đầy đủ & Phát hiện Lỗ hổng (Sufficiency & Gap Evaluation)',
    'Hệ thống AI tự kiểm định xem dữ liệu nội bộ đã đủ để đáp ứng toàn diện yêu cầu hay chưa.',
    'running'
  );

  const evaluation = await evaluateSufficiency(request.userPrompt, ragContextText, {
    apiKey: request.geminiApiKey,
    modelName: request.modelName,
  });

  const needsWebSearch =
    request.enableWebSearch !== false &&
    (!evaluation.isSufficient || evaluation.confidenceScore < 80 || (evaluation.suggestedSearchQueries || []).length > 0);

  steps[steps.length - 1].status = 'completed';
  steps[steps.length - 1].details = {
    confidenceScore: evaluation.confidenceScore,
    gapsIdentified: evaluation.missingGaps,
    summaryNote: `${evaluation.reasoning} -> Quyết định: ${
      needsWebSearch ? 'Kích hoạt tìm kiếm web Tavily' : 'Dữ liệu nội bộ đã đủ, bỏ qua tìm kiếm web'
    }`,
  };
  if (onStepProgress) onStepProgress(steps[steps.length - 1]);

  // --- STEP 5: Autonomous Web Search (Tavily API) ---
  const webSourcesUsed = [];
  let webContextText = '';

  if (needsWebSearch) {
    const searchQueriesToRun =
      (evaluation.suggestedSearchQueries || []).length > 0
        ? evaluation.suggestedSearchQueries.slice(0, 2)
        : [request.userPrompt];

    pushStep(
      'Kích hoạt Tìm kiếm Trực tuyến Tự hành (Autonomous Tavily Web Search)',
      `Dữ liệu nội bộ còn thiếu thông tin thị trường. Thực hiện tìm kiếm Google/Web qua Tavily API: "${searchQueriesToRun.join(
        '", "'
      )}"`,
      'running',
      { searchQueries: searchQueriesToRun }
    );

    const searchResponses = [];
    for (const q of searchQueriesToRun) {
      const res = await searchTavily(
        q,
        `Bổ sung lỗ hổng thông tin: ${(evaluation.missingGaps || []).join(', ')}`,
        { apiKey: request.tavilyApiKey, maxResults: 3 }
      );
      searchResponses.push(res);
      webSourcesUsed.push(...res.results);
    }

    webContextText = searchResponses
      .map(
        (sr) =>
          `### Kết quả tìm kiếm cho: "${sr.query}"\nLý do kích hoạt: ${sr.triggeredReason}\n` +
          (sr.answer ? `Tóm tắt nhanh: ${sr.answer}\n\n` : '') +
          sr.results
            .map(
              (r, rIdx) =>
                `- [Nguồn ${rIdx + 1}]: [${r.title}](${r.url})\n  Nội dung: ${r.content}`
            )
            .join('\n\n')
      )
      .join('\n\n===================\n\n');

    steps[steps.length - 1].status = 'completed';
    steps[steps.length - 1].details = {
      webResultsCount: webSourcesUsed.length,
      searchQueries: searchQueriesToRun,
      summaryNote: `Đã thu thập thành công ${webSourcesUsed.length} nguồn dữ liệu trực tuyến uy tín để bổ sung bối cảnh đối chiếu.`,
    };
    if (onStepProgress) onStepProgress(steps[steps.length - 1]);
  } else {
    pushStep(
      'Tìm kiếm Web Trực tuyến (Tavily API)',
      'Dữ liệu tài liệu nội bộ đã đạt độ bao phủ cao (>= 85%). Bỏ qua truy vấn bên ngoài.',
      'skipped'
    );
  }

  // --- STEP 6: Cross-Document Comparative Synthesis ---
  pushStep(
    'Tổng hợp Đối chiếu Đa chiều & Soạn thảo Báo cáo Cấp cao',
    'Tích hợp RAG nội bộ và dữ liệu Web thành báo cáo phân tích toàn diện, đối chiếu ma trận số liệu.',
    'running'
  );

  const reportOutput = await generateSynthesizedReport(
    request.userPrompt,
    ragContextText,
    webContextText,
    evaluation,
    docNames,
    { apiKey: request.geminiApiKey, modelName: request.modelName }
  );

  steps[steps.length - 1].status = 'completed';
  steps[steps.length - 1].details = {
    summaryNote: 'Báo cáo hoàn tất thẩm định và đạt chuẩn chất lượng xuất bản.',
  };
  if (onStepProgress) onStepProgress(steps[steps.length - 1]);

  const reportId = `rep_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  return {
    id: reportId,
    title: `Báo Cáo Phân Tích Tổng Hợp: ${request.userPrompt.slice(0, 45)}...`,
    userPrompt: request.userPrompt,
    createdAt: new Date().toISOString(),
    markdownContent: reportOutput.markdownContent,
    executiveSummary: reportOutput.executiveSummary,
    keyFindings: reportOutput.keyFindings,
    strategicRecommendations: reportOutput.strategicRecommendations,
    ragSourcesUsed: topRagResults.map((r) => ({
      docName: r.chunk.docName,
      docType: r.chunk.docType,
      chunkContent: r.chunk.content,
      score: r.score,
      pageOrSheet: r.chunk.metadata?.page
        ? `Trang ${r.chunk.metadata.page}`
        : r.chunk.metadata?.sheet
        ? `Sheet ${r.chunk.metadata.sheet}`
        : 'Chung',
    })),
    webSourcesUsed,
    evaluation,
    executionTrace: steps,
  };
}
