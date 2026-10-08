'use strict';

// KI-Logos: generierte Vektor-Marken im Stil echter KI-Firmen (200×200 um den Mittelpunkt).
// Jede Bauart ist eine typische Logo-Form (Funkeln, Knoten, Orb, Blende …);
// der Seed variiert Proportionen, Anzahl, Ausrichtung und Farbverlauf.

const LOGO_REDUCED_MOTION = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const r1 = n => Math.round(n * 10) / 10;

// Winkel in Grad, 0° zeigt nach oben, im Uhrzeigersinn.
function polar(radius, deg) {
  const a = (deg - 90) * Math.PI / 180;
  return [radius * Math.cos(a), radius * Math.sin(a)];
}

const P = (radius, deg) => polar(radius, deg).map(r1).join(' ');
const pts = list => list.map(([x, y]) => `${r1(x)},${r1(y)}`).join(' ');

function arcPath(radius, a0, a1) {
  return `M${P(radius, a0)}A${radius} ${radius} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${P(radius, a1)}`;
}

// Vierzackiges Funkeln mit nach innen gewölbten Kanten
function sparklePath(R, k = 0.14) {
  const q = r1(R * k);
  return `M0 ${-R}Q${q} ${-q} ${R} 0Q${q} ${q} 0 ${R}Q${-q} ${q} ${-R} 0Q${-q} ${-q} 0 ${-R}Z`;
}

// Spitz zulaufender Strahl, Basis im Ursprung, zeigt nach oben
function rayPath(L, w) {
  return `M${r1(-w)} 0C${r1(-w)} ${r1(-L * 0.45)} ${r1(-w * 0.35)} ${r1(-L * 0.92)} 0 ${r1(-L)}C${r1(w * 0.35)} ${r1(-L * 0.92)} ${r1(w)} ${r1(-L * 0.45)} ${r1(w)} 0Z`;
}

