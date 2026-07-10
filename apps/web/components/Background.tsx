import type { CSSProperties } from "react";
import s from "./Background.module.css";

const FRONDS = [-78, -40, -8, 26, 62, 96];
const PALMS = 8;

const CLOUDS = [
  { top: "16%", left: "10%", s: 1, d: "0s", dur: "17s" },
  { top: "30%", left: "60%", s: 0.7, d: "-6s", dur: "21s" },
  { top: "50%", left: "26%", s: 0.85, d: "-3s", dur: "19s" },
  { top: "12%", left: "76%", s: 0.6, d: "-9s", dur: "23s" },
  { top: "42%", left: "86%", s: 0.75, d: "-12s", dur: "20s" },
  { top: "60%", left: "6%", s: 0.65, d: "-2s", dur: "18s" },
];

function Cloud() {
  return (
    <svg
      className={s.cloudSvg}
      viewBox="0 0 100 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g className={s.cloudFill}>
        <ellipse cx="50" cy="40" rx="40" ry="15" />
        <circle cx="32" cy="34" r="16" />
        <circle cx="54" cy="24" r="20" />
        <circle cx="74" cy="35" r="14" />
      </g>
    </svg>
  );
}

function Palm() {
  return (
    <svg
      className={s.palm}
      viewBox="0 0 200 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M104 300 C 96 220 94 160 100 108 C 106 150 108 230 116 300 Z"
        className={s.trunk}
      />
      <g className={s.crown}>
        {FRONDS.map((deg, i) => (
          <ellipse
            key={i}
            cx="150"
            cy="108"
            rx="52"
            ry="13"
            className={s.frond}
            transform={`rotate(${deg} 100 108)`}
          />
        ))}
        <circle cx="100" cy="108" r="9" className={s.frond} />
      </g>
    </svg>
  );
}

/**
 * A row of swaying palm trees along the bottom (pure CSS/SVG, self-contained).
 * Sits behind the content, non-interactive; stops moving under
 * prefers-reduced-motion. Each palm is slightly varied (delay/scale/flip) so
 * the row looks natural rather than cloned.
 */
export function Background() {
  return (
    <>
      <div className={s.sun} aria-hidden="true" />
      <div className={s.moon} aria-hidden="true" />
      <div className={s.clouds} aria-hidden="true">
        {CLOUDS.map((c, i) => (
          <div
            key={i}
            className={s.cloud}
            style={
              {
                top: c.top,
                left: c.left,
                width: `${Math.round(120 * c.s)}px`,
                "--d": c.d,
                "--dur": c.dur,
              } as CSSProperties
            }
          >
            <Cloud />
          </div>
        ))}
      </div>
      <div className={s.wrap} aria-hidden="true">
        {Array.from({ length: PALMS }, (_, i) => (
        <div
          key={i}
          className={s.item}
          style={
            {
              "--d": `${(-i * 0.7).toFixed(1)}s`,
              "--flip": i % 2 ? -1 : 1,
              "--s": i % 3 === 0 ? 0.82 : i % 3 === 1 ? 1 : 0.92,
            } as CSSProperties
          }
        >
          <Palm />
        </div>
        ))}
      </div>
    </>
  );
}
