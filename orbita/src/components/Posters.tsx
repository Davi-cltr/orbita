// Ilustrações dos cartões-postais, em SVG chapado no estilo dos pôsteres de viagem

const stars = (seed: number, n = 26, h = 300) =>
  Array.from({ length: n }, (_, i) => {
    const x = (Math.sin(seed * 12.9 + i * 78.2) * 43758.5) % 1
    const y = (Math.sin(seed * 4.1 + i * 12.7) * 24634.6) % 1
    return <circle key={i} cx={Math.abs(x) * 300} cy={Math.abs(y) * h} r={i % 5 === 0 ? 1.6 : 0.9} fill="#f1ecff" opacity={0.8} />
  })

export function PosterLua() {
  return (
    <svg viewBox="0 0 300 360" className="h-full w-full">
      <rect width="300" height="360" fill="#1c1a6b" />
      {stars(1, 30, 220)}
      <circle cx="225" cy="80" r="44" fill="#2b54db" />
      <path d="M195 62c14-6 22 4 34 0s20 6 18 16-16 8-24 18-22 4-26-6 -12-22-2-28z" fill="#3fb37f" />
      <path d="M181 92a44 44 0 0 0 88 0" fill="#13115a" opacity=".45" />
      <path d="M0 255c60-22 120-30 180-20s90 6 120-6v131H0z" fill="#c9c5de" />
      <ellipse cx="70" cy="300" rx="34" ry="9" fill="#8f8aae" />
      <ellipse cx="220" cy="320" rx="22" ry="6" fill="#8f8aae" />
      <ellipse cx="160" cy="282" rx="12" ry="3.5" fill="#8f8aae" />
      <ellipse cx="148" cy="262" rx="22" ry="4" fill="#13115a" opacity=".25" />
      {/* astronauta no meio do salto */}
      <g transform="translate(150 175) rotate(-14)">
        <path d="M-8 -38 -40 -58" stroke="#ffc94a" strokeWidth="2" strokeDasharray="4 6" />
        <path d="M-16 -20 -52 -34" stroke="#ffc94a" strokeWidth="2" strokeDasharray="4 6" />
        <rect x="-16" y="-10" width="32" height="38" rx="12" fill="#f1ecff" />
        <rect x="-26" y="-4" width="12" height="26" rx="6" fill="#c3bde6" />
        <rect x="-14" y="22" width="11" height="24" rx="5" fill="#f1ecff" transform="rotate(18 -9 22)" />
        <rect x="3" y="22" width="11" height="24" rx="5" fill="#f1ecff" transform="rotate(-24 8 22)" />
        <rect x="12" y="0" width="10" height="22" rx="5" fill="#f1ecff" transform="rotate(-50 17 0)" />
        <circle cx="0" cy="-22" r="17" fill="#f1ecff" />
        <rect x="-11" y="-29" width="22" height="13" rx="6.5" fill="#ff5a1f" />
      </g>
    </svg>
  )
}

export function PosterMarte() {
  return (
    <svg viewBox="0 0 300 360" className="h-full w-full">
      <rect width="300" height="360" fill="#d2462a" />
      <rect y="70" width="300" height="80" fill="#e05b2f" />
      <rect y="150" width="300" height="70" fill="#ec7a3c" />
      {[78, 58, 40, 26].map((r, i) => (
        <circle key={r} cx="190" cy="214" r={r} fill="#49d3e6" opacity={0.18 + i * 0.16} />
      ))}
      <circle cx="190" cy="214" r="13" fill="#f1ecff" />
      <path d="M0 228c40-14 70-10 110 2s80 10 120-8 50-8 70 0v138H0z" fill="#b8391f" />
      <path d="M0 262c50 6 90-16 140-10s70 26 110 18 40-14 50-10v100H0z" fill="#8e2a1c" />
      <path d="M0 304c60-12 120 0 170 6s100-4 130-10v60H0z" fill="#5e1a12" />
      <path d="M40 228l26-22 18 14 14-10 30 26z" fill="#a8341c" />
    </svg>
  )
}

