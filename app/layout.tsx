import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "토크스 - 어색할 때 꺼낼 가벼운 대화 주제",
  description: "회사 점심시간, 소개팅, 모임에서 자연스럽게 쓸 수 있는 최신 스몰토크 주제",
  keywords: ["소개팅 대화 주제", "회사 대화", "스몰토크", "대화 소재"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        {/* 카카오 SDK */}
        <Script
          src="https://developers.kakao.com/sdk/js/kakao.js"
          strategy="beforeInteractive"
        />
      </head>
      <body>
        {children}
        
        {/* 카카오 SDK 초기화 */}
        <Script id="kakao-init" strategy="afterInteractive">
          {`
            if (window.Kakao && !window.Kakao.isInitialized()) {
              window.Kakao.init('${process.env.NEXT_PUBLIC_KAKAO_JS_KEY}');
            }
          `}
        </Script>
      </body>
    </html>
  );
}