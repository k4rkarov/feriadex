import { t } from "@feriadex/i18n";
import { Optimizer } from "../features/optimizer/Optimizer";

export default function Home() {
  return (
    <>
      <p className="mb-6 text-center text-[0.9rem] text-muted sm:text-left sm:text-[1.05rem]">
        {t("app.tagline")}
      </p>
      <Optimizer />
    </>
  );
}
