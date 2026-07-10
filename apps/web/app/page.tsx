import { t } from "@feriadex/i18n";
import { Optimizer } from "../features/optimizer/Optimizer";

export default function Home() {
  return (
    <>
      <p className="mb-6 text-[1.05rem] text-muted">{t("app.tagline")}</p>
      <Optimizer />
    </>
  );
}
