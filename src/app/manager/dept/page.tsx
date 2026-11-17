'use client';
import { useCallback, useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import Table from '@/components/table/mainTable';
import Pagination from '@/components/pagination/mainPagination';
import Dropdown from '@/components/dropdown/mainDropdown';
import { Modal } from '@/components/modal/mainModal';
import { InputText } from '@/components/input/text/mainInputText';
import { fetchDepartments, createDepartment, updateDepartment, Department } from './service/serviceDept';

const LIMIT_OPTIONS = [
  { value: '5', label: '5 รายการ' },
  { value: '10', label: '10 รายการ' },
  { value: '20', label: '20 รายการ' },
  { value: '0', label: 'ทั้งหมด' },
];

const columns = [
  { key: 'id', label: 'รหัส' },
  { key: 'name', label: 'ชื่อแผนก' },
  {
    key: 'emp_count', label: 'จำนวนพนักงาน',
    render: (d: Department) => <span className="font-bold">{d.emp_count} คน</span>,
  },
];

export default function DeptPage() {
  const [data, setData] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ total_count: 0, total_pages: 1, current_page: 1 });
  const [limit, setLimit] = useState('10');

  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState('');

  const [editRecord, setEditRecord] = useState<Department | null>(null);
  const [editName, setEditName] = useState('');

  const load = useCallback(async (page = 1, lim = Number(limit)) => {
    setLoading(true);
    try {
      const res = await fetchDepartments(page, lim);
      setData(res.data ?? []);
      setPagination({ total_count: res.total_count, total_pages: res.total_pages, current_page: res.current_page });
    } catch { setData([]); }
    finally { setLoading(false); }
  }, [limit]);

  useEffect(() => { load(); }, [load]);

  const handleLimitChange = (val: string) => {
    setLimit(val);
    load(1, Number(val));
  };

  const handleAdd = async () => {
    if (!newName.trim()) {
      await Swal.fire({ icon: 'warning', title: '<b>กรุณากรอกชื่อแผนก</b>' });
      return;
    }
    try {
      await createDepartment(newName.trim());
      await Swal.fire({ icon: 'success', title: '<b>เพิ่มแผนกสำเร็จ</b>', timer: 1500, showConfirmButton: false });
      setNewName('');
      setAddOpen(false);
      load(pagination.current_page);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'เกิดข้อผิดพลาด';
      await Swal.fire({ icon: 'error', title: '<b>ผิดพลาด</b>', html: `<b>${msg}</b>` });
    }
  };

  const handleEditOpen = (d: Department) => { setEditName(d.name); setEditRecord(d); };
  const handleEditSave = async () => {
    if (!editRecord) return;
    if (!editName.trim()) {
      await Swal.fire({ icon: 'warning', title: '<b>กรุณากรอกชื่อแผนก</b>' });
      return;
    }
    try {
      await updateDepartment(editRecord.id, editName.trim());
      await Swal.fire({ icon: 'success', title: '<b>แก้ไขแผนกสำเร็จ</b>', timer: 1500, showConfirmButton: false });
      setEditRecord(null);
      load(pagination.current_page);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'เกิดข้อผิดพลาด';
      await Swal.fire({ icon: 'error', title: '<b>ผิดพลาด</b>', html: `<b>${msg}</b>` });
    }
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">จัดการแผนก</h1>
        <button onClick={() => { setNewName(''); setAddOpen(true); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors cursor-pointer">
          <span className="material-symbols-outlined text-lg">add</span>เพิ่มแผนก
        </button>
      </div>

      <div className="w-48">
        <Dropdown
          label="แสดงต่อหน้า"
          icon="format_list_numbered"
          options={LIMIT_OPTIONS}
          value={limit}
          onChange={handleLimitChange}
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <Table
          columns={columns}
          data={data}
          loading={loading}
          getItemId={(d) => d.id}
          onEdit={handleEditOpen}
        />
      </div>

      <Pagination
        paginationData={{ count: data.length, ...pagination }}
        onPageChange={(page) => load(page)}
        loading={loading}
      />

      {/* Modal เพิ่มแผนก */}
      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title="เพิ่มแผนกใหม่">
        <div className="space-y-4">
          <InputText
            label="ชื่อแผนก"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="เช่น แผนกเวชระเบียน"
            icon="business"
            maxWidth="full"
          />
          <div className="flex gap-2 pt-2">
            <button onClick={handleAdd}
              className="flex-1 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 cursor-pointer transition-colors">
              บันทึก
            </button>
            <button onClick={() => setAddOpen(false)}
              className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 cursor-pointer transition-colors">
              ยกเลิก
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal แก้ไขแผนก */}
      <Modal isOpen={!!editRecord} onClose={() => setEditRecord(null)} title="แก้ไขชื่อแผนก">
        {editRecord && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-sm font-bold text-gray-800">{editRecord.name}</p>
              <p className="text-xs font-bold text-gray-500">{editRecord.emp_count} พนักงาน</p>
            </div>
            <InputText
              label="ชื่อแผนกใหม่"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              icon="business"
              maxWidth="full"
            />
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
