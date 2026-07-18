import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KEY Research Console",
  description: "Experiment 0001: The Winter Medicine"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
