import { t } from "@feriadex/i18n";
import s from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={s.footer}>
      <a className={s.link} href="/politica-privacidade">
        {t("footer.privacy")}
      </a>
      <span className={s.copy}>
        © 2026 {t("app.title")} · {t("footer.rights")} · {t("footer.by")}{" "}
        <a
          className={s.link}
          href="https://github.com/k4rkarov"
          target="_blank"
          rel="noopener noreferrer"
        >
          @k4rkarov
        </a>
      </span>
    </footer>
  );
}
