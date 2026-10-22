'use client';
import { useCallback, useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import Table from '@/components/table/mainTable';
import Pagination from '@/components/pagination/mainPagination';
import Dropdown from '@/components/dropdown/mainDropdown';
import { Modal } from '@/components/modal/mainModal';
import HeaderFiltersDateRange from '@/components/dataPicker/headerFiltersDateRange';
import { fetchMyAttendance, AttendanceRow, AttendanceParams } from './service/serviceUserAttendance';

const LIMIT_OPTIONS = [
  { value: '5', label: '5 รายการ' },
  { value: '10', label: '10 รายการ' },
  { value: '0', label: 'ทั้งหมด' },
];

const columns = [
  { key: 'work_date', label: 'วันที่' },
  { key: 'scan_count', label: 'Scan' },
];

export default function UserAttendancePage() {
  const [data, setData] = useState<AttendanceRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [limit, setLimit] = useState('10');
  const [pagination, setPagination] = useState({ total_count: 0, total_pages: 1, current_page: 1 });
  const [viewRecord, setViewRecord] = useState<AttendanceRow | null>(null);

  const load = useCallback(async (params: AttendanceParams) => {
    setLoading(true);
    try {
      const res = await fetchMyAttendance(params);
      setData(res.data ?? []);
      setPagination({ total_count: res.total_count, total_pages: res.total_pages, current_page: res.current_page });
    } catch { setData([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load({ page: 1, limit: 10 }); }, [load]);

  const currentParams = (): AttendanceParams => ({
    page: pagination.current_page,
    limit: Number(limit),
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
  });

  const handleSearch = () => {
    if (dateFrom && dateTo && dateTo < dateFrom) {
      Swal.fire({
        icon: 'warning',
        title: '<span style="font-weight:700">วันที่ไม่ถูกต้อง</span>',
        html: '<span style="font-weight:700">วันที่สิ้นสุดต้องไม่น้อยกว่าวันที่เริ่มต้น</span>',
      });
      return;
    }
    load({ ...currentParams(), page: 1 });
  };

  const handlePageChange = (page: number) => load({ ...currentParams(), page });
  const handleLimitChange = (val: string) => {
    setLimit(val);
    load({ ...currentParams(), limit: Number(val), page: 1 });
  };
  const handleReset = () => {
    setDateFrom(''); setDateTo(''); setLimit('10');
    load({ page: 1, limit: 10 });
  };

  const tableData = data.map(r => ({ ...r, scan_count: `${r.scan_times.length} ครั้ง` }));

  return (
    <div className="p-6 space-y-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800">รายการ Scan ของฉัน</h1>

      <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-4">
        <div className="flex flex-wrap gap-3 items-end">
          <HeaderFiltersDateRange
            startDate={dateFrom} endDate={dateTo}
            onStartDateChange={setDateFrom} onEndDateChange={setDateTo}
          />
          <Dropdown label="แสดงต่อหน้า" icon="format_list_numbered" options={LIMIT_OPTIONS} value={limit} onChange={handleLimitChange} />
        </div>

        <div className="flex gap-2">
          <button onClick={handleSearch}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-lg">search</span>ค้นหา
          </button>
          <button onClick={handleReset}
            className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-lg">restart_alt</span>ล้างค่า
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <Table
          columns={columns}
          data={tableData}
          loading={loading}
          getItemId={(e) => e.work_date}
          onView={(e) => setViewRecord(data.find(r => r.work_date === e.work_date) ?? null)}
        />
      </div>

      <Pagination
        paginationData={{ count: data.length, ...pagination }}
        onPageChange={handlePageChange}
        loading={loading}
      />

      <Modal isOpen={!!viewRecord} onClose={() => setViewRecord(null)} title="รายการ Scan">
        {viewRecord && (
          <div className="space-y-3">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs font-bold text-indigo-600">วันที่ {viewRecord.work_date}</p>
            </div>
            {viewRecord.scan_times.length === 0 ? (
              <p className="text-center text-sm font-bold text-gray-400 py-4">ไม่มีข้อมูล Scan</p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {viewRecord.scan_times.map((t, i) => (
                  <div key={i} className="bg-indigo-50 rounded-lg p-2 text-center">
                    <p className="text-xs text-gray-500 font-bold">ครั้งที่ {i + 1}</p>
                    <p className="text-base font-bold text-indigo-700">{t}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
