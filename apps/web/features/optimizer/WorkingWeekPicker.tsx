import type { WorkingWeek } from "@feriadex/core";
import { t, type MessageKey } from "@feriadex/i18n";
import { InfoTip } from "../../components/InfoTip";
import s from "./WorkingWeekPicker.module.css";

export function WorkingWeekPicker({
  value,
  onChange,
}: {
  value: WorkingWeek;
  onChange: (next: WorkingWeek) => void;
}) {
  const toggle = (i: number) => {
    const next = [...value] as boolean[];
    next[i] = !next[i];
    onChange(next as unknown as WorkingWeek);
  };

  return (
    <fieldset className={s.group}>
      <legend className={s.legend}>
        {t("form.workingWeek")}
        <InfoTip text={t("form.workingWeek.info")} />
      </legend>
      <div className={s.days}>
        {value.map((on, i) => (
          <button
            key={i}
            type="button"
            aria-pressed={on}
            className={on ? s.on : s.off}
            onClick={() => toggle(i)}
          >
            {t(`weekday.${i}` as MessageKey)}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
