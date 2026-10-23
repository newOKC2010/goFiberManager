'use client';
import { useCallback, useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import Table from '@/components/table/mainTable';
import Pagination from '@/components/pagination/mainPagination';
import Dropdown from '@/components/dropdown/mainDropdown';
import { InputText } from '@/components/input/text/mainInputText';
import { Modal } from '@/components/modal/mainModal';
import HeaderFiltersDateRange from '@/components/dataPicker/headerFiltersDateRange';
import { fetchReport, ReportRow, ReportParams, Department } from './service/serviceReport';
import { printAttendanceReport } from './utils/printReport';
import { fetchDepartments } from '../service/serviceEmp';

const LIMIT_OPTIONS = [
  { value: '5', label: '5 รายการ' },
  { value: '10', label: '10 รายการ' },
  { value: '0', label: 'ทั้งหมด' },
];

const columns = [
  { key: 'hr_emp_id', label: 'รหัส HR' },
  { key: 'full_name', label: 'ชื่อ-นามสกุล' },
  { key: 'dept_name', label: 'แผนก' },
];

export default function ReportPage() {
  const [data, setData] = useState<ReportRow[]>([]);
  const [depts, setDepts] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [viewRecord, setViewRecord] = useState<ReportRow | null>(null);

  const [nameInput, setNameInput] = useState('');
  const [deptID, setDeptID] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [limit, setLimit] = useState('10');
  const [pagination, setPagination] = useState({ total_count: 0, total_pages: 1, current_page: 1 });
  const [appliedParams, setAppliedParams] = useState<ReportParams | null>(null);

  useEffect(() => { fetchDepartments().then(setDepts).catch(() => {}); }, []);

  const deptOptions = [
    { value: '', label: 'ทุกแผนก' },
    ...depts.map((d: Department) => ({ value: String(d.id), label: d.name })),
  ];

  const load = useCallback(async (params: ReportParams) => {
    setLoading(true);
    try {
      const res = await fetchReport(params);
      setData(res.data ?? []);
      setPagination({ total_count: res.total_count, total_pages: res.total_pages, current_page: res.current_page });
    } catch { setData([]); }
    finally { setLoading(false); }
  }, []);

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

  const handleSearch = () => {
    if (!validateDates()) return;
    const params: ReportParams = {
      date_from: dateFrom, date_to: dateTo,
      name: nameInput || undefined,
      dept_id: deptID ? Number(deptID) : undefined,
      page: 1, limit: Number(limit),
    };
    setAppliedParams(params);
    setHasSearched(true);
    load(params);
  };

  const handlePageChange = (page: number) => {
    if (!appliedParams) return;
    load({ ...appliedParams, page });
  };

  const handleLimitChange = (val: string) => {
    setLimit(val);
    if (appliedParams) {
      const p = { ...appliedParams, limit: Number(val), page: 1 };
      setAppliedParams(p);
      load(p);
    }
  };

  const handleReset = () => {
    setNameInput(''); setDeptID(''); setDateFrom(''); setDateTo(''); setLimit('10');
    setHasSearched(false); setAppliedParams(null); setData([]);
    setPagination({ total_count: 0, total_pages: 1, current_page: 1 });
  };

  const handlePrint = async () => {
    if (!appliedParams) return;
    setPrinting(true);
    try {
      const res = await fetchReport({ ...appliedParams, page: 1, limit: 0 });
      printAttendanceReport(res.data ?? [], appliedParams.date_from, appliedParams.date_to);
    } finally { setPrinting(false); }
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">ตรวจสอบการเข้างาน</h1>

      <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <InputText label="ค้นหาชื่อ" value={nameInput} onChange={(e) => setNameInput(e.target.value)} placeholder="ชื่อ หรือ นามสกุล" icon="search" />
          <Dropdown label="แผนก" icon="business" options={deptOptions} value={deptID} onChange={setDeptID} searchable />
          <Dropdown label="แสดงต่อหน้า" icon="format_list_numbered" options={LIMIT_OPTIONS} value={limit} onChange={handleLimitChange} />
        </div>
        <HeaderFiltersDateRange startDate={dateFrom} endDate={dateTo} onStartDateChange={setDateFrom} onEndDateChange={setDateTo} />
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

      {hasSearched && (
        <div className="flex justify-end">
          <button onClick={handlePrint} disabled={data.length === 0 || printing}
            className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white font-bold rounded-xl hover:bg-violet-700 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
            <span className="material-symbols-outlined text-lg">print</span>
            {printing ? 'กำลังเตรียมข้อมูล...' : 'พิมพ์รายงาน'}
          </button>
        </div>
      )}

      {hasSearched ? (
        <>
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <Table
              columns={columns}
              data={data}
              loading={loading}
              getItemId={(e) => e.hr_emp_id}
              onView={(e) => setViewRecord(e)}
            />
          </div>
          <Pagination
            paginationData={{ count: data.length, ...pagination }}
            onPageChange={handlePageChange}
            loading={loading}
          />
        </>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <span className="material-symbols-outlined text-5xl text-gray-200">calendar_month</span>
          <p className="text-sm font-bold text-gray-400 mt-3">เลือกช่วงวันที่และกดค้นหาเพื่อดูข้อมูล</p>
        </div>
      )}

      {/* Modal view dates */}
      <Modal isOpen={!!viewRecord} onClose={() => setViewRecord(null)} title="รายการการเข้างาน">
        {viewRecord && (
          <div className="space-y-3">
            <div className="bg-gray-50 rounded-xl p-3 space-y-1">
              <p className="text-sm font-bold text-gray-800">{viewRecord.full_name}</p>
              <p className="text-xs font-bold text-gray-500">{viewRecord.dept_name} · รหัส {viewRecord.hr_emp_id}</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-2 text-left font-bold text-gray-600 w-36">วันที่</th>
                    <th className="px-4 py-2 text-left font-bold text-gray-600">เวลา Scan</th>
                  </tr>
                </thead>
                <tbody>
                  {viewRecord.dates.map(dr => (
                    <tr key={dr.date} className="border-b border-gray-50">
                      <td className="px-4 py-2 font-bold text-gray-700">{dr.date}</td>
                      <td className="px-4 py-2 font-bold">
                        {dr.scan_times.length > 0
                          ? <span className="text-indigo-600">{dr.scan_times.join(' , ')}</span>
                          : <span className="text-red-400 font-bold">-</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
