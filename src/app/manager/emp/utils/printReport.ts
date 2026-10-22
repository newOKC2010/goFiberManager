import { EmpUser } from '../service/serviceEmp';

const THAI_MONTHS_SHORT = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

function formatThaiDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  return `${d} ${THAI_MONTHS_SHORT[m - 1]} ${y + 543}`;
}

export function printEmpReport(data: EmpUser[], dateFrom?: string, dateTo?: string) {
  const fmtRange = (d?: string) => d ? formatThaiDate(d) : '-';
  const dateRange = `${fmtRange(dateFrom)} — ${fmtRange(dateTo)}`;

  // group by hr_emp_id
  const grouped = new Map<string, EmpUser[]>();
  for (const emp of data) {
    const key = emp.hr_emp_id;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(emp);
  }

  const sections = [...grouped.entries()].map(([, rows]) => {
    const first = rows[0];
    const tableRows = rows.map((r, i) => {
      const bg = i % 2 === 1 ? 'style="background:#f5f5f5"' : '';
      const date = r.work_date ? formatThaiDate(r.work_date) : '-';
      const scans = r.scan_times?.length > 0 ? r.scan_times.join(' , ') : '-';
      return `<tr ${bg}><td class="date-col">${date}</td><td class="scan-col">${scans}</td></tr>`;
    }).join('');

    return `
      <div class="section">
        <div class="emp-info">
          <span>รหัส HR : ${first.hr_emp_id}</span>
          <span>ชื่อ-นามสกุล : ${first.full_name}</span>
          <span>แผนก : ${first.dept_name ?? '-'}</span>
        </div>
        <table>
          <thead>
            <tr><th class="date-col">วันที่</th><th class="scan-col">เวลา Scan</th></tr>
          </thead>
          <tbody>${tableRows}</tbody>
        </table>
      </div>`;
  }).join('');

  const html = `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <title>รายงานการเข้างาน</title>
  <link href="https://fonts.googleapis.com/css2?family=Mitr:wght@700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Mitr', sans-serif; font-weight: 700; }
    body { padding: 20px; font-size: 11px; color: #111; }
    h1 { text-align: center; font-size: 14px; margin-bottom: 3px; }
    h2 { text-align: center; font-size: 12px; margin-bottom: 10px; }
    .date-range { font-size: 11px; text-align: center; margin-bottom: 14px; color: #333; }
    .section { margin-bottom: 20px; }
    .emp-info { display: flex; gap: 24px; margin-bottom: 6px; font-size: 11px; border-left: 3px solid #4f46e5; padding-left: 8px; }
    table { width: 100%; border-collapse: collapse; table-layout: fixed; }
    col.date-col { width: 18%; }
    col.scan-col { width: 82%; }
    th { background: #e8eaf6; padding: 5px 8px; border: 1px solid #c5cae9; text-align: center; font-size: 11px; }
    td { padding: 5px 8px; border: 1px solid #ddd; vertical-align: top; font-size: 11px; }
    td.date-col { text-align: center; white-space: nowrap; }
    td.scan-col { text-align: left; white-space: normal; word-break: break-word; }
    @media print {
      body { padding: 8px; }
      .section { page-break-inside: avoid; }
      @page { margin: 1cm; size: A4 portrait; }
    }
  </style>
</head>
<body>
  <h1>ระบบการจัดการทรัพยากรบุคคล</h1>
  <h2>รายงานการเข้างาน</h2>
  <div class="date-range">ช่วงวันที่ : ${dateRange}</div>
  ${sections}
</body>
</html>`;

  const win = window.open('', '_blank', 'width=900,height=700');
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => { win.print(); win.close(); }, 500);
}
