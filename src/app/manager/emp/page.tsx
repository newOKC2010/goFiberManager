'use client';
import { useCallback, useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import Table from '@/components/table/mainTable';
import Pagination from '@/components/pagination/mainPagination';
import Dropdown from '@/components/dropdown/mainDropdown';
import { InputText } from '@/components/input/text/mainInputText';
import { Modal } from '@/components/modal/mainModal';
import { fetchEmpList, fetchDepartments, updateEmpCID, EmpUser, Department, EmpListParams } from './service/serviceEmp';
import HeaderFiltersDateRange from '@/components/dataPicker/headerFiltersDateRange';
import { printEmpReport } from './utils/printReport';
import CidInput from '@/components/input/cid/mainInputCID';

const LIMIT_OPTIONS = [
  { value: '5', label: '5 รายการ' },
  { value: '10', label: '10 รายการ' },
  { value: '0', label: 'ทั้งหมด' },
];

const CID_OPTIONS = [
  { value: '', label: 'ทั้งหมด' },
  { value: 'true', label: 'มี CID' },
  { value: 'false', label: 'ยังไม่มี CID' },
];

export default function EmpPage() {
  const [data, setData] = useState<EmpUser[]>([]);
  const [depts, setDepts] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);

  const [nameInput, setNameInput] = useState('');
  const [deptID, setDeptID] = useState('');
  const [hasCid, setHasCid] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [limit, setLimit] = useState('10');
  const [pagination, setPagination] = useState({ total_count: 0, total_pages: 1, current_page: 1 });

  const [viewRecord, setViewRecord] = useState<EmpUser | null>(null);
  const [editRecord, setEditRecord] = useState<EmpUser | null>(null);
  const [cidInput, setCidInput] = useState('');
  const [searchedFilter, setSearchedFilter] = useState(false);

  const deptOptions = [
    { value: '', label: 'ทุกแผนก' },
    ...depts.map(d => ({ value: String(d.id), label: d.name })),
  ];

  const load = useCallback(async (params: EmpListParams) => {
    setLoading(true);
    try {
      const res = await fetchEmpList(params);
      setData(res.data ?? []);
      setPagination({ total_count: res.total_count, total_pages: res.total_pages, current_page: res.current_page });
    } catch { setData([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchDepartments().then(setDepts).catch(() => {});
    load({ page: 1, limit: 10 });
  }, [load]);

  const currentParams = (): EmpListParams => ({
    page: pagination.current_page,
    limit: Number(limit),
    name: nameInput,
    dept_id: deptID ? Number(deptID) : undefined,
    has_cid: hasCid || undefined,
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
    setSearchedFilter(!!(nameInput || deptID || hasCid || dateFrom || dateTo));
    load({ ...currentParams(), page: 1 });
  };
  const handlePageChange = (page: number) => load({ ...currentParams(), page });
  const handleLimitChange = (val: string) => {
    setLimit(val);
    load({ ...currentParams(), limit: Number(val), page: 1 });
  };
  const handleReset = () => {
    setNameInput(''); setDeptID(''); setHasCid(''); setDateFrom(''); setDateTo(''); setLimit('10');
    setSearchedFilter(false);
    load({ page: 1, limit: 10 });
  };

  const handleEditOpen = (emp: EmpUser) => {
    setCidInput(emp.cid ?? '');
    setEditRecord(emp);
  };

  const handleEditSave = async () => {
    if (!editRecord) return;
    if (cidInput.length !== 13) {
      await Swal.fire({
        icon: 'warning',
        title: '<span style="font-weight:700">CID ไม่ถูกต้อง</span>',
        html: '<span style="font-weight:700">กรุณากรอกเลขบัตรประชาชน 13 หลักให้ครบ</span>',
      });
      return;
    }
    try {
      await updateEmpCID(editRecord.hr_emp_id, cidInput);
      await Swal.fire({
        icon: 'success',
        title: '<span style="font-weight:700">อัพเดท CID สำเร็จ</span>',
        timer: 1500, showConfirmButton: false,
      });
      setEditRecord(null);
      load({ ...currentParams() });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'เกิดข้อผิดพลาด';
      await Swal.fire({
        icon: 'error',
        title: '<span style="font-weight:700">ผิดพลาด</span>',
        html: `<span style="font-weight:700">${msg}</span>`,
      });
    }
  };

  const [printing, setPrinting] = useState(false);
  const handlePrint = async () => {
    setPrinting(true);
    try {
      const res = await fetchEmpList({ ...currentParams(), page: 1, limit: 0 });
      printEmpReport(res.data ?? [], dateFrom || undefined, dateTo || undefined);
    } finally { setPrinting(false); }
  };

  const columns = [
    { key: 'hr_emp_id', label: 'รหัส HR' },
    { key: 'full_name', label: 'ชื่อ-นามสกุล' },
    { key: 'dept_name', label: 'แผนก', render: (e: EmpUser) => e.dept_name ?? '-' },
    {
      key: 'cid', label: 'CID',
      render: (e: EmpUser) => e.cid
        ? <span className="text-green-600 font-bold">{e.cid}</span>
        : <span className="text-gray-400 font-bold">ยังไม่มี</span>,
    },
    {
      key: 'work_date', label: 'วันที่ล่าสุด',
      render: (e: EmpUser) => e.work_date
        ? <span className="font-bold text-indigo-600">{e.work_date}</span>
        : <span className="text-gray-400 font-bold">-</span>,
    },
    {
      key: 'scan_times', label: 'Scan',
      render: (e: EmpUser) => e.work_date
        ? <span className="text-xs font-bold text-indigo-500">{e.scan_times?.length ?? 0} ครั้ง</span>
        : <span className="text-gray-400 font-bold">-</span>,
    },
  ];

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">รายชื่อพนักงาน</h1>

      <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <InputText label="ค้นหาชื่อ" value={nameInput} onChange={(e) => setNameInput(e.target.value)} placeholder="ชื่อ หรือ นามสกุล" icon="search" />
          <Dropdown label="แผนก" icon="business" options={deptOptions} value={deptID} onChange={setDeptID} searchable />
          <Dropdown label="สถานะ CID" icon="badge" options={CID_OPTIONS} value={hasCid} onChange={setHasCid} />
          <Dropdown label="แสดงต่อหน้า" icon="format_list_numbered" options={LIMIT_OPTIONS} value={limit} onChange={handleLimitChange} />
        </div>

        <HeaderFiltersDateRange
          startDate={dateFrom}
          endDate={dateTo}
          onStartDateChange={setDateFrom}
          onEndDateChange={setDateTo}
        />

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

      <div className="flex justify-end">
        <button onClick={handlePrint} disabled={!searchedFilter || data.length === 0 || printing}
          className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white font-bold rounded-xl hover:bg-violet-700 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
          <span className="material-symbols-outlined text-lg">print</span>
          {printing ? 'กำลังเตรียมข้อมูล...' : 'พิมพ์รายงาน'}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <Table
          columns={columns}
          data={data}
          loading={loading}
          getItemId={(e) => `${e.hr_emp_id}_${e.work_date ?? ''}`}
          onView={(e) => e.work_date && setViewRecord(e)}
          onEdit={(e) => handleEditOpen(e)}
        />
      </div>

      <Pagination
        paginationData={{ count: data.length, ...pagination }}
        onPageChange={handlePageChange}
        loading={loading}
      />

      {/* Modal scan times */}
      <Modal isOpen={!!viewRecord} onClose={() => setViewRecord(null)} title="รายการ Scan">
        {viewRecord && (
          <div className="space-y-3">
            <div className="bg-gray-50 rounded-xl p-3 space-y-1">
              <p className="text-sm font-bold text-gray-800">{viewRecord.full_name}</p>
              <p className="text-xs font-bold text-gray-500">{viewRecord.dept_name ?? '-'} · รหัส {viewRecord.hr_emp_id}</p>
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

      {/* Modal Edit CID */}
      <Modal isOpen={!!editRecord} onClose={() => setEditRecord(null)} title="แก้ไขเลขบัตรประชาชน">
        {editRecord && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-3 space-y-1">
              <p className="text-sm font-bold text-gray-800">{editRecord.full_name}</p>
              <p className="text-xs font-bold text-gray-500">{editRecord.dept_name ?? '-'} · รหัส {editRecord.hr_emp_id}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-bold text-gray-700">เลขบัตรประชาชน (13 หลัก)</p>
              <CidInput value={cidInput} onChange={setCidInput} size="md" />
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={handleEditSave}
                className="flex-1 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 cursor-pointer transition-colors">
                บันทึก
              </button>
              <button onClick={() => setEditRecord(null)}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 cursor-pointer transition-colors">
                ยกเลิก
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
