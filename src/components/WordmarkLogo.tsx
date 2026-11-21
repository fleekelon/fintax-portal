export function WordmarkLogo() {
  const letters = ['F', 'I', 'N', 'T', 'A', 'X'];
  return (
    <svg
      width="140"
      height="20"
      viewBox="0 0 140 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="FINTAX"
    >
      {letters.map((ch, idx) => (
        <g key={`${ch}-${idx}`} transform={`translate(${idx * 24}, 0)`}>
          <rect width="20" height="20" rx="3" fill="currentColor" />
          <text
            x="10"
            y="14.2"
            textAnchor="middle"
            fill="var(--bg)"
            fontFamily="Inter Tight, Inter, sans-serif"
            fontWeight="800"
            fontSize="12.2"
          >
            {ch}
          </text>
        </g>
      ))}
    </svg>
  );
}
