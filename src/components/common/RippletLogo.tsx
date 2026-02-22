interface RippletLogoProps {
  size?: number;
  className?: string;
  showGlow?: boolean;
}

export function RippletLogo({ size = 40, className = '', showGlow = true }: RippletLogoProps) {
  return (
    <div 
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg 
        viewBox="0 0 40 40" 
        className="w-full h-full"
        style={showGlow ? { filter: 'drop-shadow(0 0 8px hsl(var(--primary) / 0.5))' } : undefined}
      >
        <circle 
          cx="20" 
          cy="20" 
          r="5" 
          className="fill-primary"
        >
          <animate 
            attributeName="r" 
            values="4;5;4" 
            dur="2s" 
            repeatCount="indefinite"
          />
        </circle>
        
        <path
          d="M 20 10 A 10 10 0 0 1 30 20"
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.9"
        />
        <path
          d="M 30 20 A 10 10 0 0 1 20 30"
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.9"
        />
        
        <path
          d="M 20 5 A 15 15 0 0 1 35 20"
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.6"
        />
        <path
          d="M 35 20 A 15 15 0 0 1 20 35"
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.6"
        />
        
        <path
          d="M 20 1 A 19 19 0 0 1 39 20"
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.3"
        />
        <path
          d="M 39 20 A 19 19 0 0 1 20 39"
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.3"
        />
      </svg>
    </div>
  );
}
