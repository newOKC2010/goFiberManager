'use client';

import { useRef, useState } from 'react';
import { uploadExcel, UploadResult } from './service/serviceUpload';
import Swal from 'sweetalert2';

export default function UploadPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const ext = f.name.split('.').pop()?.toLowerCase();
    if (ext !== 'xlsx' && ext !== 'xls') {
      Swal.fire({ icon: 'warning', title: '<span style="font-weight:700">ไฟล์ไม่ถูกต้อง</span>', html: '<span style="font-weight:700">กรุณาเลือกไฟล์ Excel (.xlsx หรือ .xls)</span>', confirmButtonColor: '#4f46e5' });
      return;
    }
    setFile(f);
    setResult(null);
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    const res = await uploadExcel(file);
    setLoading(false);
    setResult(res);

    if (res.success) {
      const d = res.data;
      Swal.fire({
        icon: 'success',
        title: 'สำเร็จ',
        html: d
          ? `<div style="font-weight:700;font-size:0.95rem">ทั้งหมด: ${d.total_rows} แถว<br/>สำเร็จ: ${d.processed} &nbsp;|&nbsp; ผิดพลาด: ${d.errors}</div>`
          : `<div style="font-weight:700">${res.message}</div>`,
        confirmButtonColor: '#4f46e5',
      });
      handleReset();
    } else {
      Swal.fire({ icon: 'error', title: '<span style="font-weight:700">อัพโหลดไม่สำเร็จ</span>', html: `<span style="font-weight:700">${res.message}</span>`, confirmButtonColor: '#4f46e5' });
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const statusColor: Record<string, string> = {
    success: 'text-green-600',
    partial: 'text-yellow-600',
    failed: 'text-red-600',
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-1">อัพโหลดข้อมูลการเข้างาน</h1>
      <p className="text-sm text-gray-500 mb-6 font-bold">รองรับไฟล์ Excel (.xlsx, .xls) ที่มีคอลัมน์ A–E</p>

      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center gap-3 cursor-pointer transition-colors
          ${file ? 'border-indigo-400 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'}`}
      >
        <span className={`material-symbols-outlined text-5xl ${file ? 'text-indigo-500' : 'text-gray-400'}`}>
          upload_file
        </span>
        {file ? (
          <p className="font-semibold text-indigo-700">{file.name}</p>
        ) : (
          <p className="text-gray-500 text-sm font-bold">คลิกเพื่อเลือกไฟล์</p>
        )}
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-3 mt-4">
        <button
          onClick={handleUpload}
          disabled={!file || loading}
          className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold disabled:opacity-40 hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
          ) : (
            <span className="material-symbols-outlined text-lg">cloud_upload</span>
          )}
          {loading ? 'กำลังอัพโหลด...' : 'อัพโหลด'}
        </button>
        {file && (
          <button onClick={handleReset} className="px-4 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors">
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        )}
      </div>

      {/* Result */}
      {result?.success && result.data && (
        <div className="mt-6 bg-white rounded-2xl border border-gray-200 p-5 space-y-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-green-500">check_circle</span>
            <span className="font-bold text-gray-800">ผลการอัพโหลด</span>
            <span className={`ml-auto font-bold text-sm ${statusColor[result.data.status] ?? 'text-gray-600'}`}>
              {result.data.status.toUpperCase()}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center text-sm">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-gray-500">แถวทั้งหมด</p>
              <p className="text-xl font-bold text-gray-800">{result.data.total_rows}</p>
            </div>
            <div className="bg-green-50 rounded-xl p-3">
              <p className="text-green-600">สำเร็จ</p>
              <p className="text-xl font-bold text-green-700">{result.data.processed}</p>
            </div>
            <div className="bg-red-50 rounded-xl p-3">
              <p className="text-red-500">ผิดพลาด</p>
              <p className="text-xl font-bold text-red-600">{result.data.errors}</p>
            </div>
          </div>
          <p className="text-xs text-gray-400 truncate">ไฟล์: {result.data.file_name}</p>
        </div>
      )}

      {/* Column guide */}
      <div className="mt-6 bg-blue-50 rounded-2xl p-4">
        <p className="text-xs font-bold text-blue-700 mb-2">รูปแบบ Excel ที่รองรับ</p>
        <div className="grid grid-cols-5 gap-1 text-xs text-center font-bold">
          {[['A', 'รหัส HR'], ['B', 'ชื่อ-สกุล'], ['C', 'แผนก'], ['D', 'วันที่'], ['E', 'เวลา']].map(([col, label]) => (
            <div key={col} className="bg-white rounded-lg p-2">
              <p className="font-bold text-blue-600">{col}</p>
              <p className="text-gray-600">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
