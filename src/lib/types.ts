export type SupportedFileType = 'pdf' | 'docx' | 'xlsx' | 'xls' | 'csv';

export interface DocumentMetadata {
  id: string;
  name: string;
  size: number;
  type: SupportedFileType;
  uploadedAt: string;
  pageCount?: number;
  sheetCount?: number;
  sheetNames?: string[];
  totalChunks: number;
  wordCount: number;
}

export interface DocumentChunk {
  id: string;
  docId: string;
  docName: string;
  docType: SupportedFileType;
  chunkIndex: number;
  content: string;
  metadata?: {
    page?: number;
    sheet?: string;
    section?: string;
  };
  embedding?: number[];
}

export interface RagSearchResult {
  chunk: DocumentChunk;
  score: number;
  relevanceExplanation?: string;
}

export interface TavilySearchResultItem {
  title: string;
  url: string;
  content: string;
  score?: number;
}

export interface TavilySearchResponse {
  query: string;
  answer?: string;
  results: TavilySearchResultItem[];
  triggeredReason: string;
}

export interface SufficiencyEvaluation {
  isSufficient: boolean;
  confidenceScore: number; // 0 to 100
  reasoning: string;
  missingGaps: string[];
  suggestedSearchQueries: string[];
}

export type AgentStepStatus = 'pending' | 'running' | 'completed' | 'skipped' | 'warning' | 'error';

export interface AgentExecutionStep {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  status: AgentStepStatus;
  timestamp: string;
  details?: {
    retrievedChunksCount?: number;
    searchQueries?: string[];
    webResultsCount?: number;
    confidenceScore?: number;
    gapsIdentified?: string[];
    summaryNote?: string;
  };
}

export interface ReportGenerationRequest {
  userPrompt: string;
  targetFocus?: 'comprehensive' | 'financial' | 'comparison' | 'strategic';
  enableWebSearch?: boolean;
  geminiApiKey?: string;
  tavilyApiKey?: string;
  modelName?: string;
}

export interface GeneratedReport {
  id: string;
  title: string;
  userPrompt: string;
  createdAt: string;
  markdownContent: string;
  executiveSummary: string;
  comparativeMatrix?: {
    headers: string[];
    rows: Array<{ [key: string]: string }>;
  };
  keyFindings: string[];
  strategicRecommendations: string[];
  ragSourcesUsed: Array<{
    docName: string;
    docType: SupportedFileType;
    chunkContent: string;
    score: number;
    pageOrSheet?: string;
  }>;
  webSourcesUsed: TavilySearchResultItem[];
  evaluation: SufficiencyEvaluation;
  executionTrace: AgentExecutionStep[];
}
