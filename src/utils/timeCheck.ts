const LATE_TIME = process.env.NEXT_PUBLIC_IN_LATE ?? '08:45';
const EARLY_TIME = process.env.NEXT_PUBLIC_EARLY ?? '16:30';

export interface ScanFlag {
  time: string;
  late: boolean;        // underline 1 ขีด
  earlyLeave: boolean;  // underline 2 ขีด
  noExit: boolean;      // scan เดียว → ?
}

// แปลง HH:MM string เป็น minute
function toMin(t: string) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

export function buildScanFlags(scanTimes: string[], checkTime: boolean): ScanFlag[] {
  if (!checkTime || scanTimes.length === 0) {
    return scanTimes.map(t => ({ time: t, late: false, earlyLeave: false, noExit: false }));
  }

  const noExit = scanTimes.length === 1;
  return scanTimes.map((t, i) => {
    const isFirst = i === 0;
    const isLast = i === scanTimes.length - 1;
    return {
      time: t,
      late: isFirst && toMin(t) >= toMin(LATE_TIME),
      earlyLeave: !noExit && isLast && toMin(t) < toMin(EARLY_TIME),
      noExit: noExit && isFirst,
    };
  });
}

// render เป็น string สำหรับ print HTML
export function renderScanFlagsHtml(flags: ScanFlag[]): string {
  return flags.map(f => {
    let style = '';
    if (f.late) style = 'text-decoration:underline;';
    if (f.earlyLeave) style = 'text-decoration:underline double;';
    const label = f.noExit ? `${f.time} ?` : f.time;
    return style ? `<span style="${style}">${label}</span>` : label;
  }).join(' , ');
}
