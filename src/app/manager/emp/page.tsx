'use client';

import { useCallback, useEffect, useState } from 'react';
import Table from '@/components/table/mainTable';
import Pagination from '@/components/pagination/mainPagination';
import Dropdown from '@/components/dropdown/mainDropdown';
import { InputText } from '@/components/input/text/mainInputText';
import {
  fetchEmpList, fetchDepartments,
  EmpUser, Department, EmpListParams,
} from './service/serviceEmp';

const LIMIT_OPTIONS = [
  { value: '5', label: '5 รายการ' },
  { value: '10', label: '10 รายการ' },
  { value: '0', label: 'ทั้งหมด' },
];

const CID_OPTIONS = [
  { value: '', label: 'ทั้งหมด' },
  { value: 'true', label: 'มี CID' },
  { value: 'false', label: 'ไม่มี CID' },
];

export default function EmpPage() {
  const [data, setData] = useState<EmpUser[]>([]);
  const [depts, setDepts] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);

  const [nameInput, setNameInput] = useState('');
  const [deptID, setDeptID] = useState('');
  const [hasCID, setHasCID] = useState('');
  const [limit, setLimit] = useState('10');

  const [pagination, setPagination] = useState({
    total_count: 0, total_pages: 1, current_page: 1,
  });

  const deptOptions = [
    { value: '', label: 'ทุกแผนก' },
    ...depts.map(d => ({ value: String(d.id), label: d.name })),
  ];

  const load = useCallback(async (params: EmpListParams) => {
    setLoading(true);
    try {
      const res = await fetchEmpList(params);
      setData(res.data ?? []);
      setPagination({
        total_count: res.total_count,
        total_pages: res.total_pages,
        current_page: res.current_page,
      });
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDepartments().then(setDepts).catch(() => {});
    load({ page: 1, limit: 10 });
  }, [load]);

  const handleSearch = () => {
    load({
      page: 1,
      limit: Number(limit),
      name: nameInput,
      dept_id: deptID ? Number(deptID) : undefined,
      has_cid: hasCID || undefined,
    });
  };

  const handlePageChange = (page: number) => {
    load({
      page,
      limit: Number(limit),
      name: nameInput,
      dept_id: deptID ? Number(deptID) : undefined,
      has_cid: hasCID || undefined,
    });
  };

  const columns = [
    { key: 'hr_emp_id', label: 'รหัส HR' },
    { key: 'full_name', label: 'ชื่อ-นามสกุล' },
    { key: 'dept_name', label: 'แผนก', render: (e: EmpUser) => e.dept_name ?? '-' },
    {
      key: 'cid', label: 'CID', render: (e: EmpUser) => e.cid
        ? <span className="text-green-600 font-bold">{e.cid}</span>
        : <span className="text-gray-400 text-xs">ยังไม่มี</span>,
    },
  ];

  const paginationData = {
    count: data.length,
    total_count: pagination.total_count,
    total_pages: pagination.total_pages,
    current_page: pagination.current_page,
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">จัดการพนักงาน</h1>

      {/* Filter bar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <InputText
            label="ค้นหาชื่อ"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="ชื่อ หรือ นามสกุล"
            icon="search"
          />
          <Dropdown
            label="แผนก"
            icon="business"
            options={deptOptions}
            value={deptID}
            onChange={setDeptID}
            searchable
          />
          <Dropdown
            label="สถานะ CID"
            icon="badge"
            options={CID_OPTIONS}
            value={hasCID}
            onChange={setHasCID}
          />
          <Dropdown
            label="แสดงต่อหน้า"
            icon="format_list_numbered"
            options={LIMIT_OPTIONS}
            value={limit}
            onChange={setLimit}
          />
        </div>
        <button
          onClick={handleSearch}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-lg">search</span>
          ค้นหา
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <Table
          columns={columns}
          data={data}
          loading={loading}
          getItemId={(e) => e.hr_emp_id}
          onEdit={(e) => console.log('edit', e)}
          onPrint={(e) => window.print()}
        />
      </div>

      {/* Pagination */}
      <Pagination
        paginationData={paginationData}
        onPageChange={handlePageChange}
        loading={loading}
      />
    </div>
  );
}
