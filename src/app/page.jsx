'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import DocumentUploader from '@/components/DocumentUploader';
import AgentControlPanel from '@/components/AgentControlPanel';
import AgentTraceViewer from '@/components/AgentTraceViewer';
import ReportViewer from '@/components/ReportViewer';
import { Sparkles, CheckCircle2 } from 'lucide-react';

export default function Home() {
  const [documents, setDocuments] = useState([]);
  const [userPrompt, setUserPrompt] = useState(
    'So sánh toàn diện kết quả tài chính giữa các quý (PDF Q1 vs Excel Q2), đối chiếu với các mục tiêu chiến lược trong tệp Word, và benchmark so với xu hướng tăng trưởng bình quân toàn ngành năm 2024-2025.'
  );
  const [enableWebSearch, setEnableWebSearch] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isLoadingSample, setIsLoadingSample] = useState(false);

  const [generatedReport, setGeneratedReport] = useState(null);
  const [liveSteps, setLiveSteps] = useState([]);
  const [liveEvaluation, setLiveEvaluation] = useState(undefined);
  const [notification, setNotification] = useState(null);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Upload custom files
  const handleUploadFiles = async (files) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);

    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
      }

      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        showNotification('error', data.error || 'Lỗi khi xử lý tải tệp lên');
      } else {
        setDocuments((prev) => [...prev, ...data.documents]);
        showNotification('success', `Đã bóc tách thành công ${data.documents.length} tệp tài liệu.`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Lỗi kết nối';
      showNotification('error', `Lỗi tải tệp: ${msg}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Load rich sample data (PDF + Excel + Word)
  const handleLoadSampleData = async () => {
    setIsLoadingSample(true);
    try {
      const res = await fetch('/api/agent/sample-data');
      const data = await res.json();
      if (data.success && Array.isArray(data.documents)) {
        setDocuments(data.documents);
        showNotification(
          'success',
          'Đã nạp 3 tệp mẫu: 1 Báo cáo tài chính PDF, 1 Bảng tính Excel doanh thu và 1 Văn bản Word chiến lược.'
        );
      }
    } catch {
      showNotification('error', 'Không thể nạp dữ liệu mẫu.');
    } finally {
      setIsLoadingSample(false);
    }
  };

  const handleRemoveDocument = (docId) => {
    setDocuments((prev) => prev.filter((d) => d.metadata.id !== docId));
  };

  const handleClearAllDocuments = () => {
    setDocuments([]);
    setGeneratedReport(null);
    setLiveSteps([]);
    setLiveEvaluation(undefined);
  };

  // Execute Autonomous Agent
  const handleExecuteAgent = async () => {
    if (documents.length === 0 || !userPrompt.trim()) return;

    setIsExecuting(true);
    setGeneratedReport(null);
    setLiveEvaluation(undefined);

    setLiveSteps([
      {
        id: 'step-1',
        stepNumber: 1,
        title: 'Khởi tạo Cơ sở Tri thức & Đánh chỉ mục Vector (RAG Indexing)',
        description: `Đang lập chỉ mục semantic vector cho ${documents.length} tài liệu...`,
        status: 'running',
        timestamp: new Date().toLocaleTimeString('vi-VN'),
      },
    ]);

    try {
      const res = await fetch('/api/agent/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documents,
          request: {
            userPrompt,
            enableWebSearch,
          },
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        showNotification('error', data.error || 'Lỗi khi AI Agent thực thi báo cáo');
        setIsExecuting(false);
        return;
      }

      const report = data.report;
      setGeneratedReport(report);
      setLiveSteps(report.executionTrace);
      setLiveEvaluation(report.evaluation);
      showNotification('success', 'Bản báo cáo tổng hợp thông minh đã được khởi tạo hoàn tất!');

      setTimeout(() => {
        const reportElement = document.getElementById('report-section');
        if (reportElement) {
          reportElement.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Lỗi kết nối';
      showNotification('error', `Lỗi xử lý: ${msg}`);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100 selection:bg-cyan-500 selection:text-slate-950">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-16 right-6 z-50 animate-in slide-in-from-top-4 duration-200">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-2xl text-xs font-semibold border ${
              notification.type === 'success'
                ? 'bg-emerald-950/90 text-emerald-200 border-emerald-700/80'
                : 'bg-red-950/90 text-red-200 border-red-700/80'
            }`}
          >
            {notification.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Global Header */}
      <Header
        onLoadSampleData={handleLoadSampleData}
        isLoadingSample={isLoadingSample}
        docCount={documents.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8 space-y-6">
        {/* Workspace 2-Column Grid: Left (Doc Ingestion) & Right (Agent Control) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (5 Cols) */}
          <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl flex flex-col">
            <DocumentUploader
              documents={documents}
              onUploadFiles={handleUploadFiles}
              onRemoveDocument={handleRemoveDocument}
              onClearAll={handleClearAllDocuments}
              isUploading={isUploading}
            />
          </div>

          {/* Right Column (7 Cols) */}
          <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl flex flex-col">
            <AgentControlPanel
              userPrompt={userPrompt}
              setUserPrompt={setUserPrompt}
              enableWebSearch={enableWebSearch}
              setEnableWebSearch={setEnableWebSearch}
              onExecuteAgent={handleExecuteAgent}
              isExecuting={isExecuting}
              hasDocuments={documents.length > 0}
            />
          </div>
        </section>

        {/* Live Autonomous Reasoning Trace (When executing or report exists) */}
        {(isExecuting || liveSteps.length > 0) && (
          <section className="animate-in fade-in duration-300">
            <AgentTraceViewer
              steps={liveSteps}
              evaluation={liveEvaluation}
              isExecuting={isExecuting}
            />
          </section>
        )}

        {/* Generated Report Section */}
        {generatedReport && (
          <section id="report-section" className="scroll-mt-20 animate-in fade-in duration-300 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                <h3 className="text-base font-bold text-white">
                  Báo Cáo Phân Tích & Đối Chiếu Dữ Liệu
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                Mã báo cáo: {generatedReport.id}
              </span>
            </div>

            <ReportViewer report={generatedReport} />
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 px-4 py-5 mt-12 text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2025 <strong className="text-slate-300">NexusDoc Enterprise</strong>. Nền tảng phân tích và đối chiếu dữ liệu doanh nghiệp tự hành.</p>
          <div className="flex items-center gap-3 text-[11px] text-slate-500">
            <span>Bảo mật cấp doanh nghiệp</span>
            <span>•</span>
            <span>RAG Đa Định Dạng</span>
            <span>•</span>
            <span className="text-emerald-500 font-medium">Hệ thống Trực tuyến</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