// Geschlossene, weiche Kurve durch alle Punkte (Catmull-Rom)
function smoothClosed(points) {
  const n = points.length;
  let d = `M${r1(points[0][0])} ${r1(points[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = points[(i - 1 + n) % n];
    const p1 = points[i];
    const p2 = points[(i + 1) % n];
    const p3 = points[(i + 2) % n];
    d += `C${r1(p1[0] + (p2[0] - p0[0]) / 6)} ${r1(p1[1] + (p2[1] - p0[1]) / 6)} ${r1(p2[0] - (p3[0] - p1[0]) / 6)} ${r1(p2[1] - (p3[1] - p1[1]) / 6)} ${r1(p2[0])} ${r1(p2[1])}`;
  }
  return `${d}Z`;
}

function shrink(points, k) {
  const cx = points.reduce((s, p) => s + p[0], 0) / points.length;
  const cy = points.reduce((s, p) => s + p[1], 0) / points.length;
  return points.map(([x, y]) => [cx + (x - cx) * k, cy + (y - cy) * k]);
}

const anim = (c, markup) => (c.still ? '' : markup);
const spin = (c, seconds, reverse = false) => anim(c,
  `<animateTransform attributeName="transform" type="rotate" from="0" to="${reverse ? -360 : 360}" dur="${seconds}s" repeatCount="indefinite" additive="sum"/>`);

// Maske für Aussparungen: weiß bleibt sichtbar, schwarz wird ausgeschnitten.
function cutout(c, name, holes) {
  return `<mask id="${c.id(name)}" maskUnits="userSpaceOnUse" x="-100" y="-100" width="200" height="200"><rect x="-100" y="-100" width="200" height="200" fill="#fff"/>${holes}</mask>`;
}
const masked = (c, name) => `mask="url(#${c.id(name)})"`;

const BUBBLE = 'M-50 -66H50A36 36 0 0 1 86 -30V10A36 36 0 0 1 50 46H-6L-48 80L-40 46H-50A36 36 0 0 1 -86 10V-30A36 36 0 0 1 -50 -66Z';
const DROP = 'M0 -88C34 -50 66 -14 66 22A66 66 0 0 1 -66 22C-66 -14 -34 -50 0 -88Z';
const SHIELD = 'M0 -88C24 -72 50 -66 78 -66C78 8 50 56 0 88C-50 56 -78 8 -78 -66C-50 -66 -24 -72 0 -88Z';
const BOLT = 'M14 -70L-38 8H-4L-16 70L38 -10H4Z';
const LEAF = 'M0 70Q42 0 0 -70Q-42 0 0 70Z';
const LOGO_FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', system-ui, sans-serif";

const LOGOS = {
  // Funkeln: ein großer Stern, mit Begleitern oder doppelt gelegt
  sparkle(c) {
    const { rand } = c;
    const k = 0.1 + rand() * 0.08;
    const star = (x, y, R, rot = 0) => `<path transform="translate(${x} ${y}) rotate(${rot})" d="${sparklePath(R, k)}"/>`;
    const v = Math.floor(rand() * 4);
    let out;
    if (v === 0) out = star(0, 0, 90);
    else if (v === 1) out = star(-10, 10, 76) + star(58, -58, 26);
    else if (v === 2) out = star(-14, 14, 66) + star(50, -40, 30) + star(34, 62, 16);
    else out = `<g opacity="0.5">${star(0, 0, 60, 45)}</g>${star(0, 0, 90)}`;
    return `<g fill="${c.a}">${out}${anim(c, '<animateTransform attributeName="transform" type="scale" values="1;1.04;1" dur="3.2s" repeatCount="indefinite"/>')}</g>`;
  },

  // Organischer Strahlenkranz mit unregelmäßigen, spitz zulaufenden Strahlen
  starburst(c) {
    const { rand } = c;
    const n = 9 + Math.floor(rand() * 7);
    const w = 7 + rand() * 3;
    let rays = '';
    for (let i = 0; i < n; i++) {
      const L = 64 + rand() * 26;
      const a = i * 360 / n + (rand() - 0.5) * 8;
      rays += `<path transform="rotate(${r1(a)})" d="${rayPath(L, w * (0.8 + rand() * 0.4))}"/>`;
    }
    return `<g fill="${c.a}">${rays}<circle r="${r1(w * 1.9)}"/>${spin(c, 60)}</g>`;
  },

  // Verflochtener Knoten aus abgerundeten Gliedern
  knot(c) {
    const { rand } = c;
    const k = rand() > 0.35 ? 6 : 5;
    const W = 38 + rand() * 8;
    const H = 70 + rand() * 10;
    const off = 14 + rand() * 8;
    const sw = 10 + rand() * 3;
    let links = '';
    for (let i = 0; i < k; i++) {
      links += `<rect transform="rotate(${r1(i * 360 / k)})" x="${r1(off - W / 2)}" y="${r1(10 - H)}" width="${r1(W)}" height="${r1(H)}" rx="${r1(W / 2)}"/>`;
    }
    return `<g fill="none" stroke="${c.a}" stroke-width="${r1(sw)}">${links}${spin(c, 80)}</g>`;
  },

  // Unendlichkeitsband in zwei Verläufen
  loop(c) {
    const { rand } = c;
    const yk = 1.3 + rand() * 0.5;
    const sw = 18 + rand() * 6;
    const seg = (t0, t1) => {
      let d = '';
      for (let i = 0; i <= 40; i++) {
        const t = t0 + (t1 - t0) * i / 40;
        const s = Math.sin(t);
        const co = Math.cos(t);
        const den = 1 + s * s;
        d += `${i ? 'L' : 'M'}${r1(80 * co / den)} ${r1(80 * s * co / den * yk)}`;
      }
      return d;
    };
    return `<g fill="none" stroke-width="${r1(sw)}" stroke-linecap="round"><path d="${seg(Math.PI / 2, Math.PI * 1.5)}" stroke="${c.b}"/><path d="${seg(-Math.PI / 2, Math.PI / 2)}" stroke="${c.a}"/></g>`;
  },

  // Leuchtender Orb mit weichen, kreisenden Farbwolken
  orb(c) {
    const { rand } = c;
    const blobs = [c.a, c.b, '#fff'].map((fill, i) => {
      const [x, y] = polar(24 + rand() * 18, i * 120 + rand() * 40);
      return `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(32 + rand() * 14)}" fill="${fill}" opacity="${i === 2 ? 0.5 : 0.9}"/>`;
    }).join('');
    return `<clipPath id="${c.id('clip')}"><circle r="78"/></clipPath>
      <filter id="${c.id('blur')}" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="12"/></filter>
      <circle r="78" fill="${c.c}"/>
      <g clip-path="url(#${c.id('clip')})"><g filter="url(#${c.id('blur')})">${blobs}${spin(c, 14)}</g></g>
      <circle r="88" fill="none" stroke="${c.b}" stroke-width="5" opacity="0.8"/>`;
  },

  // Rosette aus spitzen Blütenblättern
  petals(c) {
    const { rand } = c;
    const n = 5 + Math.floor(rand() * 4);
    const L = 84 + rand() * 4;
    const W = 30 + rand() * 12;
    let out = '';
    for (let i = 0; i < n; i++) {
      out += `<path transform="rotate(${r1(i * 360 / n)})" d="M0 0Q${r1(W)} ${r1(-L / 2)} 0 ${r1(-L)}Q${r1(-W)} ${r1(-L / 2)} 0 0Z" fill="${i % 2 ? c.b : c.a}"/>`;
    }
    return `<g fill-opacity="0.75">${out}${spin(c, 70, true)}</g>`;
  },

  // Kleeblatt-Knoten als durchgehendes Band
  trefoil(c) {
    const { rand } = c;
    const sw = 13 + rand() * 5;
    let d = '';
    for (let i = 0; i <= 120; i++) {
      const t = i / 120 * Math.PI * 2;
      d += `${i ? 'L' : 'M'}${r1(26 * (Math.sin(t) + 2 * Math.sin(2 * t)))} ${r1(26 * (Math.cos(t) - 2 * Math.cos(2 * t)))}`;
    }
    d += 'Z';
    // Die Kurve liegt nicht mittig um den Ursprung, daher erst zentrieren.
    return `<g transform="rotate(${r1(rand() * 120)})"><g transform="translate(0 10)" fill="none" stroke-linejoin="round"><path d="${d}" stroke="${c.a}" stroke-width="${r1(sw)}"/><path d="${d}" stroke="#fff" stroke-opacity="0.22" stroke-width="${r1(sw * 0.3)}"/></g>${spin(c, 90)}</g>`;
  },

  // Monogramm: Anfangsbuchstabe als Aussparung oder im Ring
  monogram(c) {
    const { rand } = c;
    const text = (fill, size) => `<text x="0" y="0" dy="0.35em" text-anchor="middle" font-family="${LOGO_FONT}" font-weight="800" font-size="${size}" fill="${fill}">${c.letter}</text>`;
    const v = Math.floor(rand() * 3);
    if (v === 2) {
      return `<circle r="84" fill="none" stroke="${c.b}" stroke-width="7"/>${text(c.a, 100)}<path transform="translate(58 -58)" d="${sparklePath(20)}" fill="${c.b}"/>`;
    }
    const shape = v === 0
      ? '<circle r="86"/>'
      : `<polygon points="${pts([0, 1, 2, 3, 4, 5].map(i => polar(76, i * 60 + 30)))}" stroke="${c.a}" stroke-width="18" stroke-linejoin="round"/>`;
    return `${cutout(c, 'm', text('#000', 108))}<g fill="${c.a}" ${masked(c, 'm')}>${shape}</g>`;
  },

  // Wirbel aus geschwungenen Klingen
  swirl(c) {
    const { rand } = c;
    const n = 3 + Math.floor(rand() * 4);
    const curl = 40 + rand() * 30;
    let out = '';
    for (let i = 0; i < n; i++) {
      const a = i * 360 / n;
      out += `<path d="M0 0C${P(36, a - curl)} ${P(78, a - curl * 0.6)} ${P(86, a)}C${P(64, a + 14)} ${P(30, a + 26)} 0 0Z" fill="${i % 2 ? c.b : c.a}"/>`;
    }
    return `<g fill-opacity="0.88">${out}${spin(c, 24)}</g><circle r="10" fill="${c.a}"/>`;
  },

  // Kamerablende
  aperture(c) {
    const { rand } = c;
    const n = rand() > 0.5 ? 6 : 8;
    const hole = 22 + rand() * 10;
    const twist = 26 + rand() * 22;
    let out = '';
    for (let i = 0; i < n; i++) {
      const a0 = i * 360 / n;
      const a1 = (i + 1) * 360 / n;
      out += `<path d="M${P(hole, a0)}L${P(hole, a1)}L${P(86, a1 + twist)}A86 86 0 0 0 ${P(86, a0 + twist)}Z" fill="${i % 2 ? c.b : c.a}"/>`;
    }
    return `<g>${out}${spin(c, 40)}</g>`;
  },

  // Drei verschlungene Ringe
  borromean(c) {
    const { rand } = c;
    const R = 40 + rand() * 6;
    const d = 28 + rand() * 4;
    const rot = rand() * 120;
    const rings = [c.a, c.b, c.a].map((stroke, i) => {
      const [x, y] = polar(d, rot + i * 120);
      return `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(R)}" stroke="${stroke}"/>`;
    }).join('');
    return `<g fill="none" stroke-width="${r1(11 + rand() * 3)}" opacity="0.92">${rings}${spin(c, 50)}</g>`;
  },

  // Windrad aus mehrfarbigen Halbkreisen
  pinwheel(c) {
    const { rand } = c;
    const n = [4, 4, 5, 6][Math.floor(rand() * 4)];
    const spread = 0.4 + rand() * 0.4;
    let out = '';
    for (let i = 0; i < n; i++) {
      const hue = (c.hue + i * (360 / n) * spread) % 360;
      out += `<path transform="rotate(${r1(i * 360 / n)})" d="M0 0L0 -86A43 43 0 0 1 0 0Z" fill="hsl(${r1(hue)}, ${c.vortex ? '60%, 22%' : '82%, 58%'})" fill-opacity="0.92"/>`;
    }
    return `<g>${out}${spin(c, 30)}</g>`;
  },

  // Sprach-Wellenform aus abgerundeten Balken
  voice(c) {
    const { rand } = c;
    const n = [5, 7, 9][Math.floor(rand() * 3)];
    const half = (n - 1) / 2;
    const slot = 168 / n;
    const w = slot * 0.64;
    const heights = Array.from({ length: half + 1 }, (_, j) => 40 + (1 - j / half) * 120 * (0.75 + rand() * 0.25));
    let bars = '';
    for (let i = 0; i < n; i++) {
      const h = heights[Math.abs(i - half)];
      const x = -84 + i * slot + (slot - w) / 2;
      const pulse = anim(c, `<animateTransform attributeName="transform" type="scale" values="1 1;1 ${r1(0.55 + rand() * 0.3)};1 1" dur="${r1(0.9 + rand() * 0.8)}s" repeatCount="indefinite"/>`);
      bars += `<g><rect x="${r1(x)}" y="${r1(-h / 2)}" width="${r1(w)}" height="${r1(h)}" rx="${r1(w / 2)}"/>${pulse}</g>`;
    }
    return `<g fill="${c.a}">${bars}</g>`;
  },

  // Auge mit ausgesparter Iris
  eye(c) {
    const { rand } = c;
    const h = 50 + rand() * 12;
    const ir = 30 + rand() * 6;
    const look = anim(c, '<animate attributeName="cx" values="0;12;0;-12;0" dur="7s" repeatCount="indefinite"/>');
    return `${cutout(c, 'm', `<circle r="${r1(ir)}" fill="#000">${look}</circle>`)}<path d="M-92 0Q0 ${r1(-h * 2)} 92 0Q0 ${r1(h * 2)} -92 0Z" fill="${c.a}" ${masked(c, 'm')}/><circle r="${r1(ir * 0.52)}" fill="${c.b}">${look}</circle>`;
  },

  // Sprechblase mit ausgespartem Funkeln oder Tipp-Punkten
  chatspark(c) {
    const { rand } = c;
    const flip = rand() > 0.5 ? -1 : 1;
    const holes = rand() > 0.5
      ? `<path transform="translate(0 -10)" d="${sparklePath(34)}" fill="#000"/>`
      : [-30, 0, 30].map((x, i) => `<circle cx="${x}" cy="-10" r="10" fill="#000">${anim(c, `<animate attributeName="cy" values="-10;-20;-10;-10" dur="1.2s" begin="${i * 0.18}s" repeatCount="indefinite"/>`)}</circle>`).join('');
    return `<g transform="scale(${flip} 1)">${cutout(c, 'm', holes)}<path d="${BUBBLE}" fill="${c.a}" ${masked(c, 'm')}/></g>`;
  },

  // Flamme bzw. Tropfen
  flame(c) {
    const { rand } = c;
    const solid = rand() > 0.5;
    const inner = `<path transform="translate(0 ${r1(22 + rand() * 10)}) scale(${r1(0.4 + rand() * 0.1)})" d="${DROP}"`;
    const flicker = anim(c, '<animateTransform attributeName="transform" type="scale" values="1 1;0.97 1.03;1 1" dur="1.8s" repeatCount="indefinite"/>');
    if (solid) return `<g><path d="${DROP}" fill="${c.a}"/>${inner} fill="${c.b}"/>${flicker}</g>`;
    return `<g>${cutout(c, 'm', `${inner} fill="#000"/>`)}<path d="${DROP}" fill="${c.a}" ${masked(c, 'm')}/>${flicker}</g>`;
  },

  // Atom mit drei Bahnen
  atom(c) {
    const { rand } = c;
    const ry = 26 + rand() * 8;
    const tilt = rand() * 30;
    let orbits = '';
    for (let i = 0; i < 3; i++) orbits += `<ellipse rx="84" ry="${r1(ry)}" transform="rotate(${r1(tilt + i * 60)})"/>`;
    return `<g fill="none" stroke="${c.a}" stroke-width="${r1(8 + rand() * 3)}">${orbits}${spin(c, 40)}</g><circle r="17" fill="${c.b}"/>`;
  },

  // Sichel mit Funkeln
  eclipse(c) {
    const { rand } = c;
    const [x, y] = polar(30 + rand() * 14, 30 + rand() * 40 + (rand() > 0.5 ? 180 : 0));
    return `${cutout(c, 'm', `<circle cx="${r1(x)}" cy="${r1(y)}" r="70" fill="#000"/>`)}<circle r="84" fill="${c.a}" ${masked(c, 'm')}/><path transform="translate(${r1(x)} ${r1(y)})" d="${sparklePath(22)}" fill="${c.b}"/>`;
  },

  // Prisma: abgerundeter Dreiecksrahmen mit innerem, gedrehtem Dreieck
  prism(c) {
    const { rand } = c;
    const tri = (R, rot) => pts([0, 120, 240].map(a => polar(R, a + rot)));
    const inner = rand() > 0.5;
    return `<g transform="translate(0 10)"><polygon points="${tri(70, 0)}" fill="none" stroke="${c.a}" stroke-width="18" stroke-linejoin="round"/><polygon points="${tri(inner ? 26 : 30, inner ? 180 : 0)}" fill="${c.b}" stroke="${c.b}" stroke-width="10" stroke-linejoin="round"/></g>`;
  },

  // Molekül: Knoten mit kräftigen Verbindungen
  molecule(c) {
    const { rand } = c;
    const k = 3 + Math.floor(rand() * 2);
    const rot = rand() * 360;
    const nodes = Array.from({ length: k }, (_, i) => polar(60, rot + i * 360 / k));
    const ring = rand() > 0.5;
    const line = ([x1, y1], [x2, y2]) => `<line x1="${r1(x1)}" y1="${r1(y1)}" x2="${r1(x2)}" y2="${r1(y2)}"/>`;
    const bonds = nodes.map(p => line([0, 0], p)).join('') + (ring ? nodes.map((p, i) => line(p, nodes[(i + 1) % k])).join('') : '');
    const dots = nodes.map(([x, y]) => `<circle cx="${r1(x)}" cy="${r1(y)}" r="18"/>`).join('');
    return `<g><g stroke="${c.b}" stroke-width="12" stroke-linecap="round" opacity="0.65">${bonds}</g><g fill="${c.a}"><circle r="24"/>${dots}</g>${spin(c, 50)}</g>`;
  },

  // Punktekreis mit wachsenden Punkten
  dotring(c) {
    const { rand } = c;
    const n = 10 + Math.floor(rand() * 5);
    let dots = '';
    for (let i = 0; i < n; i++) {
      const [x, y] = polar(68, i * 360 / n);
      dots += `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(4 + 11 * (i / (n - 1)))}" opacity="${r1(0.35 + 0.65 * (i / (n - 1)))}"/>`;
    }
    const core = rand() > 0.5 ? `<path d="${sparklePath(30)}" fill="${c.b}"/>` : `<circle r="20" fill="${c.b}"/>`;
    return `<g fill="${c.a}">${dots}${spin(c, 6)}</g>${core}`;
  },

  // Facettierter Edelstein
  gem(c) {
    const { rand } = c;
    const t = 34 + rand() * 10;
    const g = -18;
    const top = -56;
    const facets = [
      [[[-t, top], [t, top], [t * 0.55, g], [-t * 0.55, g]], c.a, 1],
      [[[-t, top], [-t * 0.55, g], [-84, g]], c.b, 0.85],
      [[[t, top], [84, g], [t * 0.55, g]], c.b, 0.7],
      [[[-84, g], [-t * 0.55, g], [0, 86]], c.a, 0.75],
      [[[-t * 0.55, g], [t * 0.55, g], [0, 86]], c.b, 0.95],
      [[[t * 0.55, g], [84, g], [0, 86]], c.a, 0.55],
    ];
    return `<g stroke-linejoin="round" stroke-width="3">${facets.map(([p, paint, o]) => `<polygon points="${pts(shrink(p, 0.94))}" fill="${paint}" stroke="${paint}" opacity="${o}"/>`).join('')}</g>`;
  },

  // Code-Zeichen: </>, >_ oder { }
  code(c) {
    const { rand } = c;
    const v = Math.floor(rand() * 3);
    const st = paint => `fill="none" stroke="${paint}" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"`;
    if (v === 0) return `<path d="M-38 -46L-82 0L-38 46M38 -46L82 0L38 46" ${st(c.a)}/><path d="M18 -62L-18 62" ${st(c.b)}/>`;
    if (v === 1) return `<path d="M-70 -44L-24 0L-70 44" ${st(c.a)}/><path d="M2 44H72" ${st(c.b)}>${anim(c, '<animate attributeName="opacity" values="1;1;0;0" dur="1.1s" repeatCount="indefinite"/>')}</path>`;
    return `<path d="M-30 -72Q-56 -72 -56 -46V-16Q-56 0 -76 0Q-56 0 -56 16V46Q-56 72 -30 72M30 -72Q56 -72 56 -46V-16Q56 0 76 0Q56 0 56 16V46Q56 72 30 72" ${st(c.a)}/><path d="${sparklePath(26)}" fill="${c.b}"/>`;
  },

  // Schild mit Funkeln oder Haken
  shield(c) {
    const { rand } = c;
    const hole = rand() > 0.5
      ? `<path transform="translate(0 -4)" d="${sparklePath(38, 0.15)}" fill="#000"/>`
      : '<path d="M-30 -4L-8 18L32 -26" fill="none" stroke="#000" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>';
    return `${cutout(c, 'm', hole)}<path d="${SHIELD}" fill="${c.a}" ${masked(c, 'm')}/>`;
  },

  // Planet mit Ring
  planet(c) {
    const { rand } = c;
    const tilt = -(14 + rand() * 18);
    const R = 48 + rand() * 6;
    const ry = r1(20 + rand() * 6);
    return `<g transform="rotate(${r1(tilt)})"><path d="M-82 0A82 ${ry} 0 0 1 82 0" fill="none" stroke="${c.b}" stroke-width="9" opacity="0.5"/><circle r="${r1(R)}" fill="${c.c}"/><path d="M82 0A82 ${ry} 0 0 1 -82 0" fill="none" stroke="${c.b}" stroke-width="9" stroke-linecap="round"/></g>`;
  },

  // Blitz, frei oder als Aussparung im Kreis
  bolt(c) {
    const { rand } = c;
    if (rand() > 0.5) {
      return `${cutout(c, 'm', `<path d="${BOLT}" fill="#000" stroke="#000" stroke-width="6" stroke-linejoin="round"/>`)}<circle r="86" fill="${c.a}" ${masked(c, 'm')}/>`;
    }
    return `<path d="${BOLT}" transform="scale(1.16)" fill="${c.a}" stroke="${c.a}" stroke-width="8" stroke-linejoin="round"/>`;
  },

  // Vierpass mit ausgespartem Funkeln oder in zwei Tönen
  clover(c) {
    const { rand } = c;
    const R = 38 + rand() * 6;
    const rot = rand() > 0.5 ? 45 : 0;
    const circle = (a, extra = '') => {
      const [x, y] = polar(84 - R, a + rot);
      return `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(R)}"${extra}/>`;
    };
    if (rand() > 0.5) {
      return `${cutout(c, 'm', `<path d="${sparklePath(26)}" fill="#000"/>`)}<g fill="${c.a}" ${masked(c, 'm')}>${[0, 90, 180, 270].map(a => circle(a)).join('')}</g>`;
    }
    return `<g fill-opacity="0.8">${[0, 90, 180, 270].map((a, i) => circle(a, ` fill="${i % 2 ? c.b : c.a}"`)).join('')}${spin(c, 60)}</g>`;
  },

  // Organischer Blob, der langsam seine Form ändert
  blob(c) {
    const { rand } = c;
    const make = (base, amp) => Array.from({ length: 7 }, (_, i) => polar(base + rand() * amp, i * 360 / 7 + (rand() - 0.5) * 16));
    const [a1, a2, b1, b2] = [make(60, 24), make(60, 24), make(30, 16), make(30, 16)];
    const morph = (p, q, dur) => anim(c, `<animate attributeName="d" values="${smoothClosed(p)};${smoothClosed(q)};${smoothClosed(p)}" dur="${dur}s" repeatCount="indefinite"/>`);
    return `<path d="${smoothClosed(a1)}" fill="${c.a}">${morph(a1, a2, 7)}</path><path transform="translate(-14 -12)" d="${smoothClosed(b1)}" fill="${c.b}" opacity="0.75">${morph(b1, b2, 5)}</path>`;
  },

  // Offener Ring mit Funkeln in der Lücke
  sparkring(c) {
    const { rand } = c;
    const at = rand() * 360;
    const gap = 64 + rand() * 20;
    const [sx, sy] = polar(62, at);
    return `<g><path d="${arcPath(62, at + gap / 2, at + 360 - gap / 2)}" fill="none" stroke="${c.a}" stroke-width="16" stroke-linecap="round"/><path transform="translate(${r1(sx)} ${r1(sy)})" d="${sparklePath(26)}" fill="${c.b}"/>${spin(c, 30)}</g>`;
  },

  // Blätter, die aus einem Punkt wachsen
  leaves(c) {
    const { rand } = c;
    const spread = 22 + rand() * 12;
    const center = rand() > 0.5 ? `<path d="${LEAF}" transform="translate(0 6) scale(0.82)" fill="${c.a}" opacity="0.95"/>` : '';
    return `<g transform="translate(0 -6)"><path d="${LEAF}" transform="rotate(${r1(-spread)} 0 70)" fill="${c.a}" opacity="0.85"/><path d="${LEAF}" transform="rotate(${r1(spread)} 0 70)" fill="${c.b}" opacity="0.85"/>${center}</g>`;
  },

  // Sanduhr, die sich ab und zu umdreht
  hourglass(c) {
    const { rand } = c;
    const w = r1(56 + rand() * 8);
    const flip = anim(c, '<animateTransform attributeName="transform" type="rotate" values="0;0;180;180;360" keyTimes="0;0.4;0.5;0.9;1" dur="8s" repeatCount="indefinite"/>');
    return `<g><g stroke-linejoin="round" stroke-width="10"><path d="M${-w} -66H${w}L6 -6H-6Z" fill="${c.a}" stroke="${c.a}"/><path d="M-6 6H6L${w} 66H${-w}Z" fill="${c.b}" stroke="${c.b}"/></g><rect x="${r1(-w - 12)}" y="-86" width="${r1(2 * w + 24)}" height="12" rx="6" fill="${c.a}"/><rect x="${r1(-w - 12)}" y="74" width="${r1(2 * w + 24)}" height="12" rx="6" fill="${c.b}"/>${flip}</g>`;
  },

  // Kompassrose mit zweifarbigen Spitzen
  compass(c) {
    const { rand } = c;
    const n = rand() > 0.5 ? 8 : 4;
    const inner = 18 + rand() * 6;
    const half = 360 / n / 2;
    const point = (a, R) => `<polygon points="${pts([[0, 0], polar(R, a), polar(inner, a - half)])}" fill="${c.a}"/><polygon points="${pts([[0, 0], polar(R, a), polar(inner, a + half)])}" fill="${c.b}"/>`;
    let out = '';
    if (n === 8) for (let i = 1; i < 8; i += 2) out += point(i * 45, 58);
    for (let i = 0; i < n; i += n === 8 ? 2 : 1) out += point(i * 360 / n, 88);
    return `<g>${out}${spin(c, 90)}</g>`;
  },

  // Sechseck-Netz: Knoten an den Ecken, Speichen zur Mitte – oder flach mit Funkeln
  hexnode(c) {
    const { rand } = c;
    const rot = rand() > 0.5 ? 0 : 30;
    const corners = [0, 1, 2, 3, 4, 5].map(i => polar(70, rot + i * 60));
    if (rand() > 0.55) {
      return `${cutout(c, 'm', `<path d="${sparklePath(34)}" fill="#000"/>`)}<polygon points="${pts(corners)}" fill="${c.a}" stroke="${c.a}" stroke-width="18" stroke-linejoin="round" ${masked(c, 'm')}/>`;
    }
    const spokes = corners.filter((_, i) => i % 2 === 0).map(([x, y]) => `<line x1="0" y1="0" x2="${r1(x)}" y2="${r1(y)}"/>`).join('');
    const dots = corners.map(([x, y], i) => `<circle cx="${r1(x)}" cy="${r1(y)}" r="${i % 2 ? 11 : 15}" fill="${i % 2 ? c.b : c.a}"/>`).join('');
    return `<g><polygon points="${pts(corners)}" fill="none" stroke="${c.b}" stroke-width="8" stroke-linejoin="round" opacity="0.7"/><g stroke="${c.a}" stroke-width="9" stroke-linecap="round">${spokes}</g>${dots}<circle r="21" fill="${c.a}"/>${spin(c, 60)}</g>`;
  },

  // Isometrischer Würfel aus drei Flächen, auf Wunsch mit Fugen
  cube(c) {
    const { rand } = c;
    const [top, rt, rb, bot, lb, lt] = [0, 60, 120, 180, 240, 300].map(a => polar(80, a));
    const gap = rand() > 0.4;
    const faces = [
      [[[0, 0], lt, top, rt], c.a],
      [[[0, 0], rt, rb, bot], c.b],
      [[[0, 0], bot, lb, lt], c.c],
    ];
    return `<g stroke-linejoin="round" stroke-width="6">${faces.map(([p, paint]) => `<polygon points="${pts(gap ? shrink(p, 0.86) : p)}" fill="${paint}" stroke="${paint}"/>`).join('')}</g>`;
  },

  // Spirale aus einem Strich mit Punkt am Ende
  spiral(c) {
    const { rand } = c;
    const turns = 2.1 + rand() * 0.7;
    const sw = 12 + rand() * 4;
    const rot = rand() * 360;
    let d = '';
    for (let i = 0; i <= 96; i++) {
      const t = i / 96;
      const [x, y] = polar(6 + t * 74, rot + t * turns * 360);
      d += `${i ? 'L' : 'M'}${r1(x)} ${r1(y)}`;
    }
    const [ex, ey] = polar(80, rot + turns * 360);
    return `<g><path d="${d}" fill="none" stroke="${c.a}" stroke-width="${r1(sw)}" stroke-linecap="round" stroke-linejoin="round"/><circle cx="${r1(ex)}" cy="${r1(ey)}" r="${r1(sw * 0.95)}" fill="${c.b}"/>${spin(c, 22)}</g>`;
  },

  // Pixel-Marke: 5×5 abgerundete Blöcke, Zeile für Zeile im Farbverlauf
  pixel(c) {
    const { rand } = c;
    const shapes = [
      ['x...x', 'xx.xx', 'x.x.x', 'x...x', 'x...x'],
      ['..x..', '.xxx.', 'xx.xx', '.xxx.', '..x..'],
      ['.xxx.', 'x...x', 'x.x.x', 'x...x', '.xxx.'],
      ['xx...', 'xxx..', '.xxx.', '..xxx', '...xx'],
      ['x.x.x', '.x.x.', 'x.x.x', '.x.x.', 'x.x.x'],
      ['xxxxx', 'x...x', 'x.x.x', 'x...x', 'xxxxx'],
    ];
    const rows = shapes[Math.floor(rand() * shapes.length)];
    const step = 36;
    const size = 30;
    let out = '';
    rows.forEach((row, y) => [...row].forEach((ch, x) => {
      if (ch !== 'x') return;
      const fill = `hsl(${r1((c.hue + y * 9) % 360)}, 88%, ${62 - y * 5}%)`;
      out += `<rect x="${(x - 2) * step - size / 2}" y="${(y - 2) * step - size / 2}" width="${size}" height="${size}" rx="7" fill="${c.vortex ? c.a : fill}"/>`;
    }));
    return `<g>${out}</g>`;
  },

  // Signal: drei gestapelte Wellenlinien
  signal(c) {
    const { rand } = c;
    const amp = 13 + rand() * 6;
    const phase = rand() * Math.PI;
    let out = '';
    for (let i = 0; i < 3; i++) {
      const y = (i - 1) * 44;
      const w = 80 - Math.abs(i - 1) * 18;
      let d = '';
      for (let k = 0; k <= 40; k++) {
        const t = k / 40;
        d += `${k ? 'L' : 'M'}${r1(-w + 2 * w * t)} ${r1(y + Math.sin(t * Math.PI * 2 + phase + i * 0.9) * amp)}`;
      }
      out += `<path d="${d}" stroke="${i === 1 ? c.a : c.b}"/>`;
    }
    return `<g fill="none" stroke-width="16" stroke-linecap="round" stroke-linejoin="round">${out}</g>`;
  },

  // Blüte aus überlappenden, durchscheinenden Kreisen
  bloom(c) {
    const { rand } = c;
    const n = rand() > 0.5 ? 6 : 5;
    const R = 38 + rand() * 6;
    let out = '';
    for (let i = 0; i < n; i++) {
      const [x, y] = polar(86 - R, i * 360 / n);
      out += `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(R)}" fill="${i % 2 ? c.b : c.a}" fill-opacity="0.55"/>`;
    }
    return `<g>${out}${spin(c, 50)}</g>`;
  },

  // Gestapelte Winkel, nach oben oder nach rechts
  chevron(c) {
    const { rand } = c;
    const n = rand() > 0.5 ? 3 : 2;
    const dir = rand() > 0.5 ? 0 : 90;
    let out = '';
    for (let i = 0; i < n; i++) {
      const y = (i - (n - 1) / 2) * 42;
      out += `<path d="M-62 ${r1(y + 30)}L0 ${r1(y - 30)}L62 ${r1(y + 30)}" stroke="${i === 0 ? c.a : c.b}" opacity="${r1(1 - i * 0.22)}"/>`;
    }
    return `<g transform="rotate(${dir})" fill="none" stroke-width="20" stroke-linecap="round" stroke-linejoin="round">${out}</g>`;
  },

  // Der Wochenboss: sieben Bögen für sieben Tage, innen ein siebenstrahliger Stern
  boss(c) {
    let arcs = '';
    for (let i = 0; i < 7; i++) arcs += arcPath(86, i * 360 / 7 + 7, (i + 1) * 360 / 7 - 7);
    let rays = '';
    for (let i = 0; i < 7; i++) rays += `<path transform="rotate(${r1(i * 360 / 7)})" d="${rayPath(64, 11)}"/>`;
    return `<g><path d="${arcs}" fill="none" stroke="${c.b}" stroke-width="12" stroke-linecap="round"/>${spin(c, 80)}</g><g fill="${c.a}">${rays}<circle r="20"/>${spin(c, 30, true)}</g>`;
  },
};

