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
      <meta property="og:title" content="NetHop Visualizer - Traceroute Mapping Tool" />
      <meta property="og:description" content="Visualize your network's path with NetHop Visualizer. An interactive tool for mapping traceroute results and understanding network topology." />
      <meta property="og:url" content="https://nethop-visualizer.aashishvanand.me/" />
      <meta property="og:type" content="website" />
      <script type="application/ld+json">
        {`
          {
            "@context": "http://schema.org",
            "@type": "SoftwareApplication",
            "name": "NetHop Visualizer",
            "description": "An interactive web application for mapping traceroute results.",
            "url": "https://nethop-visualizer.aashishvanand.me/",
            "applicationCategory": "Utility",
            "operatingSystem": "All"
          }
        `}
      </script>
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