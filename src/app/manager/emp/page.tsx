'use client';
import { useCallback, useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import Table from '@/components/table/mainTable';
import Pagination from '@/components/pagination/mainPagination';
import Dropdown from '@/components/dropdown/mainDropdown';
import AutocompleteInput from '@/components/input/autocomplete/AutocompleteInput';
import { Modal } from '@/components/modal/mainModal';
import { fetchEmpList, fetchDepartments, updateEmpCID, EmpUser, Department, EmpListParams } from './service/serviceEmp';
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
];

export default function EmpPage() {
  const [data, setData] = useState<EmpUser[]>([]);
  const [depts, setDepts] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);

  const [nameInput, setNameInput] = useState('');
  const [deptID, setDeptID] = useState('');
  const [hasCid, setHasCid] = useState('');
  const [limit, setLimit] = useState('10');
  const [pagination, setPagination] = useState({ total_count: 0, total_pages: 1, current_page: 1 });
  const [editRecord, setEditRecord] = useState<EmpUser | null>(null);
  const [cidInput, setCidInput] = useState('');

  const deptOptions = [
    { value: '', label: 'ทุกแผนก' },
    ...depts.map(d => ({ value: String(d.id), label: d.name })),
  ];

  const currentParams = (page = pagination.current_page): EmpListParams => ({
    page, limit: Number(limit),
    name: nameInput || undefined,
    dept_id: deptID ? Number(deptID) : undefined,
    has_cid: hasCid || undefined,
  });

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

  const handleSearch = () => load({ ...currentParams(), page: 1 });
  const handlePageChange = (page: number) => load({ ...currentParams(page) });
  const handleLimitChange = (val: string) => { setLimit(val); load({ ...currentParams(1), limit: Number(val) }); };
  const handleReset = () => {
    setNameInput(''); setDeptID(''); setHasCid(''); setLimit('10');
    load({ page: 1, limit: 10 });
  };

  const handleEditOpen = (emp: EmpUser) => { setCidInput(emp.cid ?? ''); setEditRecord(emp); };
  const handleEditSave = async () => {
    if (!editRecord) return;
    if (cidInput.length !== 13) {
      await Swal.fire({ icon: 'warning', title: '<b>CID ไม่ถูกต้อง</b>', html: '<b>กรุณากรอกเลขบัตรประชาชน 13 หลักให้ครบ</b>' });
      return;
    }
    try {
      await updateEmpCID(editRecord.hr_emp_id, cidInput);
      await Swal.fire({ icon: 'success', title: '<b>อัพเดท CID สำเร็จ</b>', timer: 1500, showConfirmButton: false });
      setEditRecord(null);
      load(currentParams());
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'เกิดข้อผิดพลาด';
      await Swal.fire({ icon: 'error', title: '<b>ผิดพลาด</b>', html: `<b>${msg}</b>` });
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">รายชื่อพนักงาน</h1>

      <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <AutocompleteInput label="ค้นหาชื่อ" value={nameInput} onChange={setNameInput} placeholder="ชื่อ หรือ นามสกุล" icon="search" />
          <Dropdown label="แผนก" icon="business" options={deptOptions} value={deptID} onChange={setDeptID} searchable />
          <Dropdown label="สถานะ CID" icon="badge" options={CID_OPTIONS} value={hasCid} onChange={setHasCid} />
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
          data={data}
          loading={loading}
          getItemId={(e) => e.hr_emp_id}
          onEdit={(e) => handleEditOpen(e)}
        />
      </div>

      <Pagination
        paginationData={{ count: data.length, ...pagination }}
        onPageChange={handlePageChange}
        loading={loading}
      />

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
