import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ScaleReach — AI Short-Form Video Clip Generator',
  description:
    'Free, personal, zero-login clone of ScaleReach. Create viral 9:16 clips with automated transcription, virality scoring, kinetic subtitles, and split-screen templates without paywalls.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#090A0F] text-[#F8FAFC] antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
        {children}
      </body>
    </html>
  );
}
