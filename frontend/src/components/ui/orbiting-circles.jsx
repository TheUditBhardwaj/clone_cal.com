import React from "react";

export function OrbitingCircles({
  className,
  children,
  reverse,
  duration = 20,
  delay = 10,
  radius = 50,
  path = true,
}) {
  return (
    <>
      <style>{`
        .orbit-item {
          position: absolute;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: orbit-animation linear infinite;
        }
        @keyframes orbit-animation {
          from { transform: rotate(0deg) translateY(calc(var(--radius) * 1px)) rotate(0deg); }
          to { transform: rotate(360deg) translateY(calc(var(--radius) * 1px)) rotate(-360deg); }
        }
      `}</style>
      <div
        className={`absolute inset-0 flex items-center justify-center pointer-events-none ${className}`}
      >
        {path && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full pointer-events-none"
          >
            <circle
              className="stroke-slate-900/5 stroke-1"
              cx="50%"
              cy="50%"
              r={radius}
              fill="none"
            />
          </svg>
        )}
        <div
          className="orbit-item"
          style={{
            "--radius": radius,
            animationDuration: `${duration}s`,
            animationDelay: `-${delay}s`,
            animationDirection: reverse ? "reverse" : "normal",
          }}
        >
          {children}
        </div>
      </div>
    </>
  );
}
