import sharp from 'sharp';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');

// Read the favicon SVG and extract just the bolt path
const faviconSvg = readFileSync(resolve(projectRoot, 'public/favicon.svg'), 'utf-8');

const width = 1200;
const height = 630;

// Brand colors from design tokens
const bg = '#0B1326';
const primary = '#2563EB';
const primaryLight = '#B4C5FF';
const textPrimary = '#DAE2FD';
const textSecondary = '#C3C6D7';
const surfaceContainer = '#171F33';
const outline = '#434655';

const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${primary}" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="${primary}" stop-opacity="0"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="${width}" height="${height}" fill="${bg}"/>

  <!-- Subtle accent glow top-right -->
  <ellipse cx="950" cy="80" rx="400" ry="300" fill="${primary}" opacity="0.06"/>

  <!-- Top border accent line -->
  <rect x="0" y="0" width="${width}" height="4" fill="${primary}"/>

  <!-- Lightning bolt icon (scaled from favicon) -->
  <g transform="translate(80, 180) scale(4.5)">
    <path fill="${primary}" d="M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z"/>
  </g>

  <!-- App name -->
  <text x="340" y="290" font-family="Inter, system-ui, sans-serif" font-size="72" font-weight="700" fill="${textPrimary}" letter-spacing="-1.5">ScoutCopilot</text>

  <!-- Tagline -->
  <text x="340" y="350" font-family="Inter, system-ui, sans-serif" font-size="28" font-weight="400" fill="${textSecondary}">AI-Powered Football Scouting Assistant</text>

  <!-- Feature pills row -->
  <g transform="translate(340, 390)">
    <!-- Pill 1 -->
    <rect x="0" y="0" width="180" height="40" rx="6" fill="${surfaceContainer}" stroke="${outline}" stroke-width="1"/>
    <text x="90" y="26" font-family="Inter, system-ui, sans-serif" font-size="14" font-weight="500" fill="${primaryLight}" text-anchor="middle">Player Search</text>

    <!-- Pill 2 -->
    <rect x="196" y="0" width="200" height="40" rx="6" fill="${surfaceContainer}" stroke="${outline}" stroke-width="1"/>
    <text x="296" y="26" font-family="Inter, system-ui, sans-serif" font-size="14" font-weight="500" fill="${primaryLight}" text-anchor="middle">Scouting Reports</text>

    <!-- Pill 3 -->
    <rect x="412" y="0" width="200" height="40" rx="6" fill="${surfaceContainer}" stroke="${outline}" stroke-width="1"/>
    <text x="512" y="26" font-family="Inter, system-ui, sans-serif" font-size="14" font-weight="500" fill="${primaryLight}" text-anchor="middle">Head-to-Head</text>
  </g>

  <!-- Bottom bar with URL -->
  <rect x="0" y="570" width="${width}" height="60" fill="${surfaceContainer}"/>
  <line x1="0" y1="570" x2="${width}" y2="570" stroke="${outline}" stroke-width="1"/>
  <text x="80" y="607" font-family="Inter, system-ui, sans-serif" font-size="18" font-weight="500" fill="${textSecondary}">scoutcopilot.com</text>

  <!-- Bottom-right: Predivo badge -->
  <text x="1120" y="607" font-family="Inter, system-ui, sans-serif" font-size="14" font-weight="400" fill="${outline}" text-anchor="end">by Predivo GmbH</text>
</svg>`;

await sharp(Buffer.from(svg))
  .png()
  .toFile(resolve(projectRoot, 'public/og-image.png'));

console.log('✓ Generated public/og-image.png (1200x630)');