export function PosterJupiter() {
  return (
    <svg viewBox="0 0 300 360" className="h-full w-full">
      <defs>
        <clipPath id="jp">
          <circle cx="210" cy="250" r="170" />
        </clipPath>
      </defs>
      <rect width="300" height="360" fill="#10104a" />
      {stars(3, 34, 200)}
      <g clipPath="url(#jp)">
        <rect width="300" height="360" fill="#e6b27a" />
        {[
          [80, 26, '#f8e6c2'],
          [118, 18, '#c9804f'],
          [146, 30, '#f8e6c2'],
          [190, 16, '#9e5236'],
          [214, 34, '#eac08a'],
          [262, 20, '#c9804f'],
          [296, 26, '#f8e6c2'],
          [330, 30, '#9e5236'],
        ].map(([y, h, c], i) => (
          <path key={i} d={`M0 ${y}q75 ${i % 2 ? 8 : -8} 150 0t150 0v${h}q-75 ${i % 2 ? -6 : 6} -150 0t-150 0z`} fill={c as string} />
        ))}
        <ellipse cx="170" cy="250" rx="44" ry="22" fill="#f8e6c2" />
        <ellipse cx="170" cy="250" rx="36" ry="16" fill="#d2462a" />
        <ellipse cx="166" cy="248" rx="20" ry="8" fill="#ec7a3c" />
      </g>
      <circle cx="210" cy="250" r="170" fill="none" stroke="#49d3e6" strokeWidth="3" opacity=".7" />
      {/* nave */}
      <g transform="translate(70 92) rotate(-18)">
        <path d="M-26 0h40l14 7-14 7h-40z" fill="#f1ecff" />
        <path d="M-18 0l-10-12h14l8 12z M-18 14l-10 12h14l8-12z" fill="#ff5a1f" />
        <circle cx="10" cy="7" r="3" fill="#10104a" />
        <path d="M-26 4h-16M-26 10h-24" stroke="#ffc94a" strokeWidth="2" />
      </g>
    </svg>
  )
}

export function PosterSaturno() {
  return (
    <svg viewBox="0 0 300 360" className="h-full w-full">
      <defs>
        <clipPath id="sf">
          <rect x="0" y="178" width="300" height="200" />
        </clipPath>
      </defs>
      <rect width="300" height="360" fill="#2a2790" />
      {stars(7, 40, 360)}
      <g transform="rotate(-16 150 180)">
        <ellipse cx="150" cy="180" rx="138" ry="34" fill="none" stroke="#c4a06a" strokeWidth="6" />
        <ellipse cx="150" cy="180" rx="122" ry="29" fill="none" stroke="#fde3a0" strokeWidth="14" />
        <ellipse cx="150" cy="180" rx="100" ry="23" fill="none" stroke="#e9b86a" strokeWidth="6" />
        <circle cx="150" cy="180" r="66" fill="#f4c977" />
        <path d="M84 162h132v12H84zM86 196h128v10H86z" fill="#e2ab5c" />
        <path d="M150 114a66 66 0 0 0 0 132" fill="#f9dc9d" opacity=".55" />
        <g clipPath="url(#sf)">
          <ellipse cx="150" cy="180" rx="138" ry="34" fill="none" stroke="#c4a06a" strokeWidth="6" />
          <ellipse cx="150" cy="180" rx="122" ry="29" fill="none" stroke="#fde3a0" strokeWidth="14" />
          <ellipse cx="150" cy="180" rx="100" ry="23" fill="none" stroke="#e9b86a" strokeWidth="6" />
        </g>
      </g>
    </svg>
  )
}

export function PosterEuropa() {
  return (
    <svg viewBox="0 0 300 360" className="h-full w-full">
      <rect width="300" height="360" fill="#1c1a6b" />
      {stars(9, 24, 160)}
      <circle cx="90" cy="90" r="66" fill="#e6b27a" />
      <path d="M26 74h128v10H26zM24 100h132v14H24zM34 126h112v8H34z" fill="#c9804f" />
      <ellipse cx="110" cy="112" rx="12" ry="6" fill="#d2462a" />
      <path d="M0 200c80-16 200-16 300 0v160H0z" fill="#e9f3ff" />
      <path d="M0 230c90-10 210-8 300 4v126H0z" fill="#d3e6fb" />
      <path d="M-10 250l120 40 80-30 130 50M30 360l60-70 40 14 70-60 110-12M150 205l-20 40 30 20-10 50" stroke="#b5502f" strokeWidth="2.2" fill="none" opacity=".75" />
      <path d="M40 212l90 20 70-12" stroke="#b5502f" strokeWidth="1.4" fill="none" opacity=".5" />
      {/* patinadora */}
      <g transform="translate(196 236)">
        <path d="M-40 34c20 6 40 6 60-2" stroke="#49d3e6" strokeWidth="2" fill="none" strokeDasharray="3 5" />
        <circle cx="0" cy="-30" r="9" fill="#f1ecff" />
        <rect x="-6" y="-21" width="12" height="24" rx="5" fill="#ff5a1f" />
        <path d="M-5 -16l-18 8M5 -16l18 -10M-2 3l-8 24M3 3l14 18" stroke="#f1ecff" strokeWidth="5" strokeLinecap="round" />
        <path d="M-16 28h12M12 23l10 6" stroke="#10104a" strokeWidth="2.5" strokeLinecap="round" />
      </g>
    </svg>
  )
}
