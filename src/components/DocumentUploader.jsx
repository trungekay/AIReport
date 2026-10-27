'use client';

import React, { useRef, useState } from 'react';
import {
  UploadCloud,
  FileText,
  FileSpreadsheet,
  FileCode,
  Trash2,
  Layers,
  FileCheck,
  Eye,
  AlertCircle,
} from 'lucide-react';

export default function DocumentUploader({
  documents,
  onUploadFiles,
  onRemoveDocument,
  onClearAll,
  isUploading,
}) {
  const fileInputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [viewingDoc, setViewingDoc] = useState(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onUploadFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onUploadFiles(e.target.files);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const getDocTypeBadge = (type) => {
    switch (type) {
      case 'pdf':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">
            <FileText className="w-3 h-3" /> PDF
          </span>
        );
      case 'docx':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <FileCode className="w-3 h-3" /> WORD (.DOCX)
          </span>
        );
      case 'xlsx':
      case 'xls':
      case 'csv':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <FileSpreadsheet className="w-3 h-3" /> EXCEL ({type.toUpperCase()})
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Dropzone Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            1. Tài Liệu Đầu Vào (PDF, Word, Excel)
          </h2>
          <p className="text-xs text-slate-400">
            Hỗ trợ phân tích đa tài liệu và so sánh số liệu chéo bằng RAG
          </p>
        </div>

        {documents.length > 0 && (
          <button
            type="button"
            onClick={onClearAll}
            className="text-xs text-slate-400 hover:text-red-400 transition"
          >
            Xóa tất cả ({documents.length})
          </button>
        )}
      </div>

      {/* Drag & Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 ${
          isDragOver
            ? 'border-cyan-400 bg-cyan-950/20 shadow-lg shadow-cyan-500/10'
            : 'border-slate-700/80 bg-slate-900/60 hover:border-slate-600 hover:bg-slate-900'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.xlsx,.xls,.csv"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-2.5">
          <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <UploadCloud className={`w-6 h-6 ${isUploading ? 'animate-bounce' : ''}`} />
          </div>

          <div className="space-y-1">
            <p className="text-sm font-semibold text-slate-200">
              {isUploading ? (
                <span className="text-cyan-400">Đang đọc và bóc tách tài liệu...</span>
              ) : (
                <>
                  Kéo thả tệp vào đây, hoặc <span className="text-cyan-400 underline">chọn tệp</span>
                </>
              )}
            </p>
            <p className="text-xs text-slate-400">
              Định dạng: <span className="text-red-400 font-medium">.PDF</span>,{' '}
              <span className="text-blue-400 font-medium">.DOCX (Word)</span>,{' '}
              <span className="text-emerald-400 font-medium">.XLSX, .XLS, .CSV (Excel)</span>
            </p>
          </div>
        </div>
      </div>

      {/* Document List */}
      <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[380px] pr-1">
        {documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center text-slate-500 border border-slate-800/60 rounded-xl bg-slate-950/40">
            <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-xs font-medium">Chưa có tài liệu nào được nạp</p>
            <p className="text-[11px] text-slate-600 mt-1 max-w-[240px]">
              Tải lên tài liệu của bạn hoặc bấm nút &quot;Nạp Dữ Liệu Mẫu&quot; ở góc trên để thử nghiệm ngay.
            </p>
          </div>
        ) : (
          documents.map(({ metadata, chunks }) => (
            <div
              key={metadata.id}
              className="group relative flex items-center justify-between p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition shadow-sm"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="p-2 rounded-lg bg-slate-800/80 shrink-0">
                  {metadata.type === 'pdf' && <FileText className="w-5 h-5 text-red-400" />}
                  {metadata.type === 'docx' && <FileCode className="w-5 h-5 text-blue-400" />}
                  {(metadata.type === 'xlsx' || metadata.type === 'xls' || metadata.type === 'csv') && (
                    <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                  )}
                </div>

                <div className="truncate">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-slate-100 truncate" title={metadata.name}>
                      {metadata.name}
                    </p>
                    {getDocTypeBadge(metadata.type)}
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                    <span>{formatFileSize(metadata.size)}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-cyan-400/90 font-mono">
                      <Layers className="w-3 h-3" /> {chunks.length} RAG chunks
                    </span>
                    {metadata.pageCount && (
                      <>
                        <span>•</span>
                        <span>{metadata.pageCount} trang</span>
                      </>
                    )}
                    {metadata.sheetNames && metadata.sheetNames.length > 0 && (
                      <>
                        <span>•</span>
                        <span>{metadata.sheetNames.length} sheet ({metadata.sheetNames.join(', ')})</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                <button
                  type="button"
                  onClick={() => setViewingDoc({ metadata, chunks })}
                  title="Xem các đoạn văn bản (RAG chunks) đã bóc tách"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onRemoveDocument(metadata.id)}
                  title="Xóa tài liệu này"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Chunks Inspector Modal */}
      {viewingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="relative w-full max-w-3xl max-h-[85vh] flex flex-col rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-cyan-400" />
                  Trích Đoạn Nội Dung RAG: {viewingDoc.metadata.name}
                </h3>
                <p className="text-xs text-slate-400">
                  Tổng cộng {viewingDoc.chunks.length} chunks được phân tách và lưu trong chỉ mục Vector
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewingDoc(null)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                Đóng
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {viewingDoc.chunks.map((chunk, idx) => (
                <div
                  key={chunk.id}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800/80 pb-1.5">
                    <span className="font-mono text-cyan-400">#Chunk {idx + 1}</span>
                    <span>
                      {chunk.metadata?.page ? `Trang ${chunk.metadata.page}` : ''}
                      {chunk.metadata?.sheet ? `Sheet: ${chunk.metadata.sheet}` : ''}
                      {chunk.metadata?.section ? ` • ${chunk.metadata.section}` : ''}
                    </span>
                  </div>
                  <pre className="whitespace-pre-wrap font-sans text-slate-300 leading-relaxed">
                    {chunk.content}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
