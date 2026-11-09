/**
 * Original LifeZoi illustrations, drawn as SVG for this app.
 * Purple Edition palette only. Decorative: each has an empty alt via aria-hidden
 * unless a label is given.
 */

const P = {
  royal: "#6A3DA8",
  lavender: "#B98EE5",
  teal: "#2F8F83",
  sage: "#A8BFAE",
  gold: "#F2B65D",
  ivory: "#F9F7F2",
  skin: "#E8B48F",
  skin2: "#B9825E",
  ink: "#3B2462",
};

export type ArtName = "yoga" | "meal" | "music" | "book" | "brain" | "walk" | "sleep" | "plan" | "day" | "chair" | "checkin";

function Frame({ children, label, bg }: { children: React.ReactNode; label?: string; bg: string }) {
  return (
    <svg
      viewBox="0 0 320 200"
      className="lz-art"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      <rect width="320" height="200" rx="18" fill={bg} />
      {children}
    </svg>
  );
}

function Sun({ x = 262, y = 46, r = 22 }: { x?: number; y?: number; r?: number }) {
  return <circle cx={x} cy={y} r={r} fill={P.gold} opacity="0.9" />;
}

export function Art({ name, label }: { name: ArtName; label?: string }) {
  switch (name) {
    case "yoga":
      return (
        <Frame bg="#F1E8FB" label={label}>
          <Sun />
          <ellipse cx="160" cy="176" rx="110" ry="10" fill={P.lavender} opacity="0.6" />
          <rect x="70" y="166" width="180" height="10" rx="5" fill={P.teal} />
          <circle cx="160" cy="70" r="15" fill={P.skin} />
          <path d="M160 86 L160 128" stroke={P.royal} strokeWidth="18" strokeLinecap="round" />
          <path d="M160 96 L118 70 M160 96 L202 70" stroke={P.skin} strokeWidth="8" strokeLinecap="round" />
          <path d="M160 128 L128 160 L178 160 M160 128 L192 160" stroke={P.ink} strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </Frame>
      );
    case "chair":
      return (
        <Frame bg="#FDF4E4" label={label}>
          <Sun x={52} />
          <path d="M150 110 h70 v60 M150 110 v60 M150 140 h70" stroke={P.teal} strokeWidth="7" strokeLinecap="round" fill="none" />
          <path d="M218 110 v-50" stroke={P.teal} strokeWidth="7" strokeLinecap="round" />
          <circle cx="182" cy="56" r="14" fill={P.skin2} />
          <path d="M182 72 L182 108" stroke={P.royal} strokeWidth="16" strokeLinecap="round" />
          <path d="M182 80 L140 54 M182 80 L224 54" stroke={P.skin2} strokeWidth="7" strokeLinecap="round" />
          <path d="M182 108 L140 112 L132 160" stroke={P.ink} strokeWidth="10" strokeLinecap="round" fill="none" />
          <path d="M182 108 L150 118" stroke={P.ink} strokeWidth="10" strokeLinecap="round" />
          <path d="M60 170 h200" stroke={P.gold} strokeWidth="4" strokeLinecap="round" />
        </Frame>
      );
    case "meal":
      return (
        <Frame bg="#EEF3EF" label={label}>
          <circle cx="160" cy="104" r="68" fill="#fff" stroke={P.sage} strokeWidth="6" />
          <path d="M160 104 L160 40 A64 64 0 0 1 222 112 Z" fill="#7FB38E" />
          <path d="M160 104 L222 112 A64 64 0 0 1 128 160 Z" fill={P.gold} />
          <path d="M160 104 L128 160 A64 64 0 0 1 160 40 Z" fill="#D9826A" />
          <circle cx="186" cy="74" r="7" fill="#4E8F5F" />
          <circle cx="198" cy="92" r="6" fill="#4E8F5F" />
          <circle cx="140" cy="86" r="6" fill="#F4C9B8" />
          <path d="M66 50 v90 M58 50 v26 a8 8 0 0 0 16 0 v-26" stroke={P.royal} strokeWidth="5" strokeLinecap="round" fill="none" />
          <path d="M256 50 c14 10 14 40 0 48 v42" stroke={P.royal} strokeWidth="5" strokeLinecap="round" fill="none" />
        </Frame>
      );
    case "music":
      return (
        <Frame bg="#F2EEF8" label={label}>
          <path d="M40 140 C 90 100, 130 170, 180 130 S 260 110, 290 140" stroke={P.lavender} strokeWidth="6" fill="none" strokeLinecap="round" />
          <path d="M40 160 C 90 120, 130 190, 180 150 S 260 130, 290 160" stroke={P.sage} strokeWidth="6" fill="none" strokeLinecap="round" />
          <path d="M120 60 v62 M120 60 l50 -12 v58" stroke={P.royal} strokeWidth="7" strokeLinecap="round" fill="none" />
          <ellipse cx="110" cy="124" rx="14" ry="10" fill={P.royal} />
          <ellipse cx="160" cy="108" rx="14" ry="10" fill={P.royal} />
          <path d="M228 50 v42" stroke={P.teal} strokeWidth="6" strokeLinecap="round" />
          <ellipse cx="220" cy="94" rx="11" ry="8" fill={P.teal} />
          <circle cx="262" cy="56" r="6" fill={P.gold} />
          <circle cx="76" cy="62" r="4" fill={P.gold} />
        </Frame>
      );
    case "book":
      return (
        <Frame bg="#FBF6EC" label={label}>
          <path d="M160 60 C 130 46, 90 46, 62 56 V 158 C 90 148, 130 148, 160 162 Z" fill="#fff" stroke={P.royal} strokeWidth="5" strokeLinejoin="round" />
          <path d="M160 60 C 190 46, 230 46, 258 56 V 158 C 230 148, 190 148, 160 162 Z" fill="#fff" stroke={P.royal} strokeWidth="5" strokeLinejoin="round" />
          {[78, 94, 110, 126].map((y) => (
            <g key={y}>
              <path d={`M80 ${y} h60`} stroke={P.lavender} strokeWidth="4" strokeLinecap="round" />
              <path d={`M180 ${y} h60`} stroke={P.sage} strokeWidth="4" strokeLinecap="round" />
            </g>
          ))}
          <path d="M226 40 v34 l10 -8 l10 8 v-34 z" fill={P.gold} />
          <path d="M30 170 h260" stroke={P.teal} strokeWidth="4" strokeLinecap="round" />
        </Frame>
      );
    case "brain":
      return (
        <Frame bg="#F4EDFC" label={label}>
          {[0, 1, 2].map((row) =>
            [0, 1, 2].map((col) => (
              <rect
                key={`${row}-${col}`}
                x={90 + col * 48}
                y={40 + row * 44}
                width="42"
                height="38"
                rx="8"
                fill={(row + col) % 2 === 0 ? P.royal : "#fff"}
                stroke={P.royal}
                strokeWidth="3"
              />
            )),
          )}
          <text x="111" y="66" fill="#fff" fontSize="22" fontWeight="700" textAnchor="middle" fontFamily="sans-serif">3</text>
          <text x="207" y="154" fill="#fff" fontSize="22" fontWeight="700" textAnchor="middle" fontFamily="sans-serif">7</text>
          <text x="159" y="110" fill="#fff" fontSize="22" fontWeight="700" textAnchor="middle" fontFamily="sans-serif">5</text>
          <circle cx="262" cy="56" r="14" fill={P.gold} />
          <path d="M256 56 l5 5 l9 -10" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round" />
          <circle cx="54" cy="150" r="10" fill={P.teal} />
        </Frame>
      );
    case "walk":
      return (
        <Frame bg="#EEF5F3" label={label}>
          <Sun x={60} y={50} />
          <path d="M0 150 C 80 120, 160 170, 320 130 V200 H0 Z" fill={P.sage} />
          <path d="M240 150 v-40 M240 110 c-20 0 -20 -28 0 -36 c20 8 20 36 0 36" fill="#5F9C76" stroke="#3F7356" strokeWidth="3" />
          <circle cx="150" cy="64" r="13" fill={P.skin} />
          <path d="M150 78 L146 116" stroke={P.royal} strokeWidth="15" strokeLinecap="round" />
          <path d="M148 88 L126 106 M148 88 L170 102" stroke={P.skin} strokeWidth="7" strokeLinecap="round" />
          <path d="M146 116 L130 150 M146 116 L166 148" stroke={P.ink} strokeWidth="10" strokeLinecap="round" />
        </Frame>
      );
    case "sleep":
      return (
        <Frame bg="#ECE6F6" label={label}>
          <path d="M230 40 a36 36 0 1 0 30 56 a28 28 0 1 1 -30 -56 z" fill={P.gold} />
          {[[60, 50], [100, 34], [150, 60], [190, 30], [80, 90]].map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="3" fill={P.lavender} />
          ))}
          <rect x="50" y="128" width="220" height="34" rx="12" fill={P.royal} />
          <rect x="60" y="112" width="70" height="26" rx="12" fill="#fff" />
          <path d="M120 128 h140 v-6 a14 14 0 0 0 -14 -14 h-112 z" fill={P.lavender} />
        </Frame>
      );
    case "plan":
      return (
        <Frame bg="#F6F0FC" label={label}>
          <rect x="84" y="30" width="152" height="146" rx="14" fill="#fff" stroke={P.royal} strokeWidth="5" />
          {[62, 96, 130].map((y, i) => (
            <g key={y}>
              <circle cx="112" cy={y} r="10" fill={i === 2 ? "#fff" : P.teal} stroke={P.teal} strokeWidth="3" />
              {i < 2 ? <path d={`M107 ${y} l4 4 l7 -8`} stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" /> : null}
              <path d={`M132 ${y} h80`} stroke={i === 2 ? P.lavender : P.royal} strokeWidth="6" strokeLinecap="round" />
            </g>
          ))}
          <circle cx="252" cy="40" r="16" fill={P.gold} />
        </Frame>
      );
    case "day":
      return (
        <Frame bg="#FDF4E4" label={label}>
          <path d="M40 160 A 120 120 0 0 1 280 160" stroke={P.lavender} strokeWidth="6" fill="none" strokeDasharray="4 10" strokeLinecap="round" />
          <circle cx="160" cy="70" r="30" fill={P.gold} />
          {[0, 45, 90, 135, 180].map((deg) => {
            const r = (deg * Math.PI) / 180;
            return <path key={deg} d={`M${160 - Math.cos(r) * 42} ${70 - Math.sin(r) * 42} L${160 - Math.cos(r) * 54} ${70 - Math.sin(r) * 54}`} stroke={P.gold} strokeWidth="6" strokeLinecap="round" />;
          })}
          <path d="M0 160 H320 V200 H0 Z" fill={P.sage} />
          <circle cx="70" cy="146" r="8" fill={P.royal} />
          <circle cx="250" cy="146" r="8" fill={P.teal} />
        </Frame>
      );
    case "checkin":
      return (
        <Frame bg="#EEF5F3" label={label}>
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <rect key={i} x={50 + i * 32} y={150 - (20 + ((i * 37) % 70))} width="22" height={20 + ((i * 37) % 70)} rx="6" fill={i % 2 ? P.teal : P.royal} />
          ))}
          <path d="M40 152 h240" stroke={P.ink} strokeWidth="3" strokeLinecap="round" />
          <circle cx="262" cy="44" r="16" fill={P.gold} />
        </Frame>
      );
  }
}
