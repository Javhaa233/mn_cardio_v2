/**
 * Inline SVG flags for the language toggle.
 *
 * WHY NOT EMOJI: Windows' Segoe UI Emoji contains no regional-indicator glyphs,
 * so the flag emoji render as boxed letter pairs ("M N", "G B") in Chrome, Edge
 * and Firefox alike. Every user of this app is on a Windows hospital desktop, so
 * emoji flags fail for 100% of them. A CDN was rejected (index.html already
 * pulls five, and hospital networks are often locked down); an npm flag package
 * was rejected as a runtime dependency for exactly two images; and
 * assets/img/flags/ was rejected because it has GB.png but no MN.png, nothing
 * imports it, and 20px PNGs are soft at the 125%/150% display scaling that is
 * standard on clinical workstations.
 *
 * COLOURS: the hex values below are national flag specifications, not UI
 * colours. CLAUDE.md's "one palette" rule does not apply to them and they must
 * not be replaced with theme tokens.
 *
 * SIZING: rendered 20x14 so the flag occupies the same 20px optical width as
 * every icon glyph in the bar. Both flags are officially 1:2; 20x14 is a small,
 * deliberate distortion, preferred over a 20x10 sliver that would break the
 * bar's vertical rhythm.
 */

const DEFAULT_WIDTH = 20;
const DEFAULT_HEIGHT = 14;

// Without a hairline the white in both flags dissolves into the white bar.
const frameSx = {
  display: "block",
  flex: "0 0 auto",
  borderRadius: "2px",
  boxShadow: "inset 0 0 0 1px rgba(0, 0, 0, 0.12)",
};

export function FlagMN({ width = DEFAULT_WIDTH, height = DEFAULT_HEIGHT }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 60 30"
      preserveAspectRatio="none"
      style={frameSx}
      role="presentation"
      aria-hidden="true"
      focusable="false"
    >
      <rect width="60" height="30" fill="#C4272F" />
      <rect x="20" width="20" height="30" fill="#015197" />
      {/* Soyombo, simplified for legibility at ~9px tall */}
      <g fill="#F9CF02">
        {/* flanking bars */}
        <rect x="5.1" y="4" width="1.2" height="22" />
        <rect x="13.7" y="4" width="1.2" height="22" />
        {/* fire: three flames */}
        <path d="M10 4.1 8.9 7.2h2.2z" />
        <path d="M8.1 5.2 7.2 7.4h1.7z" />
        <path d="M11.9 5.2 12.8 7.4h-1.7z" />
        {/* sun */}
        <circle cx="10" cy="8.9" r="1.05" />
        {/* moon */}
        <path d="M8.3 11.4a1.9 1.9 0 0 0 3.4 0 2.4 2.4 0 0 1-3.4 0z" />
        {/* downward triangle */}
        <path d="M7.3 12.6h5.4L10 15.2z" />
        {/* upper bar */}
        <rect x="7.1" y="15.7" width="5.8" height="0.9" />
        {/* taiji */}
        <circle cx="10" cy="19" r="1.9" />
        {/* lower bar */}
        <rect x="7.1" y="21.4" width="5.8" height="0.9" />
        {/* upward triangle */}
        <path d="M7.3 25.4h5.4L10 22.8z" />
      </g>
    </svg>
  );
}

export function FlagGB({ width = DEFAULT_WIDTH, height = DEFAULT_HEIGHT }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 60 30"
      preserveAspectRatio="none"
      style={frameSx}
      role="presentation"
      aria-hidden="true"
      focusable="false"
    >
      <clipPath id="mnc-gb-saltire">
        <path d="M30 15h30v15zv15H30zH0V15zV0h30z" />
      </clipPath>
      <rect width="60" height="30" fill="#012169" />
      <path d="M0 0 60 30M60 0 0 30" stroke="#FFFFFF" strokeWidth="6" />
      <path
        d="M0 0 60 30M60 0 0 30"
        clipPath="url(#mnc-gb-saltire)"
        stroke="#C8102B"
        strokeWidth="4"
      />
      <path d="M30 0v30M0 15h60" stroke="#FFFFFF" strokeWidth="10" />
      <path d="M30 0v30M0 15h60" stroke="#C8102B" strokeWidth="6" />
    </svg>
  );
}

export default { FlagMN, FlagGB };
