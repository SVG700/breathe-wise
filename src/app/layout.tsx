import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PranaAssistantModal from '@/components/prana/PranaAssistantModal';
import LocalDemoLauncher from '@/components/layout/LocalDemoLauncher';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Breathe Wise — Powered by Prana (प्राण)',
  description: 'Breathe Better. Live Better. Intelligent urban air-quality companion helping individuals and families make healthier daily decisions.',
  keywords: ['Air Quality', 'AQI', 'PM2.5', 'Breathe Wise', 'Prana', 'Urban Environmental Health', 'Pollution Tracker'],
  icons: {
    icon: '/favicon.ico',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} min-h-screen flex flex-col bg-[#F8FAF9] dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased`}>
        <AppProvider>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-emerald-800 focus:text-white focus:rounded-xl focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-white"
          >
            Skip to main content
          </a>
          <Navbar />
          <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
            {children}
          </main>
          <Footer />
          <PranaAssistantModal />
          <LocalDemoLauncher />
        </AppProvider>
      </body>
    </html>
  );
}
