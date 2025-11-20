// import type { Metadata } from 'next';
// import { Toaster } from 'react-hot-toast';
// import Script from 'next/script';
// import { ChromecastProvider } from '@/lib/context/ChromecastContext';
// import './globals.css';

// import { SessionProvider } from '@/components/SessionProvider';

// export const metadata: Metadata = {
//     title: 'Kick Boxing Club Fitness',
//     description: 'Kick Boxing Club Fitness',
// };

// export default function RootLayout({
//     children,
// }: Readonly<{
//     children: React.ReactNode;
// }>) {
//     return (
//         <html lang="en" suppressHydrationWarning>
//             <head>
//                 <meta name="viewport" content="width=device-width, initial-scale=1.0" />

//                 {/* BigInt Polyfill - MUST be first, inline to execute immediately */}
//                 <script
//                     dangerouslySetInnerHTML={{
//                         __html: `
//                             (function() {
//                                 if (typeof BigInt === 'undefined') {
//                                     // Define BigInt globally before any modules load
//                                     var BigIntPolyfill = function(value) {
//                                         var n = Number(value);
//                                         var obj = Object.create(null);

//                                         obj.valueOf = function() { return n; };
//                                         obj.toString = function(radix) {
//                                             return n.toString(radix || 10);
//                                         };
//                                         obj.toLocaleString = function() {
//                                             return n.toLocaleString();
//                                         };

//                                         return obj;
//                                     };

//                                     // Set on both window and global
//                                     window.BigInt = BigIntPolyfill;
//                                     if (typeof global !== 'undefined') {
//                                         global.BigInt = BigIntPolyfill;
//                                     }

//                                     console.log('BigInt polyfill active for Safari 13');
//                                 }
//                             })();
//                         `,
//                     }}
//                 />
//                 <script src="/bigint-polyfill.js" />
//                 <Script
//                     src="https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1"
//                     strategy="beforeInteractive"
//                 />
//             </head>
//             <body>
//                 <SessionProvider>
//                     <ChromecastProvider>{children}</ChromecastProvider>
//                 </SessionProvider>
//                 <Toaster position="top-right" reverseOrder={false} />
//             </body>
//         </html>
//     );
// }

// code in main branch
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
