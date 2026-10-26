import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KudiCart Ops — Central Operations & Vendor Portal",
  description: "Centralized marketplace governance for operations teams and scoped commerce tooling for certified partner boutiques.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="h-full bg-[#F7F7F5] text-[#111111] font-sans antialiased selection:bg-[#FFF0E8] selection:text-[#D94B17]">
        {children}
      </body>
    </html>
  );
}
