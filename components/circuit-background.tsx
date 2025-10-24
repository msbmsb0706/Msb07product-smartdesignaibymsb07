export function CircuitBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg
        className="absolute inset-0 w-full h-full opacity-10"
        viewBox="0 0 1200 800"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Circuit board pattern */}
        <defs>
          <pattern id="circuit" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
            <path
              d="M20 20h60v20h-20v20h-20v-20h-20v-20z"
              stroke="currentColor"
              strokeWidth="1"
              fill="none"
              className="text-primary/20"
            />
            <circle cx="20" cy="20" r="3" fill="currentColor" className="text-accent/40" />
            <circle cx="80" cy="40" r="3" fill="currentColor" className="text-primary/40" />
            <circle cx="40" cy="80" r="3" fill="currentColor" className="text-accent/40" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#circuit)" />

        {/* Animated circuit lines */}
        <g className="circuit-pulse">
          <path
            d="M100 100 L300 100 L300 200 L500 200"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            className="text-primary/30"
          />
          <path
            d="M200 300 L400 300 L400 150 L600 150"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            className="text-accent/30"
          />
        </g>
      </svg>
    </div>
  )
}
