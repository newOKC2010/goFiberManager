'use client';
import { useCallback, useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { useDeptCount } from '@/app/manager/deptCountContext';
import Table from '@/components/table/mainTable';
import Pagination from '@/components/pagination/mainPagination';
import Dropdown from '@/components/dropdown/mainDropdown';
import { Modal } from '@/components/modal/mainModal';
import { fetchEmpByDept, assignDept, EmpDept } from './service/serviceUnassigned';
import { fetchDepartments, Department } from '../service/serviceDept';

const LIMIT_OPTIONS = [
  { value: '5', label: '5 รายการ' },
  { value: '10', label: '10 รายการ' },
  { value: '20', label: '20 รายการ' },
  { value: '0', label: 'ทั้งหมด' },
];

const DEPT_FILTER_OPTIONS = [
  { value: '', label: 'ทั้งหมด' },
  { value: 'unassigned', label: 'ยังไม่มีแผนก' },
  { value: 'assigned', label: 'มีแผนกแล้ว' },
];

const columns = [
  { key: 'hr_emp_id', label: 'รหัส HR' },
  { key: 'full_name', label: 'ชื่อ-นามสกุล' },
  {
    key: 'dept_name', label: 'แผนก',
    render: (e: EmpDept) => e.dept_name
      ? <span className="font-bold">{e.dept_name}</span>
      : <span className="font-bold text-red-500">ยังไม่กำหนดแผนก</span>,
  },
];

export default function UnassignedPage() {
  const { refreshCount } = useDeptCount();
  const [data, setData] = useState<EmpDept[]>([]);
  const [depts, setDepts] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ total_count: 0, total_pages: 1, current_page: 1 });

  const [hrEmpIDInput, setHrEmpIDInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [limit, setLimit] = useState('10');

  const [editRecord, setEditRecord] = useState<EmpDept | null>(null);
  const [selectedDept, setSelectedDept] = useState('');
  const [fullNameInput, setFullNameInput] = useState('');

  const deptOptions = depts.map(d => ({ value: String(d.id), label: d.name }));

  const load = useCallback(async (page = 1, lim = Number(limit), search = searchQuery, filter = deptFilter) => {
    setLoading(true);
    try {
      const res = await fetchEmpByDept(page, lim, search, filter);
      setData(res.data ?? []);
      setPagination({ total_count: res.total_count, total_pages: res.total_pages, current_page: res.current_page });
    } catch { setData([]); }
    finally { setLoading(false); }
  }, [limit, searchQuery, deptFilter]);

  useEffect(() => {
    load();
    fetchDepartments(1, 0).then(res => setDepts(res.data ?? [])).catch(() => {});
  }, [load]);

  const handleSearch = () => setSearchQuery(hrEmpIDInput);
  const handleReset = () => { setHrEmpIDInput(''); setSearchQuery(''); setDeptFilter(''); };
  const handleLimitChange = (val: string) => { setLimit(val); load(1, Number(val), searchQuery, deptFilter); };
  const handleDeptFilter = (val: string) => { setDeptFilter(val); load(1, Number(limit), searchQuery, val); };

  const handleEditOpen = (emp: EmpDept) => {
    const existing = depts.find(d => d.name === emp.dept_name);
    setSelectedDept(existing ? String(existing.id) : '');
    setFullNameInput(emp.full_name);
    setEditRecord(emp);
  };

  const handleAssign = async () => {
    if (!editRecord) return;
    if (!fullNameInput.trim()) {
      await Swal.fire({ icon: 'warning', title: '<b>กรุณากรอกชื่อ-นามสกุล</b>' });
      return;
    }
    if (!selectedDept) {
      await Swal.fire({ icon: 'warning', title: '<b>กรุณาเลือกแผนก</b>' });
      return;
    }
    try {
      await assignDept(editRecord.hr_emp_id, Number(selectedDept), fullNameInput.trim());
      await Swal.fire({ icon: 'success', title: '<b>กำหนดแผนกสำเร็จ</b>', timer: 1500, showConfirmButton: false });
      setEditRecord(null);
      load(pagination.current_page, Number(limit), searchQuery, deptFilter);
      refreshCount();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'เกิดข้อผิดพลาด';
      await Swal.fire({ icon: 'error', title: '<b>ผิดพลาด</b>', html: `<b>${msg}</b>` });
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">จัดการแผนกพนักงาน</h1>

      <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-48 max-w-xs">
            <label className="block text-sm font-bold text-gray-700 mb-2">ค้นหารหัส HR</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg"
                style={{ fontVariationSettings: "'wght' 700" }}>badge</span>
              <input
                value={hrEmpIDInput}
                onChange={e => setHrEmpIDInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="รหัส HR"
                className="w-full pl-10 pr-3 py-2 text-center font-bold text-black bg-transparent border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 placeholder:text-gray-600"
                autoComplete="off"
              />
            </div>
          </div>

          <div className="w-44">
            <Dropdown
              label="สถานะแผนก"
              icon="business"
              options={DEPT_FILTER_OPTIONS}
              value={deptFilter}
              onChange={handleDeptFilter}
            />
          </div>

          <div className="w-40">
            <Dropdown
              label="แสดงต่อหน้า"
              icon="format_list_numbered"
              options={LIMIT_OPTIONS}
              value={limit}
              onChange={handleLimitChange}
            />
          </div>
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
          onEdit={handleEditOpen}
        />
      </div>

      <Pagination
        paginationData={{ count: data.length, ...pagination }}
        onPageChange={(page) => load(page, Number(limit), searchQuery, deptFilter)}
        loading={loading}
      />

      <Modal isOpen={!!editRecord} onClose={() => setEditRecord(null)} title="กำหนด / เปลี่ยนแผนก">
        {editRecord && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-3 space-y-1">
              <p className="text-xs font-bold text-gray-500">
                รหัส {editRecord.hr_emp_id}
                {editRecord.dept_name && <span className="text-indigo-500"> · แผนกปัจจุบัน: {editRecord.dept_name}</span>}
              </p>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">ชื่อ-นามสกุล</label>
              <input
                value={fullNameInput}
                onChange={e => setFullNameInput(e.target.value)}
                placeholder="ชื่อ-นามสกุล"
                className="w-full px-3 py-2 font-bold text-black border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
                autoComplete="off"
              />
            </div>
            <Dropdown
              label="เลือกแผนก"
              icon="business"
              options={deptOptions}
              value={selectedDept}
              onChange={setSelectedDept}
              searchable
            />
            <div className="flex gap-2 pt-2">
              <button onClick={handleAssign}
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
