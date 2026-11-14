import { encode } from 'uqr';

/**
 * The QR drawn into the install area, as an SVG file made at build time.
 *
 * It is built here rather than in the browser because a QR encoder costs about 10KB of script, and
 * the whole page's script budget is 12KB. The cost of building it here is that the address inside
 * cannot carry where this visit came from: it says `utm_source=qr`, and which page the QR was on.
 * (Decided 2026-11-15 after measuring both ways.)
 */

/** Dark modules of a row as [start, length] runs: one path command a run instead of one a module. */
export function qrRuns(row: readonly boolean[]): [number, number][] {
  const runs: [number, number][] = [];
  for (let x = 0; x < row.length; ) {
    if (!row[x]) {
      x++;
      continue;
    }
    let run = 1;
    while (x + run < row.length && row[x + run]) run++;
    runs.push([x, run]);
    x += run;
  }
  return runs;
}

export function qrSvg(text: string): string {
  // 'L' is the lowest correction level: fewest modules, so the biggest squares at a given size.
  // A screen is a clean surface — the levels above it are for print that gets dirty or torn.
  // 4 modules of quiet zone: what the QR standard asks for, so a phone camera finds the code
  // against a page rather than hunting for its edge.
  const { data, size } = encode(text, { ecc: 'L', border: 4 });
  let d = '';
  for (let y = 0; y < size; y++) for (const [x, run] of qrRuns(data[y])) d += `M${x} ${y}h${run}v1h-${run}z`;
  // The white square is part of the picture: the code must stay dark on light in a dark page.
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges">` +
    `<rect width="${size}" height="${size}" fill="#fff"/><path d="${d}" fill="#000"/></svg>`
  );
}
