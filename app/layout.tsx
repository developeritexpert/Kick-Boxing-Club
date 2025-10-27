import type { Metadata } from 'next';

import './globals.css';
import { Toaster } from 'react-hot-toast';

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
        <html lang="en">
            <body>
                {children}
                <Toaster position="top-right" reverseOrder={false} />
            </body>
        </html>
    );
}
