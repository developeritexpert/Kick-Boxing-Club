import type { Metadata } from "next";

import "./globals.css";
import { Toaster } from "react-hot-toast";


export const metadata: Metadata = {
  title: "Kick Boxing Club Fitness",
  description: "Kick Boxing Club Fitness",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body 
      className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white"
      >
        {children}
        <Toaster position="top-right" reverseOrder={false} />
      </body>
    </html>
  );
}
