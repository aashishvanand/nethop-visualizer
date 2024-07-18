import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "NetHop Visualizer - Traceroute Mapping Tool",
  description: "Visualize your network's path with NetHop Visualizer. An interactive tool for mapping traceroute results and understanding network topology.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-google-analytics-opt-out="">
      <head>
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "n94xuvlbc4");
          `}
        </Script>
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}