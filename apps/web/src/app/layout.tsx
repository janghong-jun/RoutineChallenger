import type { Metadata } from 'next';
import './globals.css';
import { StoreProvider } from '@/providers/StoreProvider';

export const metadata: Metadata = {
  title: 'Routine Challenger — 성장형 개인 루틴 관리 서비스',
  description: '매일의 실천을 경험치(EXP)와 타이틀로 축적하는 성장형 습관 챌린저',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
