'use client';

interface BorderBeamProps {
  size?: number;
  duration?: number;
  borderWidth?: number;
  colorFrom?: string;
  colorTo?: string;
  className?: string;
}

export default function BorderBeam({
  size = 250,
  duration = 12,
  borderWidth = 1.5,
  colorFrom = '#4E7FE8',
  colorTo = '#35BDD0',
  className = '',
}: BorderBeamProps) {
  return (
    <div
      style={{
        ['--size' as string]: `${size}px`,
        ['--duration' as string]: `${duration}s`,
        ['--border-width' as string]: `${borderWidth}px`,
        ['--color-from' as string]: colorFrom,
        ['--color-to' as string]: colorTo,
      }}
      className={`pointer-events-none absolute inset-0 rounded-[inherit] [border:calc(var(--border-width)*1px)_solid_transparent] 
      ![mask-clip:padding-box,border-box] ![mask-composite:intersect] 
      [mask:linear-gradient(transparent,transparent),linear-gradient(white,white)] 
      after:absolute after:aspect-square after:w-[calc(var(--size)*1px)] after:animate-border-beam after:[animation-duration:var(--duration)] after:[background:linear-gradient(to_left,var(--color-from),var(--color-to),transparent)] after:[offset-anchor:calc(var(--size)*1px)_50%] after:[offset-path:rect(0_auto_auto_0_round_calc(var(--size)*1px))] ${className}`}
    />
  );
}
