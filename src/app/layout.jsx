import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata = {
  title: 'NexusDoc Enterprise - Nền Tảng Phân Tích & Đối Chiếu Báo Cáo Doanh Nghiệp',
  description:
    'Hệ thống trí tuệ doanh nghiệp tự hành: Phân tích tài liệu đa định dạng (PDF, Word, Excel), đối chiếu chéo số liệu và tích hợp thông tin thị trường thời gian thực.',
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col bg-[#090d16] text-slate-100"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
