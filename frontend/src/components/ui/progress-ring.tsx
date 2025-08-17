interface ProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  className?: string;
}

export function ProgressRing({
  percentage,
  size = 48,
  strokeWidth = 8,
  color = "hsl(var(--avex-blue))",
  className = ""
}: ProgressRingProps) {
  const normalizedRadius = (size - strokeWidth) / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <svg
        className="progress-ring w-full h-full"
        viewBox={`0 0 ${size} ${size}`}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={normalizedRadius}
          stroke="hsl(var(--border))"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={normalizedRadius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          className="progress-ring-circle"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: strokeDashoffset,
          }}
        />
      </svg>
      
    </div>
  );
}
