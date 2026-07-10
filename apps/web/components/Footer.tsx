import { t } from "@feriadex/i18n";
import s from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={s.footer}>
      <a className={s.link} href="/politica-privacidade">
        {t("footer.privacy")}
      </a>
      <span className={s.copy}>
        © 2026 {t("app.title")} · {t("footer.rights")}
      </span>
    </footer>
  );
}
