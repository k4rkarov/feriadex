import type { Metadata } from "next";
import { t } from "@feriadex/i18n";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: t("app.title"),
  description: t("app.tagline"),
};

// Apply the saved/system theme before paint to avoid a flash.
const themeInit = `(function(){try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t)}else{document.documentElement.setAttribute('data-theme',matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light')}}catch(e){}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        <div className="mx-auto w-full max-w-4xl px-6">
          <Header />
          <main>{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
