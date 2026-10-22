'use client';

import { useCallback, useEffect, useState } from 'react';
import Table from '@/components/table/mainTable';
import Pagination from '@/components/pagination/mainPagination';
import Dropdown from '@/components/dropdown/mainDropdown';
import { InputText } from '@/components/input/text/mainInputText';
import Swal from 'sweetalert2';
import { fetchManageList, toggleEmpStatus, EmpManage } from './service/serviceManage';
import { fetchDepartments, Department } from '../service/serviceEmp';

const LIMIT_OPTIONS = [
  { value: '5', label: '5 รายการ' },
  { value: '10', label: '10 รายการ' },
  { value: '0', label: 'ทั้งหมด' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'ทุกสถานะ' },
  { value: 'true', label: 'ทำงานอยู่' },
  { value: 'false', label: 'ออกแล้ว' },
];

export default function EmpManagePage() {
  const [data, setData] = useState<EmpManage[]>([]);
  const [depts, setDepts] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);

  const [nameInput, setNameInput] = useState('');
  const [deptID, setDeptID] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [limit, setLimit] = useState('10');
  const [pagination, setPagination] = useState({ total_count: 0, total_pages: 1, current_page: 1 });

  const deptOptions = [
    { value: '', label: 'ทุกแผนก' },
    ...depts.map(d => ({ value: String(d.id), label: d.name })),
  ];

  const load = useCallback(async (params: { page: number; limit: number; name?: string; dept_id?: number }) => {
    setLoading(true);
    try {
      const res = await fetchManageList(params);
      setData(res.data ?? []);
      setPagination({ total_count: res.total_count, total_pages: res.total_pages, current_page: res.current_page });
    } catch { setData([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchDepartments().then(setDepts).catch(() => {});
    load({ page: 1, limit: 10 });
  }, [load]);

  const currentParams = () => ({
    page: pagination.current_page,
    limit: Number(limit),
    name: nameInput,
    dept_id: deptID ? Number(deptID) : undefined,
    status: statusFilter || undefined,
  });

  const handleSearch = () => load({ ...currentParams(), page: 1 });
  const handlePageChange = (page: number) => load({ ...currentParams(), page });

  const handleToggle = async (emp: EmpManage) => {
    const action = emp.status ? 'ปลดออก' : 'กลับเข้างาน';
    const { isConfirmed } = await Swal.fire({
      title: `<span style="font-weight:700">ยืนยัน${action}?</span>`,
      html: `<span style="font-weight:700">${emp.full_name}</span>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ยืนยัน',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: emp.status ? '#dc2626' : '#4f46e5',
    });
    if (!isConfirmed) return;
    try {
      await toggleEmpStatus(emp.hr_emp_id);
      load({ ...currentParams() });
    } catch (e: any) {
      Swal.fire({ icon: 'error', title: '<span style="font-weight:700">ไม่สำเร็จ</span>', html: `<span style="font-weight:700">${e.message}</span>`, confirmButtonColor: '#4f46e5' });
    }
  };

  const columns = [
    { key: 'hr_emp_id', label: 'รหัส HR' },
    { key: 'full_name', label: 'ชื่อ-นามสกุล' },
    { key: 'dept_name', label: 'แผนก', render: (e: EmpManage) => e.dept_name ?? '-' },
    {
      key: 'status', label: 'สถานะ', render: (e: EmpManage) => e.status
        ? <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">ทำงานอยู่</span>
        : <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-bold rounded-full">ออกแล้ว</span>,
    },
  ];

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">จัดการสถานะพนักงาน</h1>

      <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <InputText
            label="ค้นหาชื่อ"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="ชื่อ หรือ นามสกุล"
            icon="search"
          />
          <Dropdown label="แผนก" icon="business" options={deptOptions} value={deptID} onChange={setDeptID} searchable />
          <Dropdown label="สถานะ" icon="toggle_on" options={STATUS_OPTIONS} value={statusFilter} onChange={setStatusFilter} />
          <Dropdown label="แสดงต่อหน้า" icon="format_list_numbered" options={LIMIT_OPTIONS} value={limit} onChange={setLimit} />
        </div>
        <button
          onClick={handleSearch}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-lg">search</span>ค้นหา
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <Table
          columns={columns}
          data={data}
          loading={loading}
          getItemId={(e) => e.hr_emp_id}
          onToggleStatus={handleToggle}
          getItemStatus={(e) => e.status}
          toggleBothWays
          activeStatusText="ปลดออก"
          inactiveStatusText="กลับเข้างาน"
        />
      </div>

      <Pagination
        paginationData={{ count: data.length, ...pagination }}
        onPageChange={handlePageChange}
        loading={loading}
      />
    </div>
  );
}
