import { DocumentChunk, DocumentMetadata } from './types';
import { chunkText } from './parsers/chunker';

export function getSampleDocuments(): { metadata: DocumentMetadata; chunks: DocumentChunk[] }[] {
  // 1. PDF Sample: Q1 2024 Financial Overview
  const pdfText = `CÔNG TY CỔ PHẦN CÔNG NGHỆ & THƯƠNG MẠI TECHNOVA
BÁO CÁO TÀI CHÍNH TỔNG HỢP QUÝ 1 NĂM 2024 (Định dạng PDF gốc)
Mã tài liệu: TNV-TC-2024-Q1 | Ngày phát hành: 15/04/2024

PHẦN 1: KẾT QUẢ HOẠT ĐỘNG KINH DOANH QUÝ 1/2024
- Tổng doanh thu thuần: 45.2 tỷ VNĐ (Tăng 12.5% so với cùng kỳ năm trước).
- Giá vốn hàng bán (COGS): 27.1 tỷ VNĐ (Tỷ lệ giá vốn/doanh thu đạt 59.9%).
- Lợi nhuận gộp: 18.1 tỷ VNĐ (Biên lợi nhuận gộp đạt 40.0%).
- Chi phí bán hàng (Selling Expenses): 6.8 tỷ VNĐ (chiếm 15.0% doanh thu).
- Chi phí quản lý doanh nghiệp (G&A): 4.5 tỷ VNĐ (chiếm 9.9% doanh thu).
- Lợi nhuận thuần từ hoạt động kinh doanh: 6.8 tỷ VNĐ.
- Lợi nhuận sau thuế (EAT): 5.4 tỷ VNĐ.
- Tỷ suất sinh lời trên doanh thu (ROS): 11.9%.

PHẦN 2: TÌNH HÌNH DÒNG TIỀN VÀ TÀI SẢN
- Tổng tài sản ghi nhận cuối Q1/2024: 185.0 tỷ VNĐ.
- Tiền và tương đương tiền: 32.4 tỷ VNĐ.
- Các khoản phải thu khách hàng: 28.6 tỷ VNĐ (thời gian thu hồi bình quân DSO: 45 ngày).
- Nợ vay ngắn hạn ngân hàng: 22.0 tỷ VNĐ.
- Nhận định ban giám đốc: Doanh thu Q1 đạt mục tiêu kế hoạch 96%, áp lực chi phí nhân sự và thuê văn phòng mới tạo gánh nặng lên biên lợi nhuận thuần.`;

  // 2. Excel Sample: Q2 2024 Detailed Ledger & Breakdown
  const excelText = `### Bảng Dữ Liệu Sheet: "DoanhThu_ChiTiet_Q2" trong file BangTinh_DoanhThu_ChiPhi_Q2_2024.xlsx
Số cột: 5 | Số dòng: 6
Tiêu đề cột: Nhóm Sản Phẩm | Doanh Thu Q2 (Tỷ VNĐ) | Tăng Trưởng vs Q1 | Biên Lợi Nhuận Gộp | Tỷ Trọng Doanh Thu

- Dòng 1: Phần Mềm Doanh Nghiệp (SaaS B2B) , Doanh Thu Q2: 24.5 tỷ VNĐ , Tăng Trưởng: +18.2% , Biên Gộp: 62% , Tỷ Trọng: 46.4%
- Dòng 2: Dịch Vụ Tư Vấn Chuyển Đổi Số , Doanh Thu Q2: 15.8 tỷ VNĐ , Tăng Trưởng: +14.5% , Biên Gộp: 38% , Tỷ Trọng: 29.9%
- Dòng 3: Tích Hợp Hệ Thống Phần Cứng & Hạ Tầng , Doanh Thu Q2: 8.9 tỷ VNĐ , Tăng Trưởng: +6.0% , Biên Gộp: 22% , Tỷ Trọng: 16.9%
- Dòng 4: Dịch Vụ Đào Tạo & Bảo Trì Hàng Năm , Doanh Thu Q2: 3.6 tỷ VNĐ , Tăng Trưởng: +20.0% , Biên Gộp: 55% , Tỷ Trọng: 6.8%
- Dòng 5: TỔNG CỘNG QUÝ 2/2024: Doanh Thu Đạt 52.8 tỷ VNĐ (Tăng 16.8% so với Q1/2024: 45.2 tỷ).

---

### Bảng Dữ Liệu Sheet: "ChiPhi_LoiNhuan_Q2" trong file BangTinh_DoanhThu_ChiPhi_Q2_2024.xlsx
Số cột: 4 | Số dòng: 5
Tiêu đề cột: Khoản Mục Chi Phí | Giá Trị Q2 (Tỷ VNĐ) | Tỷ Lệ / Doanh Thu | Ghi Chú Biến Động

- Dòng 1: Chi Phí Marketing & Chạy Chiến Dịch Digital: 7.9 tỷ VNĐ (14.9%) , Tăng 16.1% do mở rộng thị trường miền Trung
- Dòng 2: Chi Phí Lương & Thưởng Nhân Lực Công Nghệ: 5.6 tỷ VNĐ (10.6%) , Tuyển dụng thêm 12 kỹ sư AI và Cloud
- Dòng 3: Chi Phí Hạ Tầng Cloud Server (AWS, Azure): 2.1 tỷ VNĐ (3.9%) , Tối ưu được 8% nhờ di chuyển workload
- Dòng 4: Lợi Nhuận Sau Thuế Quý 2/2024: 7.9 tỷ VNĐ (Biên ròng: 14.9%, Tăng 46.3% so với 5.4 tỷ của Q1)`;

  // 3. Word Sample: Strategic Goals & Benchmarks
  const docxText = `TẬP ĐOÀN CÔNG NGHỆ TECHNOVA
NGHỊ QUYẾT HỘI ĐỒNG QUẢN TRỊ & MỤC TIÊU CHIẾN LƯỢC NĂM 2024 - 2025
Tệp văn bản Word (ChienLuoc_PhatTrien_KinhDoanh_2024_2025.docx)

CHƯƠNG 1: MỤC TIÊU DOANH THU VÀ THỊ PHẦN
1. Kế hoạch doanh thu toàn năm 2024: Đặt mục tiêu đạt mốc 215 tỷ VNĐ (trung bình mỗi quý cần đạt tối thiểu 53 - 55 tỷ VNĐ).
2. Định hướng cơ cấu sản phẩm: Ưu tiên dòng sản phẩm SaaS B2B có biên lợi nhuận gộp trên 60%. Giảm dần tỷ trọng phân phối phần cứng vốn có biên lợi nhuận mỏng dưới 25%.
3. Mở rộng địa bàn: Thiết lập văn phòng đại diện tại Đà Nẵng và Cần Thơ trong Quý 3/2024.

CHƯƠNG 2: ĐỐI CHUẨN THỊ TRƯỜNG & CHỈ SỐ BENCHMARK YÊU CẦU
- Yêu cầu ban điều hành đối chiếu kết quả tài chính nội bộ với mặt bằng chung toàn ngành CNTT Việt Nam và khu vực Đông Nam Á.
- Doanh nghiệp cần xác định rõ tốc độ tăng trưởng của đối thủ trực tiếp trong mảng AI & Cloud để đảm bảo không bị mất thị phần.
- Định mức chi phí SG&A toàn công ty không được vượt quá 23% tổng doanh thu thuần.
- Duy trì biên lợi nhuận ròng tối thiểu 15.0% trong cả năm 2024.

CHƯƠNG 3: NHIỆM VỤ TRỌNG TÂM CHO CÁC KHỐI
- Khối Tài chính: Thiết lập cơ chế kiểm soát chi phí thời gian thực, lập báo cáo đối chiếu đa chiều giữa các quý và phát hiện sớm các khoản mục vượt ngân sách.
- Khối Công nghệ: Đầu tư R&D hệ thống Trí tuệ Nhân tạo Tự hành (Autonomous AI) nhằm tự động hóa quy trình phân tích và báo cáo nghiệp vụ.`;

  const pdfChunks = chunkText(pdfText, 'sample_doc_1', 'BaoCao_TaiChinh_Q1_2024.pdf', 'pdf', {}, { page: 1, section: 'Báo cáo Q1' });
  const excelChunks = chunkText(excelText, 'sample_doc_2', 'BangTinh_DoanhThu_ChiPhi_Q2_2024.xlsx', 'xlsx', {}, { sheet: 'DoanhThu_ChiTiet_Q2', section: 'Chi tiết Q2' });
  const docxChunks = chunkText(docxText, 'sample_doc_3', 'ChienLuoc_PhatTrien_KinhDoanh_2024_2025.docx', 'docx', {}, { section: 'Chiến lược 2024-2025' });

  return [
    {
      metadata: {
        id: 'sample_doc_1',
        name: 'BaoCao_TaiChinh_Q1_2024.pdf',
        size: 142800,
        type: 'pdf',
        uploadedAt: new Date().toISOString(),
        pageCount: 4,
        totalChunks: pdfChunks.length,
        wordCount: pdfText.split(/\s+/).length,
      },
      chunks: pdfChunks,
    },
    {
      metadata: {
        id: 'sample_doc_2',
        name: 'BangTinh_DoanhThu_ChiPhi_Q2_2024.xlsx',
        size: 98400,
        type: 'xlsx',
        uploadedAt: new Date().toISOString(),
        sheetCount: 2,
        sheetNames: ['DoanhThu_ChiTiet_Q2', 'ChiPhi_LoiNhuan_Q2'],
        totalChunks: excelChunks.length,
        wordCount: excelText.split(/\s+/).length,
      },
      chunks: excelChunks,
    },
    {
      metadata: {
        id: 'sample_doc_3',
        name: 'ChienLuoc_PhatTrien_KinhDoanh_2024_2025.docx',
        size: 112500,
        type: 'docx',
        uploadedAt: new Date().toISOString(),
        totalChunks: docxChunks.length,
        wordCount: docxText.split(/\s+/).length,
      },
      chunks: docxChunks,
    },
  ];
}
