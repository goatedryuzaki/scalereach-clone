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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Anton&family=Bangers&family=Bebas+Neue&family=Black+Ops+One&family=Gelasio:ital,wght@0,700;1,700&family=Inter:wght@400;500;600;700;800;900&family=Kanit:ital,wght@0,700;0,800;1,800&family=Libre+Baskerville:wght@700&family=Lilita+One&family=Lora:ital,wght@0,600;0,700;1,600&family=Luckiest+Guy&family=Montserrat:wght@700;800;900&family=Oswald:wght@600;700&family=Permanent+Marker&family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Poppins:wght@600;700;800;900&family=Righteous&family=Russo+One&family=Rubik:wght@700;800;900&family=Outfit:wght@700;800&family=Space+Grotesk:wght@700&display=swap"
        />
      </head>
      <body className="min-h-screen bg-[#090A0F] text-[#F8FAFC] antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
        {children}
      </body>
    </html>
  );
}
