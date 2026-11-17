'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '@/components/sidebar/mainSidebar';
import { checkAuth, UserInfo, AuthToken } from '@/global/globalAuth';
import { API_BASE_URL, API_ENDPOINTS } from '@/global/globalApi';
import { DeptCountContext } from './deptCountContext';

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [unassignedCount, setUnassignedCount] = useState(0);
  const isReady = useRef(false); // ใช้ ref แทน loading ใน deps — ป้องกัน array size เปลี่ยน

  const fetchCount = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.DEPT.UNASSIGNED_COUNT}`, {
        headers: { Authorization: `Bearer ${AuthToken.getToken()}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUnassignedCount(data.count ?? 0);
      }
    } catch { /* ไม่กระทบ layout */ }
  }, []);

  useEffect(() => {
    checkAuth().then(({ success, user }) => {
      if (!success) return router.replace('/auth');
      if (user?.role !== 'admin') return router.replace('/user');
      setUser(user ?? null);
      setLoading(false);
      isReady.current = true;
      fetchCount();
    });
  }, [router, fetchCount]);

  // refetch count ทุกครั้งที่ navigate — deps array คงที่ 2 ตัวเสมอ
  useEffect(() => {
    if (isReady.current) fetchCount();
  }, [pathname, fetchCount]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <span className="material-symbols-outlined animate-spin text-4xl text-indigo-500">progress_activity</span>
    </div>
  );

  return (
    <DeptCountContext.Provider value={{ unassignedCount, refreshCount: fetchCount }}>
      <div className="flex h-screen bg-gray-50">
        <Sidebar user={user} unassignedCount={unassignedCount} />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </DeptCountContext.Provider>
  );
}
