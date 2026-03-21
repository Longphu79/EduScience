import React from "react";

const toneMap = {
  indigo: "lesson-stat-card--indigo",
  emerald: "lesson-stat-card--emerald",
  amber: "lesson-stat-card--amber",
  rose: "lesson-stat-card--rose",
};

export default function LessonStatCard({
  label,
  value,
  hint,
  tone = "indigo",
  pageClassName = "",
}) {
  return (
    <div className={`${pageClassName}__stat-card`}>
      <div className={`${pageClassName}__stat-row`}>
        <div>
          <p className={`${pageClassName}__stat-label`}>{label}</p>
          <h3 className={`${pageClassName}__stat-value`}>{value}</h3>
          {hint ? (
            <p className={`${pageClassName}__stat-hint`}>{hint}</p>
          ) : null}
        </div>

        <div
          className={`${pageClassName}__stat-dot ${toneMap[tone] || toneMap.indigo}`}
        />
      </div>
    </div>
  );
}