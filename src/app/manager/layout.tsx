'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/sidebar/mainSidebar';
import { checkAuth, UserInfo } from '@/global/globalAuth';

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth().then(({ success, user }) => {
      if (!success) return router.replace('/auth');
      if (user?.role !== 'admin') return router.replace('/user');
      setUser(user ?? null);
      setLoading(false);
    });
  }, [router]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <span className="material-symbols-outlined animate-spin text-4xl text-indigo-500">progress_activity</span>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar user={user} />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
