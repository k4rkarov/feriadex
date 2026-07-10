import { t } from "@feriadex/i18n";

export const metadata = { title: `${t("privacy.title")} · ${t("app.title")}` };

export default function PrivacyPage() {
  return (
    <article className="py-4">
      <h1 className="mb-4 text-2xl font-bold">{t("privacy.title")}</h1>
      <p className="text-[1.05rem] leading-relaxed text-muted">
        {t("privacy.body")}
      </p>
      <p className="mt-6">
        <a className="text-accent" href="/">
          ← {t("app.title")}
        </a>
      </p>
    </article>
  );
}