// Ring um Ultra-KIs
function haloRing(c) {
  let d = '';
  for (let i = 0; i < 3; i++) d += arcPath(94, i * 120 + 12, (i + 1) * 120 - 12);
  return `<g><path d="${d}" fill="none" stroke="${c.b}" stroke-width="5" stroke-linecap="round" opacity="0.85"/>${spin(c, 24, true)}</g>`;
}

let logoUid = 0;

// family: Bauart aus LOGOS · hue: Grundfarbton · seed: Variation
// opts.halo: Ring für Ultra-KIs · opts.still: ohne Animation · opts.letter: Buchstabe fürs Monogramm
// opts.vortex: seltene Dark-Vortex-Variante (dunkel, mit Neon-Kante und Wirbel)
function logoSvg(family, hue, seed, opts = {}) {
  const uid = ++logoUid;
  const id = name => `logo${uid}-${name}`;
  const rand = mulberry32(seed);
  const shift = (18 + rand() * 16) * (rand() > 0.5 ? 1 : -1);
  const h2 = (hue + shift + 360) % 360;
  const h3 = (hue + shift * 2 + 360) % 360;
  const c = {
    a: `url(#${id('a')})`,
    b: `url(#${id('b')})`,
    c: `url(#${id('c')})`,
    id,
    hue,
    rand,
    letter: opts.letter || 'K',
    still: Boolean(opts.still) || LOGO_REDUCED_MOTION,
    vortex: Boolean(opts.vortex),
  };
  if (c.vortex) return vortexSvg(family, c, seed);
  const defs = `<defs>
    <linearGradient id="${id('a')}" gradientUnits="userSpaceOnUse" x1="-80" y1="-90" x2="80" y2="90"><stop offset="0" stop-color="hsl(${r1(hue)}, 92%, 68%)"/><stop offset="0.55" stop-color="hsl(${r1(h2)}, 82%, 56%)"/><stop offset="1" stop-color="hsl(${r1(h3)}, 76%, 45%)"/></linearGradient>
    <linearGradient id="${id('b')}" gradientUnits="userSpaceOnUse" x1="80" y1="-90" x2="-80" y2="90"><stop offset="0" stop-color="hsl(${r1(h2)}, 90%, 70%)"/><stop offset="1" stop-color="hsl(${r1(h3)}, 80%, 48%)"/></linearGradient>
    <radialGradient id="${id('c')}" gradientUnits="userSpaceOnUse" cx="-26" cy="-30" r="120"><stop offset="0" stop-color="hsl(${r1(hue)}, 100%, 86%)"/><stop offset="0.45" stop-color="hsl(${r1(h2)}, 85%, 60%)"/><stop offset="1" stop-color="hsl(${r1(h3)}, 75%, 34%)"/></radialGradient>
  </defs>`;
  let body = (LOGOS[family] || LOGOS.sparkle)(c);
  if (opts.halo) body = `${haloRing(c)}<g transform="scale(0.8)">${body}</g>`;
  return `<svg viewBox="-100 -100 200 200" aria-hidden="true">${defs}${body}</svg>`;
}

