import React from 'react';
import logoImg from '../../assets/saras-kitchen-logo.png';

/**
 * SarasLogo — single source of truth for the Sara's Kitchen brand logo.
 *
 * Props:
 *   size      — height of the logo image in px (default 40)
 *   showText  — show "Sara's Kitchen" text beside the logo (default false,
 *               since the logo image already contains the brand name)
 *   textColor — CSS color for the text label when showText=true
 *   className — extra classes on the wrapper
 *   variant   — 'default' | 'light'
 *               'light' adds a white circular bg for use on dark backgrounds
 */
const SarasLogo = ({
  size = 40,
  showText = false,
  textColor = 'var(--ink)',
  className = '',
  variant = 'default',
}) => {
  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: Math.round(size * 0.25) + 'px',
        textDecoration: 'none',
        flexShrink: 0,
      }}
    >
      {/* ── Logo image ── */}
      <img
        src={logoImg}
        alt="Sara's Kitchen"
        style={{
          height: size + 'px',
          width: size + 'px',
          objectFit: 'cover',
          display: 'block',
          flexShrink: 0,
          borderRadius: '50%',
          backgroundColor: variant === 'light' ? '#ffffff' : '#1C1917',
          boxShadow: variant === 'light'
            ? `0 2px 8px rgba(0,0,0,0.15)`
            : `0 2px 10px rgba(232,65,42,0.25)`,
        }}
      />

      {/* ── Optional text label ── */}
      {showText && (
        <span
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: Math.round(size * 0.44) + 'px',
            fontWeight: 700,
            color: textColor,
            lineHeight: 1,
            letterSpacing: '-0.01em',
            whiteSpace: 'nowrap',
          }}
        >
          Sara's Kitchen
        </span>
      )}
    </span>
  );
};

export default SarasLogo;