import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import Script from 'next/script';
import { ChromecastProvider } from '@/lib/context/ChromecastContext';
import './globals.css';

import { SessionProvider } from '@/components/SessionProvider';

export const metadata: Metadata = {
    title: 'Kick Boxing Club Fitness',
    description: 'Kick Boxing Club Fitness',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />

                <Script
                    src="https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1"
                    strategy="beforeInteractive"
                />
            </head>
            <body>
                <SessionProvider>
                    <ChromecastProvider>{children}</ChromecastProvider>
                </SessionProvider>

                {/* {children} */}
                <Toaster position="top-right" reverseOrder={false} />
            </body>
        </html>
    );
}
