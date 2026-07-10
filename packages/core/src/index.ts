// Public entry for @feriadex/core. Consumers import from here only.

export type { ISODate } from "./calendar/date";
export {
  addDays,
  compareDate,
  dayOfWeek,
  diffDays,
  eachDay,
  toISO,
  toUTC,
} from "./calendar/date";

export type { Calendar, WorkingWeek } from "./calendar/calendar";
export { createCalendar, DEFAULT_WORKING_WEEK } from "./calendar/calendar";

export { easterSunday } from "./calendar/easter";
export { isAllowedStart } from "./calendar/start-rule";

export type { Holiday, VacationWindow } from "./types";

export { evaluateWindow } from "./bridge/evaluate";
export {
  describeWindow,
  type DayKind,
  type DayMark,
} from "./bridge/describe";
export {
  optimizeSingleBlock,
  rankWindows,
  type OptimizeOptions,
} from "./bridge/optimize";

export {
  validateScheme,
  type SplitScheme,
  type SplitConstraints,
  type ValidationResult,
} from "./split/scheme";
export {
  solveSplit,
  bestSplit,
  type SplitPlan,
  type SolveOptions,
} from "./split/solve";
export { partitionsInto } from "./split/partitions";
