import type { Metadata } from "next";
import { t } from "@feriadex/i18n";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: t("app.title"),
  description: t("app.tagline"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
