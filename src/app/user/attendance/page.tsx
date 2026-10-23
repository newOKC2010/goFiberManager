'use client';
import { useState } from 'react';
import Swal from 'sweetalert2';
import HeaderFiltersDateRange from '@/components/dataPicker/headerFiltersDateRange';
import { fetchMyAttendance, AttendanceRow } from './service/serviceUserAttendance';
import { buildScanFlags } from '@/utils/timeCheck';

const THAI_MONTHS = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];
const THAI_MONTHS_SHORT = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];

function formatThaiDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${THAI_MONTHS_SHORT[m - 1]} ${y + 543}`;
}

function monthKey(iso: string) {
  const [y, m] = iso.split('-').map(Number);
  return `${y}-${String(m).padStart(2, '0')}`;
}

function monthLabel(key: string) {
  const [y, m] = key.split('-').map(Number);
  return `${THAI_MONTHS[m - 1]} ${y + 543}`;
}

// group rows ตามเดือน
function groupByMonth(data: AttendanceRow[]) {
  const map = new Map<string, AttendanceRow[]>();
  data.forEach(r => {
    const k = monthKey(r.work_date);
    if (!map.has(k)) map.set(k, []);
    map.get(k)!.push(r);
  });
  return map;
}

export default function UserAttendancePage() {
  const [data, setData] = useState<AttendanceRow[]>([]);
  const [checkTime, setCheckTime] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const validateDates = (): boolean => {
    if (!dateFrom && !dateTo) {
      Swal.fire({ icon: 'warning', title: '<b>กรุณาเลือกช่วงวันที่</b>', html: '<b>ต้องระบุวันที่เริ่มต้นและวันที่สิ้นสุด</b>' });
      return false;
    }
    if (!dateFrom) {
      Swal.fire({ icon: 'warning', title: '<b>กรุณาเลือกวันที่เริ่มต้น</b>', html: '<b>กรุณาระบุวันที่เริ่มต้นด้วย</b>' });
      return false;
    }
    if (!dateTo) {
      Swal.fire({ icon: 'warning', title: '<b>กรุณาเลือกวันที่สิ้นสุด</b>', html: '<b>กรุณาระบุวันที่สิ้นสุดด้วย</b>' });
      return false;
    }
    if (dateTo < dateFrom) {
      Swal.fire({ icon: 'warning', title: '<b>วันที่ไม่ถูกต้อง</b>', html: '<b>วันที่สิ้นสุดต้องไม่น้อยกว่าวันที่เริ่มต้น</b>' });
      return false;
    }
    return true;
  };

  const handleSearch = async () => {
    if (!validateDates()) return;
    setLoading(true);
    setHasSearched(true);
    try {
      const res = await fetchMyAttendance({ date_from: dateFrom, date_to: dateTo });
      setData(res.data ?? []);
      setCheckTime(res.check_time ?? false);
    } catch { setData([]); }
    finally { setLoading(false); }
  };

  const handleReset = () => {
    setDateFrom(''); setDateTo('');
    setHasSearched(false); setData([]);
  };

  const grouped = groupByMonth(data);

  return (
    <div className="p-6 space-y-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800">รายการ Scan ของฉัน</h1>

      <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3">
        <HeaderFiltersDateRange startDate={dateFrom} endDate={dateTo} onStartDateChange={setDateFrom} onEndDateChange={setDateTo} />
        <div className="flex gap-2">
          <button onClick={handleSearch}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-lg">search</span>ค้นหา
          </button>
          <button onClick={handleReset}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-lg">restart_alt</span>ล้างค่า
          </button>
        </div>
      </div>

      {!hasSearched && (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <span className="material-symbols-outlined text-5xl text-gray-200">calendar_month</span>
          <p className="text-sm font-bold text-gray-400 mt-3">เลือกช่วงวันที่และกดค้นหาเพื่อดูข้อมูล</p>
        </div>
      )}

      {hasSearched && loading && (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 flex justify-center">
          <span className="material-symbols-outlined animate-spin text-4xl text-indigo-500">progress_activity</span>
        </div>
      )}

      {hasSearched && !loading && [...grouped.entries()].map(([key, rows]) => (
        <div key={key} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="bg-indigo-50 px-4 py-2 border-b border-indigo-100">
            <p className="text-sm font-bold text-indigo-700">เดือน {monthLabel(key)}</p>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-2 text-left font-bold text-gray-600 w-36">วันที่</th>
                <th className="px-4 py-2 text-left font-bold text-gray-600">เวลา Scan</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.work_date} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-2 font-bold text-gray-700">{formatThaiDate(row.work_date)}</td>
                  <td className="px-4 py-2 font-bold">
                    {row.scan_times.length === 0
                      ? <span className="text-red-400">-</span>
                      : <span className="text-indigo-600 flex flex-wrap gap-1">
                          {buildScanFlags(row.scan_times, checkTime).map((f, i, arr) => (
                            <span key={i} className={`${f.late ? 'underline' : ''} ${f.earlyLeave ? 'underline decoration-double' : ''}`}>
                              {f.noExit ? `${f.time} ?` : f.time}{i < arr.length - 1 ? ' ,' : ''}
                            </span>
                          ))}
                        </span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
