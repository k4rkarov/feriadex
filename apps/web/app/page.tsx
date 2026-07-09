import { t } from "@feriadex/i18n";
import { Optimizer } from "../features/optimizer/Optimizer";

export default function Home() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-3xl font-bold">{t("app.title")}</h1>
      <p className="mt-2 text-muted">{t("app.tagline")}</p>
      <Optimizer />
    </main>
  );
}
