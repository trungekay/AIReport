import { DocumentChunk, RagSearchResult } from '../types';

export class InvertedIndex {
  private docFrequencies: Map<string, number> = new Map();
  private totalDocs = 0;

  constructor() {}

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s%$.-]/gu, ' ')
      .split(/\s+/)
      .filter((term) => term.length > 1);
  }

  public indexChunks(chunks: DocumentChunk[]): void {
    this.totalDocs = chunks.length;
    this.docFrequencies.clear();

    for (const chunk of chunks) {
      const terms = new Set(this.tokenize(chunk.content));
      for (const term of terms) {
        this.docFrequencies.set(term, (this.docFrequencies.get(term) || 0) + 1);
      }
    }
  }

  public scoreChunk(queryTerms: string[], chunkContent: string): number {
    const tokens = this.tokenize(chunkContent);
    if (tokens.length === 0) return 0;

    const termCounts: Record<string, number> = {};
    for (const token of tokens) {
      termCounts[token] = (termCounts[token] || 0) + 1;
    }

    let score = 0;
    for (const qTerm of queryTerms) {
      const tf = (termCounts[qTerm] || 0) / tokens.length;
      if (tf > 0) {
        const df = this.docFrequencies.get(qTerm) || 1;
        const idf = Math.log((this.totalDocs + 1) / df) + 1;
        score += tf * idf;
      }
    }

    return score;
  }
}

export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length || vecA.length === 0) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export class InMemoryVectorStore {
  private chunks: DocumentChunk[] = [];
  private invertedIndex: InvertedIndex = new InvertedIndex();

  constructor() {}

  public setChunks(chunks: DocumentChunk[]): void {
    this.chunks = chunks;
    this.invertedIndex.indexChunks(chunks);
  }

  public addChunks(newChunks: DocumentChunk[]): void {
    this.chunks.push(...newChunks);
    this.invertedIndex.indexChunks(this.chunks);
  }

  public clear(): void {
    this.chunks = [];
    this.invertedIndex = new InvertedIndex();
  }

  public getAllChunks(): DocumentChunk[] {
    return this.chunks;
  }

  public search(
    query: string,
    queryEmbedding?: number[],
    topK = 6
  ): RagSearchResult[] {
    if (this.chunks.length === 0) return [];

    const queryTerms = query
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s%$.-]/gu, ' ')
      .split(/\s+/)
      .filter((term) => term.length > 1);

    const scoredResults: RagSearchResult[] = [];

    // Calculate raw scores
    const keywordScores: number[] = [];
    const vectorScores: number[] = [];

    for (const chunk of this.chunks) {
      const kwScore = this.invertedIndex.scoreChunk(queryTerms, chunk.content);
      keywordScores.push(kwScore);

      let vScore = 0;
      if (queryEmbedding && chunk.embedding && chunk.embedding.length > 0) {
        vScore = Math.max(0, cosineSimilarity(queryEmbedding, chunk.embedding));
      }
      vectorScores.push(vScore);
    }

    const maxKw = Math.max(...keywordScores, 0.0001);
    const maxVec = Math.max(...vectorScores, 0.0001);

    for (let i = 0; i < this.chunks.length; i++) {
      const chunk = this.chunks[i];
      const normKw = keywordScores[i] / maxKw;
      const normVec = queryEmbedding ? vectorScores[i] / maxVec : 0;

      // Hybrid fusion: semantic weight + keyword weight
      const hybridScore = queryEmbedding
        ? 0.65 * normVec + 0.35 * normKw
        : normKw;

      // Check phrase boost
      const hasExactPhrase = chunk.content.toLowerCase().includes(query.toLowerCase().trim());
      const finalScore = Math.min(1, hybridScore + (hasExactPhrase ? 0.2 : 0));

      if (finalScore > 0.03 || this.chunks.length <= topK) {
        scoredResults.push({
          chunk,
          score: Math.round(finalScore * 100) / 100,
          relevanceExplanation: `Khớp ${Math.round(finalScore * 100)}% với truy vấn`,
        });
      }
    }

    scoredResults.sort((a, b) => b.score - a.score);
    return scoredResults.slice(0, topK);
  }
}