// Dark Vortex: dieselbe Form wie die normale KI (gleicher Seed), aber dunkel wie Obsidian,
// mit Neon-Rand in der eigenen Farbe der KI, dunklem Schein und einem eigenen Ring aus Strichen.
function vortexSvg(family, c, seed) {
  const { id, hue } = c;
  const neon = `hsl(${r1(hue)}, 100%, 64%)`;
  const neon2 = `hsl(${r1((hue + 35) % 360)}, 100%, 72%)`;
  const extra = mulberry32(seed ^ 0x5bd1e995);
  const defs = `<defs>
    <linearGradient id="${id('a')}" gradientUnits="userSpaceOnUse" x1="-80" y1="-90" x2="80" y2="90"><stop offset="0" stop-color="hsl(${r1(hue)}, 72%, 36%)"/><stop offset="0.5" stop-color="hsl(${r1(hue)}, 55%, 13%)"/><stop offset="1" stop-color="#06020b"/></linearGradient>
    <linearGradient id="${id('b')}" gradientUnits="userSpaceOnUse" x1="80" y1="-90" x2="-80" y2="90"><stop offset="0" stop-color="hsl(${r1((hue + 30) % 360)}, 78%, 42%)"/><stop offset="1" stop-color="#0a0412"/></linearGradient>
    <radialGradient id="${id('c')}" gradientUnits="userSpaceOnUse" cx="-26" cy="-30" r="120"><stop offset="0" stop-color="hsl(${r1(hue)}, 85%, 54%)"/><stop offset="0.5" stop-color="hsl(${r1(hue)}, 50%, 15%)"/><stop offset="1" stop-color="#040108"/></radialGradient>
    <radialGradient id="${id('halo')}" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="100"><stop offset="0" stop-color="hsl(${r1(hue)}, 80%, 28%)" stop-opacity="0.75"/><stop offset="0.6" stop-color="hsl(${r1(hue)}, 70%, 14%)" stop-opacity="0.35"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
    <filter id="${id('rim')}" x="-30%" y="-30%" width="160%" height="160%">
      <feMorphology in="SourceAlpha" operator="dilate" radius="2.6" result="grown"/>
      <feFlood flood-color="${neon}"/>
      <feComposite in2="grown" operator="in" result="edge"/>
      <feGaussianBlur in="edge" stdDeviation="5" result="glow"/>
      <feMerge><feMergeNode in="glow"/><feMergeNode in="edge"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>`;
  const body = (LOGOS[family] || LOGOS.sparkle)(c);
  // Eigener Ring: Anzahl und Länge der Striche hängen am Seed
  const dashes = 5 + Math.floor(extra() * 6);
  const dash = r1((2 * Math.PI * 95) / dashes * (0.35 + extra() * 0.35));
  const gap = r1((2 * Math.PI * 95) / dashes - dash);
  const ring = `<g><circle r="95" fill="none" stroke="${neon}" stroke-width="1.8" stroke-linecap="round" stroke-dasharray="${dash} ${gap}" opacity="0.6"/>${spin(c, 14 + extra() * 10, extra() > 0.5)}</g>`;
  const sparks = Array.from({ length: 3 }, (_, i) => {
    const [x, y] = polar(70 + extra() * 22, extra() * 360);
    const twinkle = anim(c, `<animate attributeName="opacity" values="0.2;1;0.2" dur="${r1(1.6 + extra())}s" begin="${r1(i * 0.5)}s" repeatCount="indefinite"/>`);
    return `<path transform="translate(${r1(x)} ${r1(y)})" d="${sparklePath(7 + extra() * 4)}" fill="${neon2}">${twinkle}</path>`;
  }).join('');
  return `<svg viewBox="-100 -100 200 200" aria-hidden="true">${defs}<circle r="98" fill="url(#${id('halo')})"/>${ring}<g transform="scale(0.86)" filter="url(#${id('rim')})">${body}</g>${sparks}</svg>`;
}
