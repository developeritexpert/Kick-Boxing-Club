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
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            </head>
            <body>
                {children}
                <Toaster position="top-right" reverseOrder={false} />
            </body>
        </html>
    );
}
