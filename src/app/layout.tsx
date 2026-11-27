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
          <Navbar />
          <main className="flex-1">
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
