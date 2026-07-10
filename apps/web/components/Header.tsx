import { t } from "@feriadex/i18n";
import { ThemeToggle } from "./ThemeToggle";
import s from "./Header.module.css";

const LAW_URL =
  "https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2017/lei/l13467.htm";

export function Header() {
  return (
    <header className={s.header}>
      <span className={s.title}>{t("app.title")}</span>
      <div className={s.actions}>
        <a
          className={s.law}
          href={LAW_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          Lei Nº 13.467/2017
        </a>
        <ThemeToggle />
      </div>
    </header>
  );
}
