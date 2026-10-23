import { ReportRow } from '../service/serviceReport';

const THAI_MONTHS_SHORT = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];

function formatThaiDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${THAI_MONTHS_SHORT[m - 1]} ${y + 543}`;
}

export function printAttendanceReport(data: ReportRow[], dateFrom: string, dateTo: string) {
  const fromLabel = formatThaiDate(dateFrom);
  const toLabel = formatThaiDate(dateTo);

  const titleBlock = `
    <div style="text-align:center;margin-bottom:10px;">
      <div style="font-size:15px;">ระบบการจัดการทรัพยากรบุคคล</div>
      <div style="font-size:12px;">รายงานการเข้างาน</div>
      <div style="font-size:11px;">ช่วงวันที่ : ${fromLabel} — ${toLabel}</div>
    </div>`;

  const sections = data.map((emp, idx) => {
    const dateRows = emp.dates.map(dr => {
      const scans = dr.scan_times.length > 0 ? dr.scan_times.join(' , ') : '-';
      return `<tr>
        <td style="padding:6px 10px;border:1px solid #ddd;">${formatThaiDate(dr.date)}</td>
        <td style="padding:6px 10px;border:1px solid #ddd;word-break:break-word;">${scans}</td>
      </tr>`;
    }).join('');

    const pageBreak = idx > 0 ? `style="page-break-before:always;"` : '';

    return `
      <div ${pageBreak}>
        ${titleBlock}
        <div style="margin-bottom:6px;">
          <span style="margin-right:16px;"><b>รหัส HR :</b> ${emp.hr_emp_id}</span>
          <span style="margin-right:16px;"><b>ชื่อ-นามสกุล :</b> ${emp.full_name}</span>
          <span><b>แผนก :</b> ${emp.dept_name}</span>
        </div>
        <table style="width:100%;border-collapse:collapse;table-layout:fixed;">
          <colgroup><col style="width:30%"/><col style="width:70%"/></colgroup>
          <thead>
            <tr style="background:#f3f4f6;">
              <th style="padding:6px 10px;border:1px solid #ddd;text-align:left;">วันที่</th>
              <th style="padding:6px 10px;border:1px solid #ddd;text-align:left;">เวลา Scan</th>
            </tr>
          </thead>
          <tbody>${dateRows}</tbody>
        </table>
      </div>`;
  }).join('');

  const html = `<!DOCTYPE html><html><head>
    <meta charset="utf-8"/>
    <link href="https://fonts.googleapis.com/css2?family=Mitr:wght@700&display=swap" rel="stylesheet"/>
    <style>
      * { font-family:'Mitr',sans-serif; font-weight:700; font-size:11px; }
      @page { size:A4 portrait; margin:16mm; }
      @media print { body { margin:0; } }
    </style>
  </head><body>
    ${sections}
    <script>window.onload=()=>{window.print();window.onafterprint=()=>window.close();}</script>
  </body></html>`;

  const w = window.open('', '_blank');
  if (w) { w.document.write(html); w.document.close(); }
}
