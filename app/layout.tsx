import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Meerly Finance",
  description: "Personal finance tracker",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#f5f7fa] min-h-screen">{children}</body>
    </html>
  );
}
