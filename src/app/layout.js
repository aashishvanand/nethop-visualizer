import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "NetHop Visualizer - Traceroute Mapping Tool",
  description: "Visualize your network's path with NetHop Visualizer. An interactive tool for mapping traceroute results and understanding network topology.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}