import React from "react";

const toneMap = {
  indigo: "enrollment-stat-card--indigo",
  emerald: "enrollment-stat-card--emerald",
  amber: "enrollment-stat-card--amber",
  rose: "enrollment-stat-card--rose",
  slate: "enrollment-stat-card--slate",
};

export default function EnrollmentStatCard({
  label,
  value,
  hint,
  title,
  subtitle,
  tone = "indigo",
  pageClassName = "",
}) {
  const displayLabel = label || title;
  const displayHint = hint || subtitle;

  return (
    <div className={`${pageClassName}__stat-card`}>
      <div className={`${pageClassName}__stat-row`}>
        <div>
          {displayLabel ? (
            <div className={`${pageClassName}__stat-label`}>{displayLabel}</div>
          ) : null}

          <div className={`${pageClassName}__stat-value`}>{value}</div>

          {displayHint ? (
            <div className={`${pageClassName}__stat-hint`}>{displayHint}</div>
          ) : null}
        </div>

        <div
          className={`${pageClassName}__stat-dot ${toneMap[tone] || toneMap.indigo}`}
        />
      </div>
    </div>
  );
}