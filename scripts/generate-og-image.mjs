import sharp from 'sharp';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');

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

// Logo paths (from logo-original.svg, scaled to fit ~180px tall at position)
const logoPaths = `
<g transform="translate(60, 140) scale(0.2)">
  <path d="M 585.585 1450.31 C 592.772 1449.32 614.364 1449.78 622.716 1449.78 L 693.466 1449.82 L 939.802 1449.8 L 1297.5 1449.75 L 1406.24 1449.82 C 1438.04 1449.78 1472.26 1444.88 1500.05 1462.49 C 1519.32 1474.78 1532.88 1494.27 1537.71 1516.61 C 1542.65 1538.62 1538.4 1561.68 1525.94 1580.48 C 1512.65 1600.82 1492.62 1614.03 1468.91 1618.87 C 1468.12 1619.03 1467.32 1619.18 1466.51 1619.3 C 1456.09 1620.91 1436.13 1620.38 1425.09 1620.32 L 1362.54 1620.18 L 1133.83 1620.08 L 762.524 1620.05 L 647.606 1620.24 C 611.822 1620.35 577.619 1626.32 547.431 1603.9 C 485.35 1557.79 507.141 1462.07 585.585 1450.31 z" fill="${primaryLight}"/>
  <path d="M 1026.92 1193.51 C 1128.82 1193.04 1230.72 1193.08 1332.63 1193.64 L 1418.13 1193.67 C 1434.03 1193.68 1454.53 1192.62 1469.78 1195.3 C 1517.27 1203.65 1548.05 1253.19 1536.12 1299.68 C 1527.96 1331.48 1501.62 1356.34 1469.85 1364.04 C 1456.1 1367.13 1436.5 1366.28 1422.09 1366.27 L 1361.43 1366.18 L 1131.5 1366.04 L 824.884 1366.03 L 741.372 1366.14 C 703.915 1366.19 675.613 1370.7 646.839 1342.72 C 615.918 1312.72 610.91 1267.2 635.433 1231.54 C 662.726 1191.86 693.058 1193.85 736.004 1193.82 L 797.495 1193.78 L 1026.92 1193.51 z" fill="${primaryLight}"/>
  <path d="M 822.928 938.457 C 854.342 937.264 892.331 938.155 924.058 938.128 L 1116.64 938.017 L 1224.45 938.111 C 1244.56 938.156 1271.73 936.667 1290.94 940.326 C 1328.44 947.469 1355.76 982.854 1357.63 1019.58 C 1358.74 1042.93 1350.4 1065.74 1334.49 1082.86 C 1316.5 1102.26 1297.41 1108.64 1271.77 1109.44 L 953.494 1109.81 L 865.213 1109.82 C 830.274 1109.85 792.194 1114.47 765.618 1088.62 C 707.157 1031.76 741.421 942.035 822.928 938.457 z" fill="${primaryLight}"/>
  <path d="M 912.9 684.352 C 927.949 682.909 959.793 683.889 976.23 683.881 L 1103.82 683.849 L 1220.33 683.844 C 1255 683.857 1297.16 678.32 1325.18 701.696 C 1384.83 751.444 1357.4 843.806 1279.26 853.58 C 1266.71 854.926 1231.63 854.053 1217.76 854.055 L 1094.62 854.052 L 975.533 854.041 C 941.302 854.035 897.57 859.319 869.52 837.266 C 808.607 789.376 834.794 694.072 912.9 684.352 z" fill="${primaryLight}"/>
  <path d="M 1026.35 428.467 C 1076.47 426.638 1135.02 428.008 1185.63 428.033 L 1239.84 428.075 C 1274.36 428.115 1300.01 426.196 1327.94 450.461 C 1344.7 464.945 1354.97 485.531 1356.47 507.633 C 1357.91 531.019 1349.83 553.995 1334.06 571.326 C 1316.77 590.482 1297.75 596.622 1272.92 597.966 L 1088.36 598.248 C 1062.55 598.239 1033.76 599.083 1007.99 597.108 C 995.656 596.163 977.549 586.407 968.19 578.148 C 951.44 563.234 941.236 542.325 939.785 519.945 C 938.432 497.539 945.964 475.502 960.749 458.612 C 978.063 439.055 1000.71 430 1026.35 428.467 z" fill="${primaryLight}"/>
</g>`;

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

  <!-- Logo icon -->
  ${logoPaths}

  <!-- App name -->
  <text x="520" y="290" font-family="Inter, system-ui, sans-serif" font-size="72" font-weight="700" fill="${textPrimary}" letter-spacing="-1.5">ScoutCopilot</text>

  <!-- Tagline -->
  <text x="520" y="350" font-family="Inter, system-ui, sans-serif" font-size="28" font-weight="400" fill="${textSecondary}">AI-Powered Football Scouting Assistant</text>

  <!-- Feature pills row -->
  <g transform="translate(520, 390)">
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

console.log('Generated public/og-image.png (1200x630)');
